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

/**
 * Convert markdown to HTML for Tiptap rendering
 * Handles: **bold**, *italic*, headers, paragraphs, etc.
 */
function convertMarkdownToHTML(markdown: string): string {
  let html = markdown;
  
  // Headers
  html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  
  // Bold (**text** or __text__)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
  
  // Italic (*text* or _text_) - but not emoji or special cases
  html = html.replace(/\*([^\*\s][^\*]*?)\*/g, '<em>$1</em>');
  html = html.replace(/_([^_\s][^_]*?)_/g, '<em>$1</em>');
  
  // Inline code
  html = html.replace(/`(.+?)`/g, '<code>$1</code>');
  
  // Links
  html = html.replace(/\[([^\]]+)\]\(([^\)]+)\)/g, '<a href="$2">$1</a>');
  
  // Paragraphs (double newline = new paragraph)
  html = html.replace(/\n\n+/g, '</p><p>');
  html = `<p>${html}</p>`;
  
  // Single newlines become <br>
  html = html.replace(/\n/g, '<br>');
  
  return html;
}

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

/*
 * REMOVED: streamCodeBlockChunk - Markdown streaming doesn't need special code block handling
 * TipTap automatically parses markdown code blocks (```)
 */
/*
const streamCodeBlockChunk = async (editor: Editor, chunk: string) => {
  try {
    console.log('🔍 streamCodeBlockChunk called, chunk length:', chunk.length);
    
    // Check if chunk contains code blocks
    const codeBlockRegex = /<pre[^>]*>\s*<code[^>]*>([\s\S]*?)<\/code>\s*<\/pre>/g;
    const matches = Array.from(chunk.matchAll(codeBlockRegex));
    
    console.log('📦 Found', matches.length, 'code block(s)');
    
    if (matches.length === 0) {
      return;
    }
  
  // Split the chunk by code blocks to handle content before/after/between
  let lastIndex = 0;
  
  console.log('🔄 Starting loop through', matches.length, 'code blocks');
  
  for (const match of matches) {
    const fullMatch = match[0];
    const codeContent = match[1];
    const matchIndex = match.index || 0;
    
    console.log('🎯 Processing code block at index:', matchIndex);
    
    // Insert any content BEFORE this code block (like headings, paragraphs)
    if (matchIndex > lastIndex) {
      const beforeContent = chunk.substring(lastIndex, matchIndex);
      console.log('📄 Inserting before content, length:', beforeContent.length);
      console.log('📄 Before content text:', JSON.stringify(beforeContent));
      editor.commands.insertStreamChunk(beforeContent, true);
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    
    // Extract language
  // Auto-detect language from code content
  const detectLanguage = (code: string): string => {
    if (!code || code.trim().length === 0) return 'plaintext';
    
    // React/JSX patterns
    if (/import\s+.*from\s+['"]react['"]/.test(code) || /<[A-Z]\w+/.test(code) || /className=/.test(code)) {
      return /\.tsx?/.test(code) ? 'tsx' : 'jsx';
    }
    
    // TypeScript patterns
    if (/interface\s+\w+/.test(code) || /type\s+\w+\s*=/.test(code) || /:\s*(string|number|boolean)/.test(code)) {
      return 'typescript';
    }
    
    // Python patterns
    if (/def\s+\w+\(/.test(code) || /import\s+\w+/.test(code) || /from\s+\w+\s+import/.test(code) || /print\(/.test(code)) {
      return 'python';
    }
    
    // JavaScript patterns
    if (/function\s+\w+\(/.test(code) || /const\s+\w+\s*=/.test(code) || /let\s+\w+\s*=/.test(code) || /var\s+\w+\s*=/.test(code)) {
      return 'javascript';
    }
    
    // JSON pattern
    if (/^\s*[{[]/.test(code.trim()) && /[}\]]\s*$/.test(code.trim())) {
      try {
        JSON.parse(code);
        return 'json';
      } catch (e) {
        // Not valid JSON
      }
    }
    
    // CSS patterns
    if (/[.#]\w+\s*\{/.test(code) || /@media/.test(code) || /:\s*[\w-]+;/.test(code)) {
      return 'css';
    }
    
    // Bash/shell patterns
    if (/^#!/.test(code) || /\$\(/.test(code) || /\|\s*grep/.test(code)) {
      return 'bash';
    }
    
    return 'plaintext';
  };

  const preMatch = fullMatch.match(/<pre[^>]*data-language="([^"]+)"[^>]*>/);
    let language = preMatch ? preMatch[1] : '';
    
    console.log('💻 Initial language from API:', language, 'Code length:', codeContent.length);
    console.log('💻 Initial language from API:', language, 'Code length:', codeContent.length);
    
    // Decode HTML entities
    const decodedCode = codeContent
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    
    // Auto-detect language if not provided or invalid
    if (!language || language === 'unknown') {
      language = detectLanguage(decodedCode);
      console.log('🔍 Auto-detected language:', language);
    }
    
    console.log('📍 Creating code block with language:', language);
    
    // Find AI Indicator position
    const { doc } = editor.state;
    let aiIndicatorPos = -1;
    doc.descendants((node, pos) => {
      if (node.type.name === 'aiIndicator') {
        aiIndicatorPos = pos;
      }
    });
    
    const insertPos = aiIndicatorPos >= 0 ? aiIndicatorPos : doc.content.size;
    const from = insertPos;
    
    // Insert empty code block with a single space to ensure it has content
    editor.chain()
      .focus()
      .setTextSelection(insertPos)
      .insertContent({
        type: 'codeBlock',
        attrs: { language },
        content: [{ type: 'text', text: ' ' }] // Single space to initialize
      })
      .run();
    
    console.log('✅ Code block inserted at position:', from);
    
    // Wait for React to render the NodeView
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Position cursor inside the code block and clear the space
    const insidePos = from + 1;
    editor.chain()
      .focus()
      .setTextSelection({ from: insidePos, to: insidePos + 1 }) // Select the space
      .deleteSelection() // Delete it
      .run();
    
    console.log('🎯 Cursor positioned at:', insidePos, 'space cleared');
    
    console.log('⌨️ Starting to type', decodedCode.split('\n').length, 'lines of code');
    
    // Instead of character-by-character, type line-by-line for better formatting
    const lines = decodedCode.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Insert the entire line at once as PLAIN TEXT (not HTML)
      if (line.length > 0) {
        // Use insertContent with type: 'text' to prevent HTML parsing
        editor.commands.insertContent({ type: 'text', text: line });
        await new Promise(resolve => setTimeout(resolve, 50)); // 50ms per line
      }
      
      // Add newline if not the last line
      if (i < lines.length - 1) {
        editor.commands.insertContent({ type: 'text', text: '\n' });
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    console.log('✅ Finished typing code');
    
    lastIndex = matchIndex + fullMatch.length;
  }
  
  // Insert any content AFTER the last code block
  if (lastIndex < chunk.length) {
    const afterContent = chunk.substring(lastIndex);
    console.log('📄 Inserting after content, length:', afterContent.length);
    console.log('📄 After content text:', JSON.stringify(afterContent));
    editor.commands.insertStreamChunk(afterContent, true);
  }
  
  console.log('✅ streamCodeBlockChunk completed successfully');
  } catch (error) {
    console.error('❌ Error in streamCodeBlockChunk:', error);
  }
};
*/

