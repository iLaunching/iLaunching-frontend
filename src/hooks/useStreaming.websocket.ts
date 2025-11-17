/**
 * useStreaming Hook - WebSocket Integration
 * 
 * Phase 4: Updated to use StreamingWebSocketExtension
 * Extension handles: WebSocket connection, node queuing, Tiptap JSON insertion
 * Hook provides: High-level control (connect, addToQueue, pause/resume/skip)
 */

import { useState, useCallback, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import type { StreamConfig } from '../services/StreamingWebSocketService';

interface UseStreamingOptions {
  apiUrl?: string;
  testMode?: boolean; // Enable test mode responses
  onError?: (error: string) => void;
  onStreamStart?: (data: any) => void;
  onStreamComplete?: (data: any) => void;
}

export const useStreaming = (editor: Editor | null, options: UseStreamingOptions = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPaused] = useState(false);
  const [currentStreamId, setCurrentStreamId] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const maxRetries = 3;
  const retryDelay = 2000; // 2 seconds

  // Register callbacks with extension immediately when editor is available
  useEffect(() => {
    if (!editor) return;
    
    const storage = (editor.storage as any)?.streamingWebSocket;
    
    if (storage) {
      console.log('📝 Registering callbacks in StreamingWebSocketExtension storage');
      storage.onStreamStart = options.onStreamStart;
      storage.onStreamComplete = options.onStreamComplete;
      storage.onError = options.onError;
    } else {
      console.warn('⚠️ StreamingWebSocketExtension storage not found');
    }
  }, [editor, options.onStreamStart, options.onStreamComplete, options.onError]);

  /**
   * Connect to WebSocket - only when editor is ready
   * Phase 4: Now uses StreamingWebSocketExtension commands
   */
  const connect = useCallback(async () => {
    if (!editor) {
      console.warn('⚠️ Editor not ready yet, cannot connect');
      return;
    }

    if (isConnecting) {
      console.log('⏳ Connection already in progress');
      return;
    }

    // Check if already connected via extension storage
    const existingStorage = (editor.storage as any)?.streamingWebSocket;
    if (existingStorage?.isConnected && existingStorage?.websocket) {
      console.log('✅ Already connected, skipping reconnection');
      setIsConnected(true);
      setConnectionAttempts(0);
      return;
    }

    if (isConnected) {
      console.log('✅ Already marked as connected');
      return;
    }

    setIsConnecting(true);

    try {
      const sessionId = `session-${Date.now()}`;
      const wsUrl = options.apiUrl || import.meta.env.VITE_SALES_WS_URL || 'wss://sales-api-production-3088.up.railway.app';
      const fullUrl = `${wsUrl}/ws/stream/${sessionId}`;
      
      console.log('🔌 Connecting to Railway WebSocket...');
      console.log('   URL:', fullUrl);
      console.log('   Session:', sessionId);
      console.log('   Attempt:', connectionAttempts + 1, '/', maxRetries);
      
      // Use the extension's connect command
      editor.commands.connectStreamingWebSocket(fullUrl, sessionId);
      
      console.log('✅ WebSocket connection initiated via extension');
      
      // Poll for connection state (WebSocket might take a moment to connect)
      let attempts = 0;
      const maxAttempts = 50; // 5 seconds max
      const checkInterval = setInterval(() => {
        attempts++;
        
        // Check storage via multiple paths for reliability
        const storageViaExt = (editor as any).extensionManager?.extensions?.find(
          (ext: any) => ext.name === 'streamingWebSocket'
        )?.storage;
        
        const storageViaDirect = (editor.storage as any)?.streamingWebSocket;
        
        const storage = storageViaDirect || storageViaExt;
        
        // More detailed connection check
        const isActuallyConnected = storage?.isConnected && 
                                   storage?.websocket && 
                                   storage.websocket.readyState === WebSocket.OPEN;
        
        if (isActuallyConnected) {
          clearInterval(checkInterval);
          setIsConnected(true);
          setCurrentStreamId(sessionId);
          setIsConnecting(false);
          setConnectionAttempts(0);
          console.log('✅ WebSocket connection confirmed (checked', attempts, 'times)');
        } else if (attempts >= maxAttempts) {
          clearInterval(checkInterval);
          setIsConnecting(false);
          console.warn('⚠️ WebSocket did not connect within timeout after', attempts, 'attempts');
          console.warn('   Storage state:', {
            hasStorage: !!storage,
            isConnected: storage?.isConnected,
            hasWebSocket: !!storage?.websocket,
            readyState: storage?.websocket?.readyState
          });
          
          // Retry connection if we haven't exceeded max retries
          if (connectionAttempts < maxRetries) {
            const nextAttempt = connectionAttempts + 1;
            setConnectionAttempts(nextAttempt);
            console.log(`🔄 Retrying connection in ${retryDelay}ms (attempt ${nextAttempt}/${maxRetries})`);
            setTimeout(() => {
              connect();
            }, retryDelay);
          } else {
            console.error('❌ Max connection retries exceeded');
            options.onError?.('Failed to connect after multiple attempts');
            setConnectionAttempts(0);
          }
        }
      }, 100);
      
      // Note: The extension handles all WebSocket events internally
      // We can listen to extension events via the callbacks we pass to it
      
    } catch (error) {
      console.error('❌ Failed to connect:', error);
      setIsConnecting(false);
      
      // Retry on error
      if (connectionAttempts < maxRetries) {
        const nextAttempt = connectionAttempts + 1;
        setConnectionAttempts(nextAttempt);
        console.log(`🔄 Retrying connection after error in ${retryDelay}ms (attempt ${nextAttempt}/${maxRetries})`);
        setTimeout(() => {
          connect();
        }, retryDelay);
      } else {
        console.error('❌ Max connection retries exceeded after error');
        options.onError?.('Connection failed after multiple attempts');
        setConnectionAttempts(0);
      }
    }
  }, [editor, options.apiUrl, options.onError, isConnected, isConnecting, connectionAttempts]);

  /**
   * Add content to streaming queue
   * Phase 4: Now sends via WebSocket directly
   */
  const addToQueue = useCallback((
    content: string,
    config: Partial<Omit<StreamConfig, 'content'>> = {}
  ) => {
    if (!editor) {
      console.warn('Cannot stream: editor not ready');
      options.onError?.('Editor not ready');
      return;
    }

    // Get extension storage - try multiple access methods
    const extensionManager = (editor as any).extensionManager;
    console.log('🔍 Extension manager found:', !!extensionManager);
    
    const streamingExt = extensionManager?.extensions?.find(
      (ext: any) => ext.name === 'streamingWebSocket'
    );
    
    console.log('🔍 Streaming extension found:', !!streamingExt);
    
    // Try different ways to access storage
    const storage = streamingExt?.storage;
    const storageAlt = (editor.storage as any)?.streamingWebSocket;
    
    // Use the correct storage reference
    const actualStorage = storageAlt || storage;

    console.log('📊 Storage check:', {
      hasExtension: !!streamingExt,
      hasStorage: !!actualStorage,
      hasWebSocket: !!actualStorage?.websocket,
      isConnected: actualStorage?.isConnected,
      readyState: actualStorage?.websocket?.readyState,
    });

    if (!actualStorage) {
      console.error('❌ Storage not found - attempting reconnection');
      setIsConnected(false);
      options.onError?.('Connection lost, reconnecting...');
      // Trigger reconnection
      setTimeout(() => connect(), 500);
      return;
    }

    if (!actualStorage.websocket) {
      console.error('❌ WebSocket instance not found - attempting reconnection');
      setIsConnected(false);
      options.onError?.('WebSocket disconnected, reconnecting...');
      // Trigger reconnection
      setTimeout(() => connect(), 500);
      return;
    }

    if (!actualStorage.isConnected || actualStorage.websocket.readyState !== WebSocket.OPEN) {
      console.error('❌ WebSocket not connected. ReadyState:', actualStorage.websocket.readyState);
      setIsConnected(false);
      options.onError?.('Connection not ready, reconnecting...');
      // Trigger reconnection
      setTimeout(() => connect(), 500);
      return;
    }

    const streamRequest = {
      type: 'stream_request',
      content,
      content_type: config.content_type || 'text',
      speed: config.speed || 'normal',
      chunk_by: config.chunk_by || 'word',
      test_mode: options.testMode ?? false, // Use testMode from options
    };

    console.log('📤 Sending stream request via WebSocket:', streamRequest);
    
    try {
      actualStorage.websocket.send(JSON.stringify(streamRequest));
      setIsStreaming(true);
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      setIsConnected(false);
      options.onError?.('Failed to send message, reconnecting...');
      setTimeout(() => connect(), 500);
    }
  }, [editor, options, connect]);

  /**
   * Disconnect
   * Phase 4: Use extension command
   */
  const disconnect = useCallback(() => {
    if (editor) {
      editor.commands.disconnectStreamingWebSocket();
    }
    setIsConnected(false);
    setIsStreaming(false);
  }, [editor]);

  /**
   * Pause current stream
   * Phase 4: Use extension command
   */
  const pauseStream = useCallback(() => {
    if (editor && isStreaming) {
      editor.commands.pauseStream();
    }
  }, [editor, isStreaming]);

  /**
   * Resume paused stream
   * Phase 4: Use extension command
   */
  const resumeStream = useCallback(() => {
    if (editor && isStreaming) {
      editor.commands.resumeStream();
    }
  }, [editor, isStreaming]);

  /**
   * Skip to end of current stream
   * Phase 4: Use extension command
   */
  const skipStream = useCallback(() => {
    if (editor && isStreaming) {
      editor.commands.skipStream();
    }
  }, [editor, isStreaming]);

  // Auto-connect when editor is ready
  useEffect(() => {
    if (editor && !isConnected && !isConnecting) {
      console.log('🔄 Auto-connecting WebSocket...');
      connect();
    }
  }, [editor, isConnected, isConnecting, connect]);

  // Cleanup on unmount
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
    queueLength: 0, // No longer using queue
    isConnecting,
    connectionAttempts,
    addToQueue,
    disconnect,
    connect,
    pauseStream,
    resumeStream,
    skipStream
  };
};
