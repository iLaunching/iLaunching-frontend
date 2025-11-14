import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import AiIndicator from './tiptap/AiIndicator';
import Query from './tiptap/Query';
import { StreamingAI } from './tiptap/StreamingAI';

interface ChatWindowEditorProps {
  text: string;
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
  onComplete?: () => void;
  /** Whether to scroll within a container instead of the window (for ChatWindow usage) */
  scrollContainer?: boolean;
  /** AI Indicator props - if provided, will insert an AI indicator node at the start */
  aiIndicator?: {
    aiName?: string;
    aiAcknowledge?: string;
    show: boolean;
  };
  /** Callback to expose editor instance for external operations */
  onEditorReady?: (editor: any) => void;
}

export default function ChatWindowEditor({ 
  text, 
  speed = 30,
  className = "",
  style = {},
  onComplete,
  scrollContainer = false,
  aiIndicator,
  onEditorReady
}: ChatWindowEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const aiIndicatorNodeRef = useRef<any>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      BulletList.configure({
        HTMLAttributes: {
          class: 'bullet-list',
        },
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: 'ordered-list',
        },
      }),
      ListItem.configure({
        HTMLAttributes: {
          class: 'list-item',
        },
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'task-list',
        },
      }),
      TaskItem.configure({
        HTMLAttributes: {
          class: 'task-item',
        },
        nested: true,
      }),
      AiIndicator,
      Query,
      StreamingAI,
    ],
    content: aiIndicator && aiIndicator.show ? {
      type: 'doc',
      content: [
        {
          type: 'aiIndicator',
          attrs: {
            aiName: aiIndicator.aiName || 'AI Assistant',
            aiAcknowledge: aiIndicator.aiAcknowledge || '',
            text: ''
          }
        }
      ]
    } : '',
    editable: false,
    parseOptions: {
      preserveWhitespace: 'full',
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm focus:outline-none min-h-[50px] w-full',
      },
    },
  });

  // Expose editor instance when ready
  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);



  // Listen for append content events (for testing API responses)
  useEffect(() => {
    if (!editor) {
      console.log('ChatWindowEditor: No editor available for event listener');
      return;
    }

    console.log('ChatWindowEditor: Setting up append content event listener');

    const handleAppendContent = (event: CustomEvent) => {
      console.log('ChatWindowEditor: Received append content event!', event);
      const rawContent = event.detail?.content;
      const isChunkStart = event.detail?.isChunkStart;
      const isChunkEnd = event.detail?.isChunkEnd;
      
      if (!rawContent) {
        console.log('ChatWindowEditor: No content in event detail');
        return;
      }
      
      console.log('ChatWindowEditor: Processing chunk:', { 
        content: rawContent.substring(0, 100) + '...',
        isChunkStart,
        isChunkEnd 
      });
      
      // Check if content is HTML or plain text
      const hasHTML = /<[^>]*>/.test(rawContent);
      console.log('ChatWindowEditor: Content type:', hasHTML ? 'HTML' : 'Plain text');
      
      if (hasHTML) {
        // Each chunk gets its own streaming animation
        appendHTMLWithAnimation(rawContent);
      } else {
        // Plain text - just insert directly
        let insertPos = editor.state.doc.content.size;
        editor.state.doc.descendants((node, pos) => {
          if (node.type.name === 'aiIndicator') {
            insertPos = pos;
            return false;
          }
        });
        
        const success = editor.commands.insertContentAt(insertPos, rawContent);
        if (!success) {
          editor.chain().focus('end').insertContent(rawContent).run();
        }
      }
    };

    // Function to append HTML chunks using StreamingAI extension
    const appendHTMLWithAnimation = (htmlChunk: string) => {
      console.log('ChatWindowEditor: StreamingAI processing chunk:', {
        length: htmlChunk.length,
        preview: htmlChunk.substring(0, 200) + '...',
        hasHTML: /<[^>]*>/.test(htmlChunk)
      });
      
      if (!editor) {
        console.error('ChatWindowEditor: No editor available');
        return;
      }
      
      // Use the custom StreamingAI command for this chunk
      console.log('ChatWindowEditor: Calling streamAIResponse with chunk');
      editor.commands.streamAIResponse(htmlChunk);
    };

    // Listen for the custom event
    window.addEventListener('appendTestContent', handleAppendContent as EventListener);
    console.log('ChatWindowEditor: Event listener added to window');
    
    return () => {
      console.log('ChatWindowEditor: Removing event listener');
      window.removeEventListener('appendTestContent', handleAppendContent as EventListener);
    };
  }, [editor]);

  // Add click handler for checkbox toggles
  useEffect(() => {
    if (!editor) return;

    const handleClick = (event: Event) => {
      const target = event.target as HTMLElement;
      
      // Handle task item checkboxes
      if (target.matches('.task-item input[type="checkbox"]') || target.closest('.task-item input[type="checkbox"]')) {
        const checkbox = target.matches('input[type="checkbox"]') ? target as HTMLInputElement : target.closest('input[type="checkbox"]') as HTMLInputElement;
        if (checkbox) {
          // Let Tiptap handle the toggle naturally
          checkbox.addEventListener('change', () => {
            // Optional: Add any custom behavior after toggle
          });
        }
      }
    };

    // Add event listener to the editor element
    const editorElement = editor.view.dom;
    editorElement.addEventListener('click', handleClick);

    return () => {
      editorElement.removeEventListener('click', handleClick);
    };
  }, [editor]);

  let currentIndex = 0;

  // Track content to rebuild properly while preserving AI indicator
  const updateContentPreservingAI = (newContent: string) => {
    console.log('updateContentPreservingAI called with content length:', newContent.length);
    
    if (aiIndicator && aiIndicator.show) {
      // Get current AI indicator node if it exists
      const currentDoc = editor.getJSON();
      let aiIndicatorNode = null;
      
      if (currentDoc.content) {
        aiIndicatorNode = currentDoc.content.find((node: any) => node.type === 'aiIndicator');
      }
      
      // If no AI indicator exists, create one with unique ID
      if (!aiIndicatorNode) {
        aiIndicatorNode = {
          type: 'aiIndicator',
          attrs: {
            aiName: aiIndicator.aiName || 'AI Assistant',
            aiAcknowledge: aiIndicator.aiAcknowledge || '',
            text: '',
            id: 'main-ai-indicator-' + Date.now() // Unique ID for animation
          }
        };
      }
      
      // Build complete document with content + AI indicator
      if (/<[^>]*>/.test(newContent)) {
        try {
          // Parse HTML content by setting it temporarily
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = newContent;
          
          // Set content and then append AI indicator
          editor.commands.setContent(newContent);
          editor.commands.insertContentAt(editor.state.doc.content.size, aiIndicatorNode);
        } catch (e) {
          console.log('HTML parsing failed:', e);
          // Fallback to text
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = newContent;
          const textContent = tempDiv.textContent || '';
          editor.commands.setContent(textContent);
          editor.commands.insertContentAt(editor.state.doc.content.size, aiIndicatorNode);
        }
      } else {
        // Plain text
        editor.commands.setContent(newContent);
        editor.commands.insertContentAt(editor.state.doc.content.size, aiIndicatorNode);
      }
    } else {
      // No AI indicator - just set content
      editor.commands.setContent(newContent);
    }
  };  // Initialize content function - only used once at the start
  const initializeContentWithAI = (initialContent: string) => {
    console.log('initializeContentWithAI called with:', initialContent);
    
    if (aiIndicator && aiIndicator.show) {
      // Start with empty content first
      editor.commands.setContent('');
      
      // Then add AI indicator after a brief delay to trigger animation
      setTimeout(() => {
        if (!aiIndicatorNodeRef.current) {
          aiIndicatorNodeRef.current = {
            type: 'aiIndicator',
            attrs: {
              aiName: aiIndicator.aiName || 'AI Assistant',
              aiAcknowledge: aiIndicator.aiAcknowledge || '',
              text: '',
              id: 'main-ai-indicator-' + Date.now() // Unique ID to ensure fresh render
            }
          };
        }

        // Insert AI indicator to trigger animation
        editor.commands.insertContent(aiIndicatorNodeRef.current);
        console.log('AI indicator inserted with animation trigger');
      }, 100);
    } else {
      // No AI indicator - start empty
      editor.commands.setContent('');
    }
  };

  useEffect(() => {
    if (!editor || !text) return;

    // Clear and restart typing when text changes
    
    // Initialize the editor with proper setup
    console.log('ChatWindowEditor: Initializing with aiIndicator:', aiIndicator);
    
    initializeContentWithAI('');

    // Reset the index for typewriter effect
    currentIndex = 0;

    // Check if content is HTML or plain text
    const hasHTML = /<[^>]*>/.test(text);
    console.log('ChatWindowEditor: Content type:', hasHTML ? 'HTML' : 'Plain text');
    console.log('ChatWindowEditor: Text to type:', text.substring(0, 200) + (text.length > 200 ? '...' : ''));

    if (hasHTML) {
      // Parse HTML into structured elements for smooth animation with wave effect
      const typeHTMLWithWave = () => {
        // Parse HTML and extract words while preserving structure
        const parseHTMLToWords = (htmlText: string) => {
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = htmlText;
          
          const wordElements: Array<{
            type: 'word' | 'tag-open' | 'tag-close' | 'break';
            content: string;
            tagName?: string;
            attributes?: string;
          }> = [];
          
          const processNode = (node: Node) => {
            if (node.nodeType === Node.TEXT_NODE) {
              const text = node.textContent;
              if (text) {
                // Split into words and spaces, but handle them differently
                const parts = text.split(/(\s+)/); // Capture whitespace in groups
                parts.forEach((part) => {
                  if (part.length > 0) {
                    if (/^\s+$/.test(part)) {
                      // This is whitespace - add directly without animation
                      wordElements.push({
                        type: 'word',
                        content: part
                      });
                    } else if (part.trim().length > 0) {
                      // This is an actual word - mark for animation
                      wordElements.push({
                        type: 'word',
                        content: part
                      });
                    }
                  }
                });
              }
            } else if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              const tagName = element.tagName.toLowerCase();
              const attributes = Array.from(element.attributes)
                .map(attr => `${attr.name}="${attr.value}"`)
                .join(' ');
              
              // Add opening tag
              wordElements.push({
                type: 'tag-open',
                content: `<${tagName}${attributes ? ' ' + attributes : ''}>`,
                tagName,
                attributes
              });
              
              // Process children
              element.childNodes.forEach(child => processNode(child));
              
              // Add closing tag
              wordElements.push({
                type: 'tag-close',
                content: `</${tagName}>`,
                tagName
              });
            }
          };
          
          tempDiv.childNodes.forEach(node => processNode(node));
          return wordElements;
        };
        
        const elements = parseHTMLToWords(text);
        let currentHTML = '';
        let wordCount = 0;
        let insideTaskList = false;
        
        const typeInterval = setInterval(() => {
          if (currentIndex < elements.length) {
            const element = elements[currentIndex];
            
            // Track if we're inside a task list
            if (element.type === 'tag-open' && element.content.includes('data-type="taskList"')) {
              insideTaskList = true;
            } else if (element.type === 'tag-close' && element.tagName === 'ul' && insideTaskList) {
              insideTaskList = false;
            }
            
            if (element.type === 'word') {
              if (insideTaskList) {
                // Inside task list - add text directly to preserve Tiptap structure
                currentHTML += element.content;
                if (element.content.trim().length > 0) {
                  wordCount++;
                }
              } else {
                // Check if this is whitespace or actual word
                if (/^\s+$/.test(element.content)) {
                  // This is whitespace - add directly without animation span
                  currentHTML += element.content;
                } else if (element.content.trim().length > 0) {
                  // This is an actual word - add wave animation span
                  const wordSpan = `<span class="wave-word" style="animation-delay: ${wordCount * 0.08}s">${element.content}</span>`;
                  currentHTML += wordSpan;
                  wordCount++;
                } else {
                  // Empty or whitespace-only content
                  currentHTML += element.content;
                }
              }
            } else {
              // Add HTML tags directly
              currentHTML += element.content;
            }
            
            // Update editor content while preserving AI indicator
            updateContentPreservingAI(currentHTML);
            
            // Debug: Log when we encounter task list elements
            if (element.content.includes('taskList') || element.content.includes('taskItem')) {
              console.log('Task element:', element.content);
              console.log('Current HTML:', currentHTML);
              console.log('Editor HTML:', editor.getHTML());
              
              // Check what extensions are loaded
              console.log('Loaded extensions:', editor.extensionManager.extensions.map(ext => ext.name));
            }
            
            currentIndex++;
            
            // Auto-scroll to follow content
            if (containerRef.current) {
              if (scrollContainer) {
                // Scroll within container (for ChatWindow)
                const scrollableParent = containerRef.current.closest('.message-area') || containerRef.current.parentElement;
                if (scrollableParent && scrollableParent.scrollHeight > scrollableParent.clientHeight) {
                  scrollableParent.scrollTo({
                    top: scrollableParent.scrollHeight,
                    behavior: 'smooth'
                  });
                }
              } else {
                // Scroll window (for main page)
                const rect = containerRef.current.getBoundingClientRect();
                const elementBottom = rect.bottom;
                const windowHeight = window.innerHeight;
                
                if (elementBottom > windowHeight - 100) {
                  window.scrollTo({
                    top: window.scrollY + (elementBottom - windowHeight + 150),
                    behavior: 'smooth'
                  });
                }
              }
            }
          } else {
            clearInterval(typeInterval);
            if (onComplete) {
              onComplete();
            }
          }
        }, speed);
        
        return typeInterval;
      };
      
      const interval = typeHTMLWithWave();
      return () => clearInterval(interval);
    } else {
      // Plain text typing - character by character
      const typeInterval = setInterval(() => {
        if (currentIndex < text.length) {
          currentIndex++;
          // Update content with current substring
          updateContentPreservingAI(text.substring(0, currentIndex));
          
          // Auto-scroll to follow content
          if (containerRef.current) {
            if (scrollContainer) {
              // Scroll within container (for ChatWindow)
              const scrollableParent = containerRef.current.closest('.message-area') || containerRef.current.parentElement;
              if (scrollableParent && scrollableParent.scrollHeight > scrollableParent.clientHeight) {
                scrollableParent.scrollTo({
                  top: scrollableParent.scrollHeight,
                  behavior: 'smooth'
                });
              }
            } else {
              // Scroll window (for main page)
              const rect = containerRef.current.getBoundingClientRect();
              const elementBottom = rect.bottom;
              const windowHeight = window.innerHeight;
              
              if (elementBottom > windowHeight - 100) {
                window.scrollTo({
                  top: window.scrollY + (elementBottom - windowHeight + 150),
                  behavior: 'smooth'
                });
              }
            }
          }
        } else {
          clearInterval(typeInterval);
          if (onComplete) {
            onComplete();
          }
        }
      }, speed);

      return () => clearInterval(typeInterval);
    }
  }, [text, editor, speed, onComplete, aiIndicator, scrollContainer]);

  if (!editor) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className={`tiptap-typewriter ${className}`}
      style={style}
    >
      <EditorContent editor={editor} />
      
      {/* Add wave animation styles */}
      <style>{`
        /* Wave word animation - enhanced for typewriter effect */
        .tiptap-typewriter .wave-word {
          display: inline-block;
          opacity: 0;
          transform: translateY(30px) scale(0.8);
          animation: typewriterWave 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) both;
          animation-fill-mode: both;
        }
        
        /* Enhanced typewriter wave animation */
        @keyframes typewriterWave {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.8) rotateX(90deg);
          }
          50% {
            opacity: 0.7;
            transform: translateY(-5px) scale(1.1) rotateX(0deg);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1) rotateX(0deg);
          }
        }
        
        /* Wave-like text animations */
        @keyframes textWave {
          0% {
            opacity: 0;
            transform: translateY(20px) scale(0.8);
          }
          50% {
            opacity: 0.8;
            transform: translateY(-2px) scale(1.02);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        /* Task list styling */
        .task-list {
          list-style: none;
          padding-left: 0;
        }
        
        .task-item {
          display: flex;
          align-items: flex-start;
          margin: 0.5em 0;
        }
        
        .task-item > label {
          margin-right: 0.5em;
          user-select: none;
          flex-shrink: 0;
        }
        
        .task-item > div {
          flex: 1;
        }
        
        .task-item input[type="checkbox"] {
          margin: 0;
          cursor: pointer;
        }
        
        /* List styling */
        .bullet-list, .ordered-list {
          padding-left: 1.5em;
        }
        
        .list-item {
          margin: 0.25em 0;
        }
      `}</style>
    </div>
  );
}