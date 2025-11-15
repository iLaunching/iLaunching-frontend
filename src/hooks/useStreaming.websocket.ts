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

/**
 * Stream HTML content word-by-word with proper tag handling
 * Parses HTML into text nodes and tags, then streams word by word
 */
const streamHTMLWordByWord = async (editor: Editor, html: string) => {
  try {
    console.log('🎯 Starting word-by-word HTML streaming');
    
    // Check if this is a TaskList - needs special handling
    if (html.includes('data-type="taskList"') || html.includes('data-type="taskItem"')) {
      console.log('🔍 Detected TaskList, using special streaming');
      await streamTaskList(editor, html);
      return;
    }
    
    // Simple approach: Extract text content and tags separately
    // Parse the HTML to get a DOM structure
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Function to stream node content recursively
    const streamNode = async (node: Node, marks: string[] = []) => {
      if (node.nodeType === Node.TEXT_NODE) {
        // Text node - split into words and stream
        const text = node.textContent || '';
        const words = text.split(/(\s+)/); // Keep whitespace
        
        for (const word of words) {
          if (word.length > 0) {
            // Build HTML with current marks wrapped from outermost to innermost
            let content = word;
            
            // Wrap word with accumulated marks
            for (const mark of marks) {
              const tagName = mark.match(/<(\w+)/)?.[1];
              const attrs = mark.match(/<\w+\s+(.+?)>/)?.[1] || '';
              content = `<${tagName}${attrs ? ' ' + attrs : ''}>${content}</${tagName}>`;
            }
            
            editor.commands.insertStreamChunk(content, true);
            await new Promise(resolve => setTimeout(resolve, 50)); // 50ms per word
          }
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element;
        const tagName = element.tagName.toLowerCase();
        
        // Build opening tag with attributes
        let openTag = `<${tagName}`;
        for (let i = 0; i < element.attributes.length; i++) {
          const attr = element.attributes[i];
          openTag += ` ${attr.name}="${attr.value}"`;
        }
        openTag += '>';
        
        // For inline marks (strong, em, mark, etc.), accumulate them
        const inlineMarks = ['strong', 'em', 'u', 's', 'mark', 'code', 'a', 'span', 'sub', 'sup'];
        if (inlineMarks.includes(tagName)) {
          // Add this mark to the stack and process children
          const newMarks = [...marks, openTag];
          for (let i = 0; i < node.childNodes.length; i++) {
            await streamNode(node.childNodes[i], newMarks);
          }
        } else {
          // Block element - insert opening tag, stream children, insert closing tag
          editor.commands.insertStreamChunk(openTag, true);
          await new Promise(resolve => setTimeout(resolve, 20));
          
          for (let i = 0; i < node.childNodes.length; i++) {
            await streamNode(node.childNodes[i], marks);
          }
          
          editor.commands.insertStreamChunk(`</${tagName}>`, true);
          await new Promise(resolve => setTimeout(resolve, 20));
        }
      }
    };
    
    // Stream the body content
    for (let i = 0; i < doc.body.childNodes.length; i++) {
      await streamNode(doc.body.childNodes[i]);
    }
    
    console.log('✅ Word-by-word streaming completed');
  } catch (error) {
    console.error('❌ Error in streamHTMLWordByWord:', error);
    // Fallback to inserting all at once
    editor.commands.insertStreamChunk(html, true);
  }
};

/**
 * Stream TaskList with special handling for checked state
 * TaskLists need to be inserted item by item with proper Tiptap commands
 */
const streamTaskList = async (editor: Editor, html: string) => {
  try {
    console.log('📋 Streaming TaskList');
    
    // Parse the HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const taskList = doc.querySelector('ul[data-type="taskList"]');
    
    if (!taskList) {
      console.warn('⚠️ No taskList found, falling back to regular streaming');
      editor.commands.insertStreamChunk(html, true);
      return;
    }
    
    // Get all task items
    const items = taskList.querySelectorAll('li[data-type="taskItem"]');
    
    // Insert each task item using Tiptap's TaskList commands
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const isChecked = item.getAttribute('data-checked') === 'true';
      const text = item.textContent || '';
      
      console.log(`📝 Inserting task item ${i + 1}:`, text, 'checked:', isChecked);
      
      // Find AI Indicator position for each item
      const { doc } = editor.state;
      let aiIndicatorPos = -1;
      doc.descendants((node, pos) => {
        if (node.type.name === 'aiIndicator') {
          aiIndicatorPos = pos;
        }
      });
      
      const insertPos = aiIndicatorPos >= 0 ? aiIndicatorPos : doc.content.size;
      
      // Insert using Tiptap's proper task item structure before AI Indicator
      editor.chain()
        .focus()
        .setTextSelection(insertPos)
        .insertContent({
        type: 'taskList',
        content: [{
          type: 'taskItem',
          attrs: {
            checked: isChecked
          },
          content: [{
            type: 'paragraph',
            content: [{
              type: 'text',
              text: text
            }]
          }]
        }]
      })
        .run();
      
      await new Promise(resolve => setTimeout(resolve, 100)); // Delay between items
    }
    
    console.log('✅ TaskList streaming completed');
  } catch (error) {
    console.error('❌ Error in streamTaskList:', error);
    // Fallback
    editor.commands.insertStreamChunk(html, true);
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
        
        onChunk: async (chunk: StreamChunk) => {
          console.log('📦 Chunk received, length:', chunk.data.length);
          console.log('📄 Full chunk content:', chunk.data);
          
          // Insert chunk directly into editor
          if (editor && !editor.isDestroyed) {
            // Check if chunk contains a COMPLETE code block (both <pre> and </pre>)
            const hasCompleteCodeBlock = chunk.data.includes('<pre') && chunk.data.includes('</pre>');
            
            console.log('🔍 Has complete code block?', hasCompleteCodeBlock);
            
            if (hasCompleteCodeBlock) {
              console.log('🎯 Complete code block detected, using typewriter effect');
              // For complete code blocks, stream character-by-character with typewriter effect
              // IMPORTANT: await this so stream_complete doesn't arrive before typewriter finishes
              await streamCodeBlockChunk(editor, chunk.data).catch(err => {
                console.error('❌ Code block streaming error:', err);
              });
            } else {
              // Check if this is a large HTML chunk that should be streamed word-by-word
              // BUT: Don't try to stream complex elements like tables word-by-word
              const hasComplexStructure = chunk.data.includes('<table') || 
                                         chunk.data.includes('<div') ||
                                         chunk.data.includes('<blockquote');
              
              const shouldStreamWords = chunk.data.length > 50 && 
                                       chunk.data.includes('<') && 
                                       !chunk.data.includes('<pre') &&
                                       !hasComplexStructure;
              
              if (shouldStreamWords) {
                console.log('🎯 Simple HTML chunk detected, streaming word-by-word');
                await streamHTMLWordByWord(editor, chunk.data).catch(err => {
                  console.error('❌ Word-by-word streaming error:', err);
                });
              } else {
                // Regular content or complex HTML - insert normally
                console.log('📝 Inserting content as-is (complex HTML or regular text)');
                editor.commands.insertStreamChunk(chunk.data, true);
              }
            }
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
    if (isProcessingRef.current || !wsServiceRef.current?.isConnected()) {
      return;
    }
    
    setQueue(prev => {
      if (prev.length === 0) {
        return prev;
      }
      
      const [next, ...rest] = prev;
      
      // CRITICAL: Check processing flag AFTER extracting item but BEFORE processing
      // This prevents React Strict Mode from executing the stream request twice
      if (isProcessingRef.current) {
        return rest; // Remove item from queue but don't process again
      }
      
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
