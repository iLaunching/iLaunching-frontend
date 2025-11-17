/**
 * StreamingWebSocketExtension - Phase 4 Implementation
 * Updated: 2025-11-17 - Added callback registration debugging
 * 
 * Handles WebSocket connection and Tiptap JSON streaming.
 */

import { Extension } from '@tiptap/core';
import type { Editor } from '@tiptap/react';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export interface NodeQueueItem {
  node: any;  // Tiptap JSON node
  index: number;
  shouldAnimate: boolean;
}

export interface StreamingWebSocketOptions {
  websocketUrl?: string;
  sessionId?: string;
  onStreamStart?: (data: { total_nodes: number; metadata: any }) => void;
  onStreamComplete?: (data: { total_nodes: number }) => void;
  onError?: (error: { code: string; message: string }) => void;
  maxQueueSize?: number;
  animationDelay?: number; // Milliseconds between node insertions
  enableAnimations?: boolean; // Enable/disable animations
  maxConcurrentAnimations?: number; // Max nodes animating at once
  autoScroll?: boolean; // Enable automatic scrolling
  scrollTarget?: 'container' | 'browser'; // Scroll container or browser window
  batchSize?: number; // Number of nodes per batch
  batchDelay?: number; // Delay between batches (ms)
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    streamingWebSocket: {
      /**
       * Connect to WebSocket and start listening for streamed nodes
       */
      connectStreamingWebSocket: (url: string, sessionId: string) => ReturnType;
      
      /**
       * Disconnect WebSocket
       */
      disconnectStreamingWebSocket: () => ReturnType;
      
      /**
       * Insert a Tiptap JSON node directly (bypasses queue, for immediate insertion)
       */
      insertTiptapNode: (node: any, position?: number) => ReturnType;
      
      /**
       * Queue a node for animated insertion
       */
      queueStreamedNode: (node: any, index: number, shouldAnimate?: boolean) => ReturnType;
      
      /**
       * Pause stream processing
       */
      pauseStream: () => ReturnType;
      
      /**
       * Resume stream processing
       */
      resumeStream: () => ReturnType;
      
      /**
       * Skip remaining queue (insert all immediately)
       */
      skipStream: () => ReturnType;
      
      /**
       * Clear the node queue
       */
      clearStreamQueue: () => ReturnType;

      /**
       * Toggle animations on/off
       */
      toggleStreamingAnimations: () => ReturnType;

      /**
       * Set animation speed (slow: 500ms, normal: 200ms, fast: 100ms)
       */
      setStreamingAnimationSpeed: (speed: 'slow' | 'normal' | 'fast') => ReturnType;
    };
  }
}

