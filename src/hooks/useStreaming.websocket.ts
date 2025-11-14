/**
 * useStreaming Hook - WebSocket Integration
 * 
 * Connects to sales-api-minimal streaming API
 * Manages queue and receives pre-processed chunks
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import { StreamingWebSocketService } from '../services/StreamingWebSocketService';
import type { 
  StreamConfig, 
  StreamChunk,
  StreamStartMessage,
  StreamCompleteMessage
} from '../services/StreamingWebSocketService';

interface UseStreamingOptions {
  apiUrl?: string;
  onError?: (error: string) => void;
  onStreamStart?: (message: StreamStartMessage) => void;
  onStreamComplete?: (message: StreamCompleteMessage) => void;
}

interface StreamRequest {
  id: string;
  content: string;
  config: Omit<StreamConfig, 'content'>;
}

export const useStreaming = (editor: Editor | null, options: UseStreamingOptions = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStreamId, setCurrentStreamId] = useState<string | null>(null);
  const [queue, setQueue] = useState<StreamRequest[]>([]);
  
  const wsServiceRef = useRef<StreamingWebSocketService | null>(null);
  const isProcessingRef = useRef(false);

  /**
   * Connect to WebSocket - only when editor is ready
   */
  const connect = useCallback(async () => {
    if (!editor) {
      console.warn('⚠️ Editor not ready yet, cannot connect');
      return;
    }

    if (wsServiceRef.current?.isConnected()) {
      console.log('Already connected');
      return;
    }

    try {
      const sessionId = `session-${Date.now()}`;
      const service = new StreamingWebSocketService(sessionId, options.apiUrl);
      
      console.log('🔌 Connecting to WebSocket... Editor ready:', !!editor);
      
      await service.connect({
        onConnected: (sessionId) => {
          console.log('✅ Connected to streaming API:', sessionId);
          setIsConnected(true);
        },
        
        onStreamStart: (message: StreamStartMessage) => {
          console.log('📡 Stream started:', message.metadata);
          setIsStreaming(true);
          setIsPaused(false);
          options.onStreamStart?.(message);
        },
        
        onChunk: (chunk: StreamChunk) => {
          console.log('📦 Chunk:', chunk.data);
          
          // Insert chunk directly into editor
          if (editor && !editor.isDestroyed) {
            editor.commands.insertStreamChunk(chunk.data, true);
          } else {
            console.error('❌ Editor not available!');
          }
        },
        
        onStreamComplete: (message: StreamCompleteMessage) => {
          console.log('🏁 Stream completed');
          setIsStreaming(false);
          setIsPaused(false);
          setCurrentStreamId(null);
          
          // Clear stream buffer
          if (editor && !editor.isDestroyed) {
            editor.commands.clearStreamBuffer();
          }
          
          options.onStreamComplete?.(message);
          
          // Process next in queue
          isProcessingRef.current = false;
          processQueue();
        },
        
        onStreamPaused: () => {
          console.log('⏸️ Stream paused');
          setIsPaused(true);
        },
        
        onStreamResumed: () => {
          console.log('▶️ Stream resumed');
          setIsPaused(false);
        },
        
        onStreamSkipped: () => {
          console.log('⏭️ Stream skipped');
          setIsPaused(false);
        },
        
        onError: (error: string) => {
          console.error('❌ Streaming error:', error);
          setIsStreaming(false);
          setCurrentStreamId(null);
          isProcessingRef.current = false;
          options.onError?.(error);
        },
        
        onDisconnect: () => {
          console.log('🔌 Disconnected from streaming API');
          setIsConnected(false);
          setIsStreaming(false);
        }
      });
      
      wsServiceRef.current = service;
    } catch (error) {
      console.error('Failed to connect:', error);
      options.onError?.('Connection failed');
    }
  }, [editor, options]);

  /**
   * Add content to streaming queue
   */
  const addToQueue = useCallback((
    content: string,
    config: Partial<Omit<StreamConfig, 'content'>> = {}
  ) => {
    const streamRequest: StreamRequest = {
      id: `stream-${Date.now()}-${Math.random()}`,
      content,
      config: {
        content_type: config.content_type || 'text',
        speed: config.speed || 'normal',
        chunk_by: config.chunk_by || 'word'
      }
    };

    setQueue(prev => [...prev, streamRequest]);
    
    // Auto-process if not already streaming
    if (!isProcessingRef.current) {
      processQueue();
    }
  }, []);

  /**
   * Process queue
   */
  const processQueue = useCallback(() => {
    if (isProcessingRef.current || !wsServiceRef.current?.isConnected()) return;
    
    setQueue(prev => {
      if (prev.length === 0) return prev;
      
      const [next, ...rest] = prev;
      
      // Mark as processing
      isProcessingRef.current = true;
      setCurrentStreamId(next.id);
      
      // Send stream request to API
      try {
        wsServiceRef.current!.streamContent({
          content: next.content,
          ...next.config
        });
      } catch (error) {
        console.error('Failed to send stream request:', error);
        isProcessingRef.current = false;
        options.onError?.('Failed to stream content');
      }
      
      return rest;
    });
  }, [options]);

  /**
   * Clear queue
   */
  const clearQueue = useCallback(() => {
    setQueue([]);
    isProcessingRef.current = false;
  }, []);

  /**
   * Disconnect
   */
  const disconnect = useCallback(() => {
    wsServiceRef.current?.disconnect();
    wsServiceRef.current = null;
    setIsConnected(false);
    setIsStreaming(false);
    clearQueue();
  }, [clearQueue]);

  /**
   * Pause current stream
   */
  const pauseStream = useCallback(() => {
    if (wsServiceRef.current && isStreaming) {
      wsServiceRef.current.pauseStream();
    }
  }, [isStreaming]);

  /**
   * Resume paused stream
   */
  const resumeStream = useCallback(() => {
    if (wsServiceRef.current && isStreaming) {
      wsServiceRef.current.resumeStream();
    }
  }, [isStreaming]);

  /**
   * Skip to end of current stream
   */
  const skipStream = useCallback(() => {
    if (wsServiceRef.current && isStreaming) {
      wsServiceRef.current.skipStream();
    }
  }, [isStreaming]);

  /**
   * Auto-connect when editor becomes available
   */
  useEffect(() => {
    if (editor && !wsServiceRef.current) {
      console.log('✅ Editor ready! Connecting...');
      connect();
    }
  }, [editor, connect]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    isConnected,
    isStreaming,
    isPaused,
    currentStreamId,
    queueLength: queue.length,
    addToQueue,
    clearQueue,
    disconnect,
    connect,
    pauseStream,
    resumeStream,
    skipStream
  };
};
