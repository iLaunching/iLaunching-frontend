import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Phase 2.0: Streaming State Management Hook
 * Production-ready with error handling, recovery, and best practices
 * 
 * React hook for managing streaming content with queue system,
 * event callbacks, and state tracking
 */

export interface StreamOptions {
  preset?: 'normal' | 'fast' | 'superfast' | 'slow' | 'adaptive'; // Pre-configured stream commands
  delay?: number;        // Manual override
  mode?: 'word' | 'character';
  chunkSize?: number;    // Manual override
  maxRetries?: number;
  priority?: 'low' | 'normal' | 'high';
  sourceId?: string;
  autoBatch?: boolean;
}

export interface StreamItem {
  id: string;
  content: string;
  options?: StreamOptions;
  status: 'pending' | 'streaming' | 'completed' | 'error';
  progress: number;
  error?: string;
  retryCount: number;
  createdAt: number;
  memorySize: number; // Approximate memory usage in bytes
  sourceId?: string; // Group ID for related chunks
}

export interface StreamCallbacks {
  onStart?: (id: string) => void;
  onProgress?: (id: string, progress: number) => void;
  onComplete?: (id: string) => void;
  onError?: (id: string, error: string, willRetry: boolean) => void;
}

export interface UseStreamingReturn {
  // State
  isStreaming: boolean;
  currentStream: StreamItem | null;
  queue: StreamItem[];
  
  // Actions
  addToQueue: (content: string, options?: StreamOptions) => string;
  startStreaming: (editor: any) => void;
  pauseStreaming: () => void;
  resumeStreaming: () => void;
  stopStreaming: () => void;
  clearQueue: () => void;
  removeFromQueue: (id: string) => void;
  
  // Callbacks
  setCallbacks: (callbacks: StreamCallbacks) => void;
}

const MAX_QUEUE_SIZE = 100;
const DEFAULT_MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second between retries

// Smart memory-based limits
const MAX_QUEUE_MEMORY = 10 * 1024 * 1024; // 10MB total queue memory
const SMALL_CHUNK_THRESHOLD = 100; // words - considered "small chunk"

// Stream Command Presets - Easy to maintain and customize!
const STREAM_PRESETS = {
  normal: { delay: 100, mode: 'word' as const, chunkSize: 1 },      // 🌊 Normal
  fast: { delay: 50, mode: 'word' as const, chunkSize: 2 },         // ⚡ Fast
  superfast: { delay: 80, mode: 'word' as const, chunkSize: 3 },    // 🚀 Super Fast
  slow: { delay: 300, mode: 'word' as const, chunkSize: 1 },        // 🐢 Slow
  // Adaptive is calculated dynamically based on content
};