export const StreamingWebSocketExtension = Extension.create<StreamingWebSocketOptions>({
  name: 'streamingWebSocket',

  addOptions() {
    return {
      websocketUrl: undefined,
      sessionId: undefined,
      onStreamStart: undefined,
      onStreamComplete: undefined,
      onError: undefined,
      maxQueueSize: 100,
      animationDelay: 0, // Milliseconds between node insertions (faster block-by-block)
      enableAnimations: true, // Enable/disable animations
      maxConcurrentAnimations: 3, // Max nodes animating at once
      batchSize: 15, // Number of nodes to insert in one batch
      batchDelay: 300, // Delay between batches (ms)
      autoScroll: true, // Enable automatic scrolling by default
      scrollTarget: 'container', // Default to container scrolling
    };
  },

  addStorage() {
    return {
      websocket: null as WebSocket | null,
      nodeQueue: [] as NodeQueueItem[],
      isProcessingQueue: false,
      isPaused: false,
      isConnected: false,
      currentStreamId: null as string | null,
      totalNodesExpected: 0,
      nodesReceived: 0,
      nodesInserted: 0,
      lastInsertPosition: null as number | null,
      currentResponsePos: null as number | null,
      currentTurnId: null as string | null,
      animatingNodes: 0, // Track concurrent animations
      animationsEnabled: true, // Runtime toggle
      batchModeEnabled: true, // Batch mode enabled by default for better performance
      streamCompleteReceived: false, // Backend sent stream_complete
      // Batch processing
      currentBatch: [] as any[], // Current batch being assembled
      currentBatchStartPos: null as number | null, // Where current batch starts
      activeBatchAnimations: [] as any[], // Track active animations to clean up
      // Store callbacks in storage so they can be updated dynamically
      onStreamStart: undefined as ((data: any) => void) | undefined,
      onStreamComplete: undefined as ((data: any) => void) | undefined,
      onError: undefined as ((error: any) => void) | undefined,
      // Scroll tracking
      lastScrollTime: 0, // Last time we scrolled
      scrollThreshold: 200, // Pixels from bottom to trigger scroll
    };
  },

  addCommands() {
    return {
      connectStreamingWebSocket:
        (url: string, sessionId: string) =>
        ({ editor }) => {
          const storage = this.storage;

          // Close existing connection
          if (storage.websocket) {
            storage.websocket.close();
          }

          console.log(`[StreamingWS] Connecting to ${url} with session ${sessionId}`);

          // Connection timeout
          const connectionTimeout = setTimeout(() => {
            if (!storage.isConnected && ws.readyState !== WebSocket.OPEN) {
              console.error('[StreamingWS] ❌ Connection timeout');
              ws.close();
              this.options.onError?.({
                code: 'CONNECTION_TIMEOUT',
                message: 'WebSocket connection timeout after 10 seconds'
              });
            }
          }, 10000);

          const ws = new WebSocket(url);

          ws.onopen = () => {
            clearTimeout(connectionTimeout);
            console.log('[StreamingWS] ✅ Connected');
            storage.isConnected = true;
            storage.reconnectAttempts = 0;
          };

          ws.onerror = (error) => {
            console.error('[StreamingWS] ❌ WebSocket error:', error);
            this.options.onError?.({
              code: 'WEBSOCKET_ERROR',
              message: 'WebSocket connection error'
            });
          };

          ws.onclose = (event) => {
            clearTimeout(connectionTimeout);
            storage.isConnected = false;
            console.log('[StreamingWS] 🔌 Disconnected:', event.code, event.reason);
            
            // Clean close - don't reconnect
            if (event.code === 1000) {
              return;
            }
            
            // Attempt reconnection for unexpected closes
            if (!storage.manualDisconnect && storage.reconnectAttempts < 3) {
              storage.reconnectAttempts = (storage.reconnectAttempts || 0) + 1;
              const delay = Math.min(1000 * Math.pow(2, storage.reconnectAttempts), 10000);
              console.log(`[StreamingWS] 🔄 Reconnecting in ${delay}ms (attempt ${storage.reconnectAttempts}/3)`);
              setTimeout(() => {
                editor.commands.connectStreamingWebSocket(url, sessionId);
              }, delay);
            }
          };

          ws.onmessage = (event) => {
            try {
              const message = JSON.parse(event.data);
              console.log('[StreamingWS] 📨 Message:', message.type);

              switch (message.type) {
                case 'connected':
                  console.log('[StreamingWS] Session confirmed:', message.session_id);
                  storage.currentStreamId = message.session_id;
                  break;

                case 'stream_start':
                  console.log('[StreamingWS] 🎬 Stream starting:', message.total_nodes, 'nodes');
                  storage.totalNodesExpected = message.total_nodes;
                  storage.nodesReceived = 0;
                  storage.nodesInserted = 0;
                  storage.nodeQueue = [];
                  storage.isPaused = false;
                  storage.lastInsertPosition = null;
                  storage.streamCompleteReceived = false; // Reset for new stream
                  
                  // Find the most recent AITurn (the one without a Response yet)
                  let aiTurnPos = -1;
                  let aiTurnNode: any = null;
                  
                  editor.state.doc.descendants((node, pos) => {
                    if (node.type.name === 'aiTurn') {
                      // Check if this AITurn has a Response node
                      let hasResponse = false;
                      node.descendants((child) => {
                        if (child.type.name === 'response') {
                          hasResponse = true;
                          return false; // Stop searching
                        }
                      });
                      
                      if (!hasResponse) {
                        aiTurnPos = pos;
                        aiTurnNode = node;
                        storage.currentTurnId = node.attrs.turnId;
                      }
                    }
                  });
                  
                  if (aiTurnPos >= 0 && aiTurnNode) {
                    console.log('[StreamingWS] 📍 Found AITurn at position', aiTurnPos, 'turnId:', storage.currentTurnId);
                    
                    // Create Response node inside the AITurn
                    const responseNode = {
                      type: 'response',
                      attrs: {
                        response_id: storage.currentTurnId || 'response_' + Date.now(),
                        ai_name: 'iLaunching',
                        ai_model: 'Assistant',
                        ai_avatar_url: '',
                        timestamp: new Date().toISOString()
                      },
                      content: [] // Will be filled with streamed nodes
                    };
                    
                    // Insert Response node as the last child of AITurn
                    // Position is: aiTurnPos + 1 (opening tag) + aiTurnNode.content.size (existing content)
                    const insertPos = aiTurnPos + 1 + aiTurnNode.content.size;
                    
                    const { tr } = editor.state;
                    const pmResponseNode = editor.schema.nodeFromJSON(responseNode);
                    tr.insert(insertPos, pmResponseNode);
                    editor.view.dispatch(tr);
                    
                    // Store position inside the Response node (after its opening tag)
                    storage.currentResponsePos = insertPos + 1;
                    storage.lastInsertPosition = insertPos + 1;
                    
                    console.log('[StreamingWS] ✅ Response node created at position', insertPos);
                  } else {
                    console.warn('[StreamingWS] ⚠️ No AITurn found without Response - will insert at document end');
                    storage.currentResponsePos = null;
                    storage.lastInsertPosition = null;
                  }
                  
                  console.log('[StreamingWS] Checking onStreamStart callback:', !!storage.onStreamStart);
                  if (storage.onStreamStart) {
                    console.log('[StreamingWS] Calling onStreamStart callback');
                    storage.onStreamStart({
                      total_nodes: message.total_nodes,
                      metadata: message.metadata,
                    });
                  } else {
                    console.warn('[StreamingWS] No onStreamStart callback registered');
                  }
                  break;

                case 'node':
                  console.log('[StreamingWS] 📦 Node received:', message.data.type, `(${message.index + 1}/${storage.totalNodesExpected})`);
                  storage.nodesReceived++;
                  
                  // Log content preview for debugging (first 80 chars)
                  if (message.data.content && Array.isArray(message.data.content)) {
                    const firstText = message.data.content.find((c: any) => c.text)?.text;
                    if (firstText) {
                      console.log('[StreamingWS] 📄 Content:', firstText.substring(0, 80) + (firstText.length > 80 ? '...' : ''));
                    }
                  }
                  
                  // Queue the node
                  editor.commands.queueStreamedNode(
                    message.data,
                    message.index,
                    message.shouldAnimate !== false
                  );
                  break;

                case 'stream_complete':
                  console.log('[StreamingWS] 📥 Backend stream complete. Received:', storage.nodesReceived, 'Inserted:', storage.nodesInserted, 'Queue:', storage.nodeQueue.length);
                  
                  // Mark that backend finished, but wait for queue to empty
                  storage.streamCompleteReceived = true;
                  
                  // If queue is already empty, call callback immediately
                  if (storage.nodeQueue.length === 0 && !storage.isProcessingQueue) {
                    console.log('[StreamingWS] ✅ Queue empty, calling completion callback now');
                    if (storage.onStreamComplete) {
                      storage.onStreamComplete({
                        total_nodes: storage.nodesInserted,
                      });
                    }
                  } else {
                    console.log('[StreamingWS] ⏳ Waiting for queue to finish. Queue:', storage.nodeQueue.length, 'Processing:', storage.isProcessingQueue);
                  }
                  break;

                case 'error':
                  console.error('[StreamingWS] ❌ Error:', message.code, message.message);
                  
                  if (this.options.onError) {
                    this.options.onError({
                      code: message.code,
                      message: message.message,
                    });
                  }
                  break;

                case 'stream_paused':
                  console.log('[StreamingWS] ⏸️ Stream paused');
                  storage.isPaused = true;
                  break;

                case 'stream_resumed':
                  console.log('[StreamingWS] ▶️ Stream resumed');
                  storage.isPaused = false;
                  break;

                default:
                  console.warn('[StreamingWS] Unknown message type:', message.type);
              }
            } catch (error) {
              console.error('[StreamingWS] Failed to parse message:', error);
            }
          };

          ws.onerror = (error) => {
            console.error('[StreamingWS] ❌ WebSocket error:', error);
            storage.isConnected = false;
          };

          ws.onclose = () => {
            console.log('[StreamingWS] 🔌 Disconnected');
            storage.isConnected = false;
            storage.websocket = null;
          };

          storage.websocket = ws;

          return true;
        },

      disconnectStreamingWebSocket:
        () =>
        () => {
          const storage = this.storage;

          storage.manualDisconnect = true;
          
          if (storage.websocket) {
            console.log('[StreamingWS] Disconnecting...');
            try {
              storage.websocket.close(1000, 'Manual disconnect');
            } catch (err) {
              console.warn('[StreamingWS] ⚠️ Error closing WebSocket:', err);
            }
            storage.websocket = null;
            storage.isConnected = false;
          }

          // Cancel any ongoing animations
          if (storage.nodeQueue?.length > 0) {
            console.log('[StreamingWS] 🛑 Cancelling', storage.nodeQueue.length, 'queued nodes');
            storage.nodeQueue = [];
          }

          return true;
        },

      queueStreamedNode:
        (node: any, index: number, shouldAnimate = true) =>
        ({ editor }) => {
          const storage = this.storage;

          // Add to queue
          storage.nodeQueue.push({
            node,
            index,
            shouldAnimate,
          });

          console.log('[StreamingWS] 📥 Queued node:', node.type, `(Queue size: ${storage.nodeQueue.length})`);

          // Start processing queue if not already processing
          if (!storage.isProcessingQueue) {
            processQueueWithDelay(editor, storage, this.options.animationDelay || 150, this.options);
          }

          return true;
        },

      insertTiptapNode:
        (node: any, position?: number) =>
        ({ editor, tr }) => {
          try {
            const storage = this.storage; // Get storage reference
            
            // Convert Tiptap JSON node to ProseMirror node
            const pmNode = editor.schema.nodeFromJSON(node);

            if (!pmNode) {
              console.error('[StreamingWS] Failed to create node from JSON:', node);
              return false;
            }

            // Determine insert position
            let insertPos: number;
            
            if (position !== undefined) {
              // Explicit position provided
              insertPos = position;
            } else if (storage.lastInsertPosition !== null) {
              // Insert after the last inserted node (inside Response)
              insertPos = storage.lastInsertPosition;
            } else {
              // Fallback: insert before document end
              const docSize = editor.state.doc.content.size;
              insertPos = Math.max(0, docSize - 1);
            }

            // Validate position is within bounds
            const docSize = editor.state.doc.content.size;
            if (insertPos < 0 || insertPos > docSize) {
              console.error('[StreamingWS] Invalid insert position:', insertPos, 'docSize:', docSize);
              return false;
            }

            tr.insert(insertPos, pmNode);
            
            // Mark this transaction for animation via plugin
            if (storage.animationsEnabled && this.options.enableAnimations) {
              console.log('[StreamingWS] 🎬 Setting animation metadata at position:', insertPos);
              tr.setMeta('streaming-insert', { insertPos });
            } else {
              console.log('[StreamingWS] ⏸️ Animations disabled:', { animationsEnabled: storage.animationsEnabled, enableAnimations: this.options.enableAnimations });
            }
            
            // Update last insert position for next node
            const nodeSize = pmNode.nodeSize;
            storage.lastInsertPosition = insertPos + nodeSize;
            
            console.log('[StreamingWS] 📍 Inserted at position:', insertPos, 'next position:', storage.lastInsertPosition);

            return true;
          } catch (error) {
            console.error('[StreamingWS] Error inserting node:', error, node);
            return false;
          }
        },

      pauseStream:
        () =>
        () => {
          const storage = this.storage;
          storage.isPaused = true;
          console.log('[StreamingWS] ⏸️ Stream paused');

          // Send pause command to backend if connected
          if (storage.websocket && storage.isConnected) {
            storage.websocket.send(JSON.stringify({
              type: 'stream_control',
              action: 'pause',
            }));
          }

          return true;
        },

      resumeStream:
        () =>
        ({ editor }) => {
          const storage = this.storage;
          storage.isPaused = false;
          console.log('[StreamingWS] ▶️ Stream resumed');

          // Send resume command to backend
          if (storage.websocket && storage.isConnected) {
            storage.websocket.send(JSON.stringify({
              type: 'stream_control',
              action: 'resume',
            }));
          }

          // Resume processing queue
          if (!storage.isProcessingQueue && storage.nodeQueue.length > 0) {
            processQueueWithDelay(editor, storage, this.options.animationDelay || 200, this.options);
          }

          return true;
        },

      skipStream:
        () =>
        ({ editor }) => {
          const storage = this.storage;
          console.log('[StreamingWS] ⏭️ Skipping stream, flushing queue');

          // Send skip command to backend
          if (storage.websocket && storage.isConnected) {
            storage.websocket.send(JSON.stringify({
              type: 'stream_control',
              action: 'skip',
            }));
          }

          // Insert all queued nodes immediately without animation
          while (storage.nodeQueue.length > 0) {
            const item = storage.nodeQueue.shift();
            if (item) {
              editor.commands.insertTiptapNode(item.node);
              storage.nodesInserted++;
            }
          }

          storage.isProcessingQueue = false;

          return true;
        },

      clearStreamQueue:
        () =>
        () => {
          const storage = this.storage;
          console.log('[StreamingWS] 🗑️ Clearing queue');
          storage.nodeQueue = [];
          storage.isProcessingQueue = false;

          return true;
        },

      toggleStreamingAnimations:
        () =>
        () => {
          const storage = this.storage;
          storage.animationsEnabled = !storage.animationsEnabled;
          console.log('[StreamingWS] 🎬 Animations:', storage.animationsEnabled ? 'enabled' : 'disabled');

          return true;
        },

      setStreamingAnimationSpeed:
        (speed: 'slow' | 'normal' | 'fast') =>
        () => {
          const delays = { slow: 500, normal: 200, fast: 100 };
          this.options.animationDelay = delays[speed];
          console.log('[StreamingWS] ⚡ Animation speed set to:', speed, `(${delays[speed]}ms)`);

          return true;
        },

      setBatchMode:
        (enabled: boolean, batchSize?: number) =>
        () => {
          if (batchSize) {
            this.options.batchSize = batchSize;
          }
          const storage = this.storage;
          storage.batchModeEnabled = enabled;
          console.log('[StreamingWS] 📦 Batch mode:', enabled ? `enabled (${this.options.batchSize || 15} nodes/batch)` : 'disabled');

          return true;
        },
    };
  },

  onDestroy() {
    // Clean up WebSocket connection
    if (this.storage.websocket) {
      this.storage.websocket.close();
    }
  },

  addProseMirrorPlugins() {
    const storage = this.storage;
    const options = this.options;
    const editor = this.editor;
    
    // Track decorations to remove with a Map
    const decorationTimers = new Map<string, number>();

    return [
      new Plugin({
        key: new PluginKey('streamingAnimation'),
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, decorations) {
            // Map existing decorations through the transaction
            decorations = decorations.map(tr.mapping, tr.doc);

            // If animations are disabled, return empty set
            if (!storage.animationsEnabled || !options.enableAnimations) {
              return DecorationSet.empty;
            }

            // Check if this transaction inserted new nodes
            const meta = tr.getMeta('streaming-insert');
            if (meta && meta.insertPos !== undefined) {
              const { insertPos } = meta;
              console.log('[StreamingWS] 🎨 Processing animation metadata at position:', insertPos);
              
              try {
                const $pos = tr.doc.resolve(insertPos);
                const node = $pos.nodeAfter;
                
                if (node) {
                  console.log('[StreamingWS] ✨ Adding decoration for node type:', node.type.name, 'at position:', insertPos, '-', insertPos + node.nodeSize);
                  
                  const decoKey = `anim-${Date.now()}-${Math.random()}`;
                  
                  // Create decoration that adds animation classes
                  const decoration = Decoration.node(
                    insertPos,
                    insertPos + node.nodeSize,
                    {
                      class: `streaming-animate streaming-animate-${node.type.name}`,
                    },
                    { key: decoKey }
                  );

                  decorations = decorations.add(tr.doc, [decoration]);
                  console.log('[StreamingWS] 🎭 Decoration added, total decorations:', decorations.find().length);

                  // Schedule decoration removal after animation completes
                  const timerId = window.setTimeout(() => {
                    try {
                      // Use requestAnimationFrame to ensure we're in a stable state
                      requestAnimationFrame(() => {
                        if (editor && editor.view && !editor.isDestroyed) {
                          const { state, view } = editor;
                          const tr = state.tr;
                          tr.setMeta('streaming-remove-decoration', { key: decoKey });
                          view.dispatch(tr);
                        }
                      });
                    } catch (error) {
                      console.error('[StreamingWS] Error removing decoration:', error);
                    }
                    decorationTimers.delete(decoKey);
                  }, 400);
                  
                  decorationTimers.set(decoKey, timerId);
                }
              } catch (error) {
                console.error('[StreamingWS] Animation decoration error:', error);
              }
            }

            // Remove decorations if requested
            const removeMeta = tr.getMeta('streaming-remove-decoration');
            if (removeMeta && removeMeta.key) {
              // Filter out decoration with matching key
              const specs: any[] = [];
              decorations.find().forEach(deco => {
                const spec = (deco as any).spec;
                if (!spec || spec.key !== removeMeta.key) {
                  specs.push(deco);
                }
              });
              decorations = DecorationSet.create(tr.doc, specs);
              console.log('[StreamingWS] 🗑️ Decoration removed, remaining:', decorations.find().length);
            }

            return decorations;
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});

/**
 * Process the node queue sequentially with animation timing.
 * This prevents browser crashes by inserting nodes one at a time.
 */
async function processQueueWithDelay(editor: Editor, storage: any, _animationDelay: number, options: any) {
  if (storage.isProcessingQueue) {
    console.log('[StreamingWS] ⚠️ Already processing queue, skipping duplicate call');
    return; // Already processing
  }

  storage.isProcessingQueue = true;
  console.log('[StreamingWS] 🎬 Starting queue processing');

  const processNext = async () => {
    // Check if paused
    if (storage.isPaused) {
      storage.isProcessingQueue = false;
      console.log('[StreamingWS] ⏸️ Queue processing paused');
      return;
    }

    // Get next node from queue
    const item = storage.nodeQueue.shift();

    if (!item) {
      // Queue empty
      storage.isProcessingQueue = false;
      console.log('[StreamingWS] ✅ Queue processing complete');
      return;
    }

    console.log('[StreamingWS] 📝 Processing node', storage.nodesInserted + 1, 'of', storage.totalNodesExpected);

    // Insert the node and wait for animation to complete
    try {
      // Wait for insertion and animation in a single promise chain
      await new Promise<void>((resolveInsertion) => {
        requestAnimationFrame(() => {
          try {
            const insertPos = storage.lastInsertPosition;
            const success = editor.commands.insertTiptapNode(item.node);

            if (success) {
              storage.nodesInserted++;
              console.log('[StreamingWS] ✅ Inserted node:', item.node.type, `(${storage.nodesInserted}/${storage.totalNodesExpected})`);
              
              // Skip animation for code blocks, tables, lists, task lists, and structured content - identify by node type
              const skipAnimation = item.node.type === 'codeBlock' || 
                                   item.node.type === 'code_block' ||
                                   item.node.type === 'code' ||
                                   item.node.type === 'table' ||
                                   item.node.type === 'tableRow' ||
                                   item.node.type === 'tableCell' ||
                                   item.node.type === 'tableHeader' ||
                                   item.node.type === 'bulletList' ||
                                   item.node.type === 'orderedList' ||
                                   item.node.type === 'listItem' ||
                                   item.node.type === 'taskList' ||
                                   item.node.type === 'taskItem' ||
                                   item.node.type === 'blockquote' ||
                                   item.node.type === 'horizontalRule' ||
                                   item.node.type === 'image' ||
                                   item.node.type === 'video' ||
                                   item.node.type === 'mathematics';
              
              if (skipAnimation) {
                console.log('[StreamingWS] ⏭️ Skipping animation for:', item.node.type);
                resolveInsertion();
                return;
              }
              
              // Apply animation directly to DOM element
              if (item.shouldAnimate && storage.animationsEnabled) {
                // Slight delay to ensure DOM is ready
                setTimeout(() => {
                  requestAnimationFrame(() => {
                    try {
                      const pos = insertPos;
                      const domNode = editor.view.nodeDOM(pos);
                      
                      if (domNode instanceof HTMLElement) {
                        console.log('[StreamingWS] 🎨 Starting animation for:', domNode.tagName);
                        
                        // Get the text content
                        const fullText = domNode.textContent || '';
                        
                        if (fullText.length > 0) {
                          try {
                            // Clear the content initially and set initial state
                            domNode.innerHTML = '';
                            domNode.style.opacity = '1';
                            domNode.style.minHeight = '1.5em'; // Prevent layout shift
                            
                            // Split into words
                            const words = fullText.split(' ');
                            const wordsPerChunk = 3; // Show 3 words at a time
                            const chunkDelay = 25; // ms per chunk
                            
                            // Calculate number of chunks
                            const numChunks = Math.ceil(words.length / wordsPerChunk);
                            
                            // Pre-create all word spans with opacity 0
                            const wordSpans: HTMLElement[] = [];
                            words.forEach((word, index) => {
                              const wordSpan = document.createElement('span');
                              wordSpan.textContent = word;
                              wordSpan.style.opacity = '0';
                              wordSpan.style.transition = 'opacity 0.3s ease-out';
                              wordSpan.style.display = 'inline';
                              wordSpan.setAttribute('data-word-index', index.toString());
                              domNode.appendChild(wordSpan);
                              wordSpans.push(wordSpan);
                              
                              // Add space after word (except last word)
                              if (index < words.length - 1) {
                                domNode.appendChild(document.createTextNode(' '));
                              }
                            });
                            
                            // Typing animation - fade in 3 words at a time
                            let chunkIndex = 0;
                            let animationCancelled = false;
                            
                            const fadeInNextChunk = () => {
                              // Check if animation was cancelled or editor destroyed
                              if (animationCancelled || editor.isDestroyed) {
                                console.log('[StreamingWS] ⚠️ Animation cancelled or editor destroyed');
                                resolveInsertion();
                                return;
                              }
                              
                              if (chunkIndex < numChunks) {
                                // Fade in the next chunk of words
                                const startIndex = chunkIndex * wordsPerChunk;
                                const endIndex = Math.min((chunkIndex + 1) * wordsPerChunk, words.length);
                                
                                for (let i = startIndex; i < endIndex; i++) {
                                  const wordSpan = wordSpans[i];
                                  if (wordSpan && wordSpan.parentNode === domNode) {
                                    requestAnimationFrame(() => {
                                      wordSpan.style.opacity = '1';
                                    });
                                  }
                                }
                                
                                chunkIndex++;
                                setTimeout(fadeInNextChunk, chunkDelay);
                              } else {
                                // Animation complete - clean up and resolve
                                console.log('[StreamingWS] ✨ Animation complete');
                                domNode.style.minHeight = '';
                              
                                // Animation complete - clean up and resolve
                                console.log('[StreamingWS] ✨ Animation complete');
                                domNode.style.minHeight = '';
                                
                                // Replace spans with plain text after animation completes
                                setTimeout(() => {
                                  if (!editor.isDestroyed && domNode.parentNode) {
                                    try {
                                      domNode.textContent = fullText;
                                    } catch (cleanupErr) {
                                      console.warn('[StreamingWS] ⚠️ Cleanup error:', cleanupErr);
                                    }
                                  }
                                  // IMPORTANT: Only resolve after cleanup is complete
                                  resolveInsertion();
                                }, 300);
                              }
                            };
                            
                            // Store cancel function for cleanup
                            (domNode as any).__cancelAnimation = () => {
                              animationCancelled = true;
                            };
                            
                            // Start typing immediately
                            fadeInNextChunk();
                          } catch (animError) {
                            console.error('[StreamingWS] ❌ Animation setup error:', animError);
                            // Fallback: show text immediately
                            domNode.textContent = fullText;
                            resolveInsertion();
                          }
                        } else {
                          // Empty node, no animation needed
                          resolveInsertion();
                        }
                      } else {
                        console.warn('[StreamingWS] ⚠️ DOM node is not an HTMLElement:', domNode);
                        resolveInsertion();
                      }
                    } catch (err) {
                      console.error('[StreamingWS] ❌ Animation DOM error:', err);
                      resolveInsertion();
                    }
                  });
                }, 10); // Small delay to ensure DOM is ready
              } else {
                // No animation, resolve immediately
                resolveInsertion();
              }

              // Smart auto-scroll: only scroll when near bottom (Claude-style)
              const autoScroll = options.autoScroll;
              const scrollTarget = options.scrollTarget;
              
              if (autoScroll) {
                setTimeout(() => {
                  try {
                    const editorElement = editor.view.dom as HTMLElement;
                    
                    if (scrollTarget === 'browser') {
                      // Browser window scrolling
                      const windowHeight = window.innerHeight;
                      const documentHeight = document.documentElement.scrollHeight;
                      const scrollTop = window.scrollY;
                      const distanceFromBottom = documentHeight - (scrollTop + windowHeight);
                      
                      // Only scroll if we're within threshold of bottom
                      if (distanceFromBottom < storage.scrollThreshold) {
                        window.scrollTo({
                          top: documentHeight,
                          behavior: 'smooth'
                        });
                      }
                    } else {
                      // Container scrolling - find the scrollable parent container
                      let scrollContainer = editorElement.parentElement;
                      
                      // Walk up the DOM to find the scrollable container
                      while (scrollContainer) {
                        const overflowY = window.getComputedStyle(scrollContainer).overflowY;
                        if (overflowY === 'auto' || overflowY === 'scroll') {
                          break;
                        }
                        scrollContainer = scrollContainer.parentElement;
                      }
                      
                      if (scrollContainer) {
                        const containerHeight = scrollContainer.clientHeight;
                        const scrollHeight = scrollContainer.scrollHeight;
                        const scrollTop = scrollContainer.scrollTop;
                        const distanceFromBottom = scrollHeight - (scrollTop + containerHeight);
                        
                        console.log('[StreamingWS] 📏 Scroll check:', {
                          containerHeight,
                          scrollHeight,
                          scrollTop,
                          distanceFromBottom,
                          threshold: storage.scrollThreshold
                        });
                        
                        // Only scroll if we're within threshold of bottom
                        if (distanceFromBottom < storage.scrollThreshold) {
                          console.log('[StreamingWS] 📜 Auto-scrolling to bottom');
                          scrollContainer.scrollTo({
                            top: scrollHeight,
                            behavior: 'smooth'
                          });
                          storage.lastScrollTime = Date.now();
                        }
                      } else {
                        console.warn('[StreamingWS] ⚠️ No scrollable container found');
                      }
                    }
                  } catch (scrollError) {
                    console.warn('[StreamingWS] ⚠️ Auto-scroll error:', scrollError);
                  }
                }, 50); // Small delay to ensure DOM is updated
              }
            } else {
              console.error('[StreamingWS] ❌ Failed to insert node:', item.node);
              resolveInsertion();
            }
          } catch (error) {
            console.error('[StreamingWS] ❌ Error inserting node:', error);
            resolveInsertion();
          }
        });
      });

      // After current node's animation is FULLY complete, process next node
      console.log('[StreamingWS] ⏭️ Moving to next node');
      if (storage.nodeQueue.length > 0) {
        await processNext();
      } else {
        storage.isProcessingQueue = false;
        console.log('[StreamingWS] ✅ Queue processing complete. Total inserted:', storage.nodesInserted);
        
        // If backend already sent stream_complete, call the completion callback now
        if (storage.streamCompleteReceived) {
          console.log('[StreamingWS] 🎉 All nodes inserted, calling completion callback');
          if (storage.onStreamComplete) {
            storage.onStreamComplete({
              total_nodes: storage.nodesInserted,
            });
          }
          storage.streamCompleteReceived = false; // Reset for next stream
        }
      }
    } catch (error) {
      console.error('[StreamingWS] ❌ Error in queue processing:', error);
      storage.isProcessingQueue = false;
    }
  };

  processNext();
}

export default StreamingWebSocketExtension;