// Removed streamHTMLWordByWord - backend now sends markdown instead of HTML

// Removed streamTaskList - backend sends markdown, not HTML TaskLists

export const useStreaming = (editor: Editor | null, options: UseStreamingOptions = {}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentStreamId, setCurrentStreamId] = useState<string | null>(null);
  const [queue, setQueue] = useState<StreamRequest[]>([]);
  
  const wsServiceRef = useRef<StreamingWebSocketService | null>(null);
  const isProcessingRef = useRef(false);
  const queueRef = useRef<StreamRequest[]>([]); // Ref to access queue in callbacks
  
  // Keep queueRef in sync with queue state
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);
  
  // Auto-process queue when items are added and not currently processing
  useEffect(() => {
    if (queue.length > 0 && !isProcessingRef.current && wsServiceRef.current?.isConnected()) {
      console.log('🎬 Queue has items, auto-processing...');
      
      const next = queue[0];
      
      // CRITICAL: Check processing flag before processing
      if (isProcessingRef.current) {
        return; // Don't process again
      }
      
      isProcessingRef.current = true;
      setCurrentStreamId(next.id);
      
      // Send stream request to API
      try {
        console.log('📤 Processing queue item:', next);
        wsServiceRef.current!.streamContent({
          content: next.content,
          ...next.config
        });
      } catch (error) {
        console.error('Failed to send stream request:', error);
        isProcessingRef.current = false;
        options.onError?.('Failed to stream content');
      }
    }
  }, [queue.length]); // Only trigger when queue length changes

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
          
          // Create Response node inside the AITurn
          // Get turnId from current stream request
          const currentRequest = queueRef.current[0];
          console.log('🔍 Current request in queue:', currentRequest);
          console.log('🔍 Config:', currentRequest?.config);
          console.log('🔍 turnId:', currentRequest?.config?.turnId);
          
          if (currentRequest?.config?.turnId && editor && !editor.isDestroyed) {
            const turnId = currentRequest.config.turnId;
            console.log('🎯 Creating Response node in AITurn:', turnId);
            editor.commands.createResponseInTurn(turnId);
          } else {
            console.error('❌ Cannot create Response - missing turnId or editor');
          }
          
          options.onStreamStart?.(message);
        },
        
        onChunk: async (chunk: StreamChunk) => {
          console.log('📦 Chunk received, length:', chunk.data.length);
          console.log('📄 Full chunk content:', chunk.data);
          
          // Insert chunk directly into editor
          if (editor && !editor.isDestroyed) {
            // Backend sends raw markdown - convert to HTML nodes for Tiptap
            console.log('📝 Converting markdown to Tiptap nodes');
            const htmlContent = convertMarkdownToHTML(chunk.data);
            
            // Get turnId from current stream request to find the Response
            const currentRequest = queueRef.current[0];
            const responseId = currentRequest?.config?.turnId; // turnId = responseId
            
            console.log('🔍 Current request for chunk:', currentRequest);
            console.log('📌 Inserting into Response with responseId:', responseId);
            editor.commands.insertStreamChunk(htmlContent, true, responseId);
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
          
          // Remove completed item from queue and reset processing flag
          setQueue(prev => prev.slice(1));
          isProcessingRef.current = false;
          // useEffect will auto-process next item when queue updates
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
        chunk_by: config.chunk_by || 'word',
        turnId: config.turnId, // Pass through turnId
        timestamp: config.timestamp, // Pass through timestamp
        responseId: config.responseId, // Pass through responseId
      }
    };

    console.log('➕ Adding to queue:', streamRequest);
    setQueue(prev => [...prev, streamRequest]);
    // Processing will be triggered by useEffect when queue updates
  }, []);

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