export const useStreaming = (): UseStreamingReturn => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [currentStream, setCurrentStream] = useState<StreamItem | null>(null);
  const [queue, setQueue] = useState<StreamItem[]>([]);
  
  const editorRef = useRef<any>(null);
  const callbacksRef = useRef<StreamCallbacks>({});
  const streamIdCounter = useRef(0);
  const queueRef = useRef<StreamItem[]>([]);
  const isProcessingRef = useRef(false);
  
  // Keep queueRef in sync with queue state
  useEffect(() => {
    queueRef.current = queue;
  }, [queue]);
  
  // Helper: Calculate memory size of content
  const calculateMemorySize = (content: string): number => {
    // Approximate: 2 bytes per character (UTF-16)
    return content.length * 2;
  };
  
  // Helper: Get total queue memory
  const getQueueMemory = (): number => {
    return queueRef.current.reduce((total, item) => total + item.memorySize, 0);
  };
  
  // Helper: Count words in content
  const countWords = (content: string): number => {
    return (content.match(/\S+/g) || []).length;
  };
  
  // Helper: Get stream options from preset or manual config
  const getStreamOptions = (content: string, options?: StreamOptions) => {
    // Manual override - user specifies exact delay/chunkSize
    if (options?.delay !== undefined || options?.chunkSize !== undefined) {
      return {
        delay: options.delay ?? 100,
        mode: options.mode ?? 'word',
        chunkSize: options.chunkSize ?? 1,
      };
    }
    
    // Preset selection
    const preset = options?.preset ?? 'normal'; // Default to 'normal'
    
    if (preset === 'adaptive') {
      // Adaptive calculates based on content length
      const wordCount = countWords(content);
      if (wordCount < 50) {
        return { delay: 30, mode: 'word' as const, chunkSize: 3 };
      } else if (wordCount < 200) {
        return { delay: 50, mode: 'word' as const, chunkSize: 2 };
      } else if (wordCount < 500) {
        return { delay: 80, mode: 'word' as const, chunkSize: 2 };
      } else {
        return { delay: 100, mode: 'word' as const, chunkSize: 1 };
      }
    }
    
    // Use predefined preset
    return STREAM_PRESETS[preset] || STREAM_PRESETS.normal;
  };
  
  // Helper: Try to merge consecutive chunks from same source
  const tryMergeChunks = (newItem: StreamItem): boolean => {
    if (!newItem.sourceId || newItem.options?.autoBatch === false) {
      return false;
    }
    
    // Find last item with same sourceId
    const lastIndex = queueRef.current.length - 1;
    if (lastIndex >= 0) {
      const lastItem = queueRef.current[lastIndex];
      
      if (lastItem.sourceId === newItem.sourceId && 
          lastItem.status === 'pending' &&
          countWords(lastItem.content) < SMALL_CHUNK_THRESHOLD) {
        
        // Merge content
        const mergedContent = lastItem.content + ' ' + newItem.content;
        const mergedSize = calculateMemorySize(mergedContent);
        
        console.log(`useStreaming: Merging chunks from source ${newItem.sourceId}`);
        
        // Update last item
        const mergedItem: StreamItem = {
          ...lastItem,
          content: mergedContent,
          memorySize: mergedSize,
        };
        
        setQueue(prev => {
          const newQueue = [...prev];
          newQueue[lastIndex] = mergedItem;
          return newQueue;
        });
        
        return true; // Merged successfully
      }
    }
    
    return false; // No merge
  };

  // Add content to queue with validation and smart features
  const addToQueue = useCallback((content: string, options?: StreamOptions): string => {
    // Validate content
    if (!content || content.trim().length === 0) {
      const errorMsg = 'Content cannot be empty';
      console.error('useStreaming:', errorMsg);
      throw new Error(errorMsg);
    }
    
    const memorySize = calculateMemorySize(content);
    const queueMemory = getQueueMemory();
    
    // Check memory limit instead of count limit
    if (queueMemory + memorySize > MAX_QUEUE_MEMORY) {
      const errorMsg = `Queue memory limit exceeded. Current: ${(queueMemory / 1024 / 1024).toFixed(2)}MB, New: ${(memorySize / 1024 / 1024).toFixed(2)}MB, Max: ${MAX_QUEUE_MEMORY / 1024 / 1024}MB`;
      console.error('useStreaming:', errorMsg);
      throw new Error(errorMsg);
    }
    
    // Check count limit as secondary protection
    if (queue.length >= MAX_QUEUE_SIZE) {
      const errorMsg = `Queue is full. Maximum ${MAX_QUEUE_SIZE} items allowed.`;
      console.error('useStreaming:', errorMsg);
      throw new Error(errorMsg);
    }
    
    const id = `stream-${++streamIdCounter.current}`;
    const streamOptions = getStreamOptions(content, options);
    
    const streamItem: StreamItem = {
      id,
      content,
      options: {
        ...streamOptions,
        ...options,
        maxRetries: options?.maxRetries ?? DEFAULT_MAX_RETRIES,
      },
      status: 'pending',
      progress: 0,
      retryCount: 0,
      createdAt: Date.now(),
      memorySize,
      sourceId: options?.sourceId,
    };
    
    // Try to merge with previous chunk if from same source
    if (options?.autoBatch !== false && tryMergeChunks(streamItem)) {
      console.log('useStreaming: Chunk merged with previous', { 
        id, 
        sourceId: options?.sourceId,
        queueSize: queue.length 
      });
      return id; // Return ID even though merged
    }
    
    // Add as new item
    setQueue(prev => [...prev, streamItem]);
    
    const wordCount = countWords(content);
    const preset = options?.preset || 'manual';
    
    console.log('useStreaming: Added to queue', { 
      id, 
      wordCount,
      memoryKB: (memorySize / 1024).toFixed(2),
      queueSize: queue.length + 1,
      preset,
      delay: streamItem.options?.delay,
      chunkSize: streamItem.options?.chunkSize,
      sourceId: options?.sourceId,
    });
    
    return id;
  }, [queue.length]);

  // Start streaming from queue with retry logic
  const startStreaming = useCallback((editor: any) => {
    console.log('=== startStreaming called ===');
    console.log('useStreaming: Current isStreaming:', isStreaming);
    console.log('useStreaming: Queue length:', queueRef.current.length);
    console.log('useStreaming: isProcessing:', isProcessingRef.current);
    
    // Validate editor
    if (!editor) {
      console.error('useStreaming: Editor is null or undefined');
      return;
    }
    
    // Prevent concurrent processing
    if (isProcessingRef.current) {
      console.warn('useStreaming: Already processing queue, skipping');
      return;
    }
    
    // Don't start if already streaming
    if (isStreaming) {
      console.warn('useStreaming: Already streaming, aborting');
      return;
    }
    
    if (queueRef.current.length === 0) {
      console.log('useStreaming: Queue is empty, nothing to stream');
      return;
    }
    
    isProcessingRef.current = true;
    editorRef.current = editor;
    
    // Get next item from queue
    const nextStream = queueRef.current[0];
    console.log('useStreaming: Next stream:', { 
      id: nextStream.id, 
      contentPreview: nextStream.content.substring(0, 50) + '...',
      retryCount: nextStream.retryCount,
      maxRetries: nextStream.options?.maxRetries || DEFAULT_MAX_RETRIES
    });
    
    // Remove from queue
    setQueue(prev => {
      const newQueue = prev.slice(1);
      console.log('useStreaming: Queue updated, new length:', newQueue.length);
      return newQueue;
    });
    
    setCurrentStream(nextStream);
    setIsStreaming(true);
    
    // Update status
    const updatedStream = { ...nextStream, status: 'streaming' as const };
    setCurrentStream(updatedStream);
    
    // Call onStart callback
    callbacksRef.current.onStart?.(nextStream.id);
    
    console.log('useStreaming: Starting stream', { id: nextStream.id });
    
    // Calculate approximate duration based on content and options
    const delay = nextStream.options?.delay || 100;
    const chunkSize = nextStream.options?.chunkSize || 1;
    const mode = nextStream.options?.mode || 'word';
    
    let chunks: string[];
    if (mode === 'word') {
      chunks = nextStream.content.match(/\S+\s*/g) || [];
    } else {
      chunks = nextStream.content.split('');
    }
    
    const totalChunks = Math.ceil(chunks.length / chunkSize);
    const estimatedDuration = totalChunks * delay;
    
    console.log('useStreaming: Stream config', { 
      totalChunks, 
      delay, 
      chunkSize,
      estimatedDuration,
      mode 
    });
    
    // Start the actual streaming using editor command
    try {
      const streamStarted = editor.commands.startStream(nextStream.content, nextStream.options);
      
      if (!streamStarted) {
        throw new Error('Failed to start stream - editor command returned false');
      }
      
      // Wait for estimated duration, then mark complete
      setTimeout(() => {
        console.log('useStreaming: Stream completed', { id: nextStream.id });
        
        // Call onComplete callback
        callbacksRef.current.onComplete?.(nextStream.id);
        
        // Clear current stream and mark as not streaming
        setCurrentStream(null);
        setIsStreaming(false);
        isProcessingRef.current = false;
        
        // Auto-start next in queue after a brief delay
        setTimeout(() => {
          console.log('useStreaming: Checking for next stream...');
          console.log('useStreaming: Queue length:', queueRef.current.length);
          
          if (queueRef.current.length > 0) {
            console.log('useStreaming: Starting next stream in queue');
            startStreaming(editor);
          } else {
            console.log('useStreaming: Queue empty, all streams complete!');
          }
        }, 100);
      }, estimatedDuration + 100); // Add 100ms buffer
      
    } catch (error) {
      console.error('useStreaming: Error during streaming:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Check if we should retry
      const shouldRetry = nextStream.retryCount < (nextStream.options?.maxRetries ?? DEFAULT_MAX_RETRIES);
      
      if (shouldRetry) {
        console.log(`useStreaming: Retrying stream ${nextStream.id} (attempt ${nextStream.retryCount + 1}/${nextStream.options?.maxRetries ?? DEFAULT_MAX_RETRIES})`);
        
        // Update stream with incremented retry count
        const retriedStream: StreamItem = {
          ...nextStream,
          retryCount: nextStream.retryCount + 1,
          status: 'pending',
          progress: 0,
        };
        
        // Add back to front of queue
        setQueue(prev => [retriedStream, ...prev]);
        
        // Fire error callback with retry flag
        callbacksRef.current.onError?.(nextStream.id, errorMessage, true);
        
        // Clear current stream and reset processing
        setCurrentStream(null);
        setIsStreaming(false);
        isProcessingRef.current = false;
        
        // Retry after delay
        setTimeout(() => {
          console.log(`useStreaming: Retrying stream ${nextStream.id} now`);
          startStreaming(editor);
        }, RETRY_DELAY);
      } else {
        console.error(`useStreaming: Max retries reached for stream ${nextStream.id}`);
        
        // Update current stream status to error
        setCurrentStream(prev => prev ? { ...prev, status: 'error', error: errorMessage } : null);
        
        // Fire error callback without retry
        callbacksRef.current.onError?.(nextStream.id, errorMessage, false);
        
        // Clear current stream and reset processing
        setCurrentStream(null);
        setIsStreaming(false);
        isProcessingRef.current = false;
        
        // Process next item in queue
        if (queueRef.current.length > 0) {
          console.log('useStreaming: Moving to next stream after max retries');
          setTimeout(() => startStreaming(editor), 100);
        }
      }
    }
  }, [isStreaming]);

  // Pause streaming with validation
  const pauseStreaming = useCallback(() => {
    if (!editorRef.current) {
      console.error('useStreaming: Cannot pause - editor not initialized');
      return;
    }
    if (!isStreaming) {
      console.warn('useStreaming: Cannot pause - no stream is active');
      return;
    }
    
    console.log('useStreaming: Pausing stream');
    try {
      editorRef.current.commands?.pauseStream?.();
    } catch (error) {
      console.error('useStreaming: Error pausing stream:', error);
    }
  }, [isStreaming]);

  // Resume streaming with validation
  const resumeStreaming = useCallback(() => {
    if (!editorRef.current) {
      console.error('useStreaming: Cannot resume - editor not initialized');
      return;
    }
    if (!currentStream) {
      console.warn('useStreaming: Cannot resume - no stream to resume');
      return;
    }
    
    console.log('useStreaming: Resuming stream');
    try {
      editorRef.current.commands?.resumeStream?.();
    } catch (error) {
      console.error('useStreaming: Error resuming stream:', error);
    }
  }, [currentStream]);

  // Stop streaming with cleanup
  const stopStreaming = useCallback(() => {
    if (!editorRef.current) {
      console.error('useStreaming: Cannot stop - editor not initialized');
      return;
    }
    
    console.log('useStreaming: Stopping stream');
    try {
      editorRef.current.commands?.stopStream?.();
      setIsStreaming(false);
      setCurrentStream(null);
      isProcessingRef.current = false;
    } catch (error) {
      console.error('useStreaming: Error stopping stream:', error);
      // Still update state even if stop command fails
      setIsStreaming(false);
      setCurrentStream(null);
      isProcessingRef.current = false;
    }
  }, []);

  // Clear queue
  const clearQueue = useCallback(() => {
    console.log('useStreaming: Clearing queue');
    setQueue([]);
  }, []);
  
  // Remove specific item from queue
  const removeFromQueue = useCallback((id: string) => {
    console.log(`useStreaming: Removing stream ${id} from queue`);
    setQueue(prev => prev.filter(item => item.id !== id));
  }, []);

  // Set callbacks
  const setCallbacks = useCallback((callbacks: StreamCallbacks) => {
    callbacksRef.current = callbacks;
    console.log('useStreaming: Callbacks updated');
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('useStreaming: Unmounting, cleaning up...');
      if (editorRef.current) {
        try {
          editorRef.current.commands?.stopStream?.();
        } catch (error) {
          console.error('useStreaming: Error stopping stream on unmount:', error);
        }
      }
    };
  }, []);

  return {
    // State
    isStreaming,
    currentStream,
    queue,
    
    // Actions
    addToQueue,
    startStreaming,
    pauseStreaming,
    resumeStreaming,
    stopStreaming,
    clearQueue,
    removeFromQueue,
    
    // Callbacks
    setCallbacks,
  };
};

export default useStreaming;
