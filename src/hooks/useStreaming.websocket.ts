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

/**
 * Stream code block content character-by-character with typewriter effect
 */
const streamCodeBlockChunk = async (editor: Editor, chunk: string) => {
  // Parse the chunk to extract code content
  const codeBlockRegex = /<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/g;
  const match = codeBlockRegex.exec(chunk);
  
  if (match) {
    // Extract language and code content
    const preMatch = chunk.match(/<pre[^>]*data-language="([^"]+)"[^>]*>/);
    const language = preMatch ? preMatch[1] : 'javascript';
    const codeContent = match[1]
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    
    console.log('📦 Code block detected! Language:', language, 'Content length:', codeContent.length);
    
    // Get current position before inserting
    const { state } = editor;
    const beforePos = state.doc.content.size;
    
    // Insert empty code block with a single space (empty blocks can be problematic)
    editor.chain()
      .focus()
      .insertContent({
        type: 'codeBlock',
        attrs: { language },
        content: [{ type: 'text', text: ' ' }]
      })
      .run();
    
    console.log('✅ Empty code block created');
    
    // Small delay to let the code block render
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Position cursor at the space inside the code block we just created
    // The code block starts at beforePos, and we want to be inside it (after the opening)
    editor.commands.setTextSelection(beforePos + 1);
    
    // First, clear the placeholder space
    editor.commands.deleteRange({ from: beforePos + 1, to: beforePos + 2 });
    
    console.log('✅ Cursor positioned inside code block, starting typewriter...');
    
    // Now stream the code content character-by-character
    const lines = codeContent.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Type out each character with a small delay
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        editor.commands.insertContent(char);
        await new Promise(resolve => setTimeout(resolve, 20)); // 20ms per character
      }
      
      // Add newline if not the last line
      if (i < lines.length - 1) {
        editor.commands.insertContent('\n');
        await new Promise(resolve => setTimeout(resolve, 20));
      }
    }
    
    console.log('✅ Code block typewriter complete!');
  } else {
    // Not a complete code block, insert normally
    editor.commands.insertStreamChunk(chunk, true);
  }
};

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
            // Check if chunk contains code block markers
            const hasCodeBlockStart = chunk.data.includes('<pre') || chunk.data.includes('<code');
            const hasCodeBlockEnd = chunk.data.includes('</pre>') || chunk.data.includes('</code>');
            
            if (hasCodeBlockStart || hasCodeBlockEnd) {
              // For code blocks, stream character-by-character with typewriter effect
              streamCodeBlockChunk(editor, chunk.data);
            } else {
              // Regular content - insert normally
              editor.commands.insertStreamChunk(chunk.data, true);
            }
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
