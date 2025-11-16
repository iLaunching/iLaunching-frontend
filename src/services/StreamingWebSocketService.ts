/**
 * StreamingWebSocketService
 * 
 * Manages WebSocket connection to sales-api-minimal for content streaming.
 * Handles connection lifecycle, reconnection, and message parsing.
 */

export interface StreamConfig {
  content: string;
  content_type: 'text' | 'html' | 'markdown';
  speed: 'slow' | 'normal' | 'fast' | 'superfast' | 'adaptive';
  chunk_by: 'character' | 'word' | 'sentence';
  turnId?: string;
  timestamp?: string;
  responseId?: string;
}

export interface StreamChunk {
  type: 'chunk';
  data: string;
  index: number;
  total: number;
  timestamp: string;
}

export interface StreamMetadata {
  complexity: 'low' | 'medium' | 'high';
  word_count: number;
  has_html: boolean;
  speed_used: string;
}

export interface StreamStartMessage {
  type: 'stream_start';
  total_chunks: number;
  content_type: string;
  metadata: StreamMetadata;
  timestamp: string;
}

export interface StreamCompleteMessage {
  type: 'stream_complete';
  total_chunks: number;
  metadata: any;
  timestamp: string;
}

export interface StreamErrorMessage {
  type: 'error';
  message: string;
}

type StreamMessage = 
  | { type: 'connected'; session_id: string; timestamp: string }
  | StreamStartMessage
  | StreamChunk
  | StreamCompleteMessage
  | StreamErrorMessage
  | { type: 'stream_paused'; timestamp: string }
  | { type: 'stream_resumed'; timestamp: string }
  | { type: 'stream_skipped'; timestamp: string }
  | { type: 'pong'; timestamp: string };

export interface StreamCallbacks {
  onConnected?: (sessionId: string) => void;
  onStreamStart?: (message: StreamStartMessage) => void;
  onChunk?: (chunk: StreamChunk) => void;
  onStreamComplete?: (message: StreamCompleteMessage) => void;
  onStreamPaused?: () => void;
  onStreamResumed?: () => void;
  onStreamSkipped?: () => void;
  onError?: (error: string) => void;
  onDisconnect?: () => void;
}

export class StreamingWebSocketService {
  private ws: WebSocket | null = null;
  private sessionId: string;
  private wsUrl: string;
  private callbacks: StreamCallbacks = {};
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second
  private pingInterval: NodeJS.Timeout | null = null;
  private isIntentionallyClosed = false;

  constructor(sessionId: string, apiUrl?: string) {
    this.sessionId = sessionId;
    
    // Default to production API or use provided URL
    const baseUrl = apiUrl || import.meta.env.VITE_SALES_WS_URL || 'wss://sales-api-production-3088.up.railway.app';
    this.wsUrl = `${baseUrl}/ws/stream/${sessionId}`;
  }

  /**
   * Connect to WebSocket server
   */
  connect(callbacks: StreamCallbacks): Promise<void> {
    this.callbacks = callbacks;
    this.isIntentionallyClosed = false;

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected:', this.sessionId);
          this.reconnectAttempts = 0;
          this.startPingInterval();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            console.log('📥 Received message:', event.data);
            const message: StreamMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error, 'Raw data:', event.data);
            this.callbacks.onError?.('Invalid message format');
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.callbacks.onError?.('WebSocket connection error');
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket closed');
          this.stopPingInterval();
          this.callbacks.onDisconnect?.();
          
          // Attempt reconnection if not intentionally closed
          if (!this.isIntentionallyClosed && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.attemptReconnect();
          }
        };
      } catch (error) {
        console.error('Failed to create WebSocket:', error);
        reject(error);
      }
    });
  }

  /**
   * Handle incoming WebSocket messages
   */
  private handleMessage(message: StreamMessage): void {
    switch (message.type) {
      case 'connected':
        this.callbacks.onConnected?.(message.session_id);
        break;
      
      case 'stream_start':
        this.callbacks.onStreamStart?.(message);
        break;
      
      case 'chunk':
        this.callbacks.onChunk?.(message);
        break;
      
      case 'stream_complete':
        this.callbacks.onStreamComplete?.(message);
        break;
      
      case 'stream_paused':
        this.callbacks.onStreamPaused?.();
        break;
      
      case 'stream_resumed':
        this.callbacks.onStreamResumed?.();
        break;
      
      case 'stream_skipped':
        this.callbacks.onStreamSkipped?.();
        break;
      
      case 'error':
        this.callbacks.onError?.(message.message);
        break;
      
      case 'pong':
        // Keep-alive response
        break;
      
      default:
        console.warn('Unknown message type:', (message as any).type);
    }
  }

  /**
   * Send stream request to API
   */
  streamContent(config: StreamConfig): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }

    const message = {
      type: 'stream_request',
      test_mode: true,  // Enable test mode by default
      ...config
    };
    
    console.log('📤 Sending stream request:', message);
    this.ws.send(JSON.stringify(message));
  }

  /**
   * Pause current stream
   */
  pauseStream(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }

    console.log('⏸️ Pausing stream');
    this.ws.send(JSON.stringify({
      type: 'stream_control',
      action: 'pause'
    }));
  }

  /**
   * Resume paused stream
   */
  resumeStream(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }

    console.log('▶️ Resuming stream');
    this.ws.send(JSON.stringify({
      type: 'stream_control',
      action: 'resume'
    }));
  }

  /**
   * Skip to end of current stream
   */
  skipStream(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket is not connected');
    }

    console.log('⏭️ Skipping stream');
    this.ws.send(JSON.stringify({
      type: 'stream_control',
      action: 'skip'
    }));
  }

  /**
   * Start ping interval to keep connection alive
   */
  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000); // Ping every 30 seconds
  }

  /**
   * Stop ping interval
   */
  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
    
    setTimeout(() => {
      if (!this.isIntentionallyClosed) {
        this.connect(this.callbacks).catch(error => {
          console.error('Reconnection failed:', error);
        });
      }
    }, delay);
  }

  /**
   * Close WebSocket connection
   */
  disconnect(): void {
    this.isIntentionallyClosed = true;
    this.stopPingInterval();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  /**
   * Get connection state
   */
  getState(): number {
    return this.ws?.readyState ?? WebSocket.CLOSED;
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}
