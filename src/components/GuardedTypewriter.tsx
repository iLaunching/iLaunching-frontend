import { useEffect, useState, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import AiIndicator from './tiptap/AiIndicator';
import Query from './tiptap/Query';
import CodeBlockWithHighlight from './tiptap/extensions/CodeBlockWithHighlight';

interface GuardedTypewriterProps {
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

export default function GuardedTypewriter({ 
  text, 
  speed = 30,
  className = "",
  style = {},
  onComplete,
  scrollContainer = false,
  aiIndicator,
  onEditorReady
}: GuardedTypewriterProps) {
  const [isTyping, setIsTyping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const aiIndicatorNodeRef = useRef<any>(null);
  const textRef = useRef('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Disable default code block
      }),
      CodeBlockWithHighlight,
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

  // Add click handler for checkbox toggles
  useEffect(() => {
    if (!editor) return;

    const handleClick = (event: Event) => {
      const target = event.target as HTMLElement;
      
      // Check if clicked on checkbox area (label or span)
      if (target.closest('.tiptap-task-item label')) {
        event.preventDefault();
        
        const taskItem = target.closest('.tiptap-task-item');
        if (taskItem) {
          const currentChecked = taskItem.getAttribute('data-checked') === 'true';
          const newChecked = !currentChecked;
          
          // Update the data attribute
          taskItem.setAttribute('data-checked', newChecked.toString());
          
          // Update the actual checkbox input
          const checkbox = taskItem.querySelector('input[type="checkbox"]') as HTMLInputElement;
          if (checkbox) {
            checkbox.checked = newChecked;
          }
        }
      }
    };

    // Add click listeners to the editor container
    const editorElement = containerRef.current?.querySelector('.ProseMirror');
    if (editorElement) {
      editorElement.addEventListener('click', handleClick);
      
      return () => {
        editorElement.removeEventListener('click', handleClick);
      };
    }
  }, [editor]);

  
  // Helper function to update content while preserving AI indicator
  const updateContentWithAI = (newContent: string) => {
    if (aiIndicator && aiIndicator.show) {
      // Create a temporary div to parse HTML and get the current content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = newContent;
      
      // Get current editor content without the AI indicator
      let currentDoc = editor.getJSON();
      
      // Filter out AI indicator to get clean content
      if (currentDoc.content) {
        currentDoc.content = currentDoc.content.filter((node: any) => node.type !== 'aiIndicator');
      } else {
        currentDoc.content = [];
      }
      
      // Set the HTML content (this will parse the HTML properly)
      editor.commands.setContent(newContent);
      
      // Now add the AI indicator back at the end
      if (!aiIndicatorNodeRef.current) {
        aiIndicatorNodeRef.current = {
          type: 'aiIndicator',
          attrs: {
            aiName: aiIndicator.aiName || 'AI Assistant',
            aiAcknowledge: aiIndicator.aiAcknowledge || '',
            text: '',
            id: 'main-ai-indicator' // Stable ID
          }
        };
      }
      
      // Insert AI indicator at the end
      editor.commands.insertContentAt(editor.state.doc.content.size, aiIndicatorNodeRef.current);
    } else {
      // No AI indicator - just set the HTML content directly
      editor.commands.setContent(newContent);
    }
  };

  useEffect(() => {
    if (!editor || !text) return;

    // GUARD: Check if editor already has content from this text
    // This is the most reliable way to prevent re-initialization with React Strict Mode
    const currentContent = editor.getText();
    if (currentContent.length > 0 && textRef.current === text) {
      console.log('GuardedTypewriter: Editor already has content for this text, skipping');
      return;
    }

    // New text detected - start typing
    console.log('GuardedTypewriter: Starting typewriter with text');
    textRef.current = text;
    setIsTyping(true);
    
    // Only initialize with AI indicator if editor is empty
    if (aiIndicator && aiIndicator.show && currentContent.length === 0) {
      // Initialize the stable AI indicator ref
      if (!aiIndicatorNodeRef.current) {
        aiIndicatorNodeRef.current = {
          type: 'aiIndicator',
          attrs: {
            aiName: aiIndicator.aiName || 'AI Assistant',
            aiAcknowledge: aiIndicator.aiAcknowledge || '',
            text: '',
            id: 'main-ai-indicator'
          }
        };
      }
      editor.commands.setContent({
        type: 'doc',
        content: [aiIndicatorNodeRef.current]
      });
    }

    let currentIndex = 0;
    
    // Check if text contains HTML formatting
    const hasHTML = text.includes('<');
    
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
            
            // Update editor content
            updateContentWithAI(currentHTML);
            
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
            setIsTyping(false);
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
      // Handle plain text - split into words for smoother flow
      const words = text.split(' ');
      let currentText = '';
      
      const typeInterval = setInterval(() => {
        if (currentIndex < words.length) {
          currentText += (currentIndex > 0 ? ' ' : '') + words[currentIndex];
          updateContentWithAI(currentText);
          currentIndex++;
          
          // Auto-scroll to follow text as it appears
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
          // Final text without cursor (AI indicator already present)
          updateContentWithAI(currentText);
          
          clearInterval(typeInterval);
          setIsTyping(false);
          if (onComplete) {
            onComplete();
          }
        }
      }, speed * 2); // Slower, word-by-word for smoother flow

      return () => clearInterval(typeInterval);
    }
  }, [text, speed, editor, onComplete]);

  // Add click functionality to checkboxes and ensure AI indicator stays at end
  useEffect(() => {
    if (!editor) return;

    const handleCheckboxClick = (event: Event) => {
      const target = event.target as HTMLElement;
      const taskItem = target.closest('li[data-type="taskItem"]');
      
      if (taskItem) {
        event.preventDefault();
        event.stopPropagation();
        
        const isChecked = taskItem.getAttribute('data-checked') === 'true';
        taskItem.setAttribute('data-checked', (!isChecked).toString());
        
        // The editor content is automatically updated by Tiptap
      }
    };

    // Add click listeners to the editor container
    const editorElement = containerRef.current?.querySelector('.ProseMirror');
    if (editorElement) {
      editorElement.addEventListener('click', handleCheckboxClick);
      
      return () => {
        editorElement.removeEventListener('click', handleCheckboxClick);
      };
    }
  }, [editor]);

  return (
    <div 
      ref={containerRef}
      className={`tiptap-typewriter ${isTyping ? 'typing' : ''} ${className}`}
      style={{
        ...style,
        minHeight: '200px',
        height: 'auto',
        overflowY: 'auto',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column-reverse',
       
        
      }}
    >
      <div className="relative">
        <EditorContent editor={editor} />
      </div>
      
      <style>{`
        .tiptap-typewriter {
          scrollbar-width: thin;
          scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
        }
        
        .tiptap-typewriter::-webkit-scrollbar {
          width: 6px;
        }
        
        .tiptap-typewriter::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .tiptap-typewriter::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.3);
          border-radius: 3px;
        }
        
        .tiptap-typewriter::-webkit-scrollbar-thumb:hover {
          background-color: rgba(156, 163, 175, 0.5);
        }
        
        .tiptap-typewriter .ProseMirror {
          padding: 0.75rem 1rem;
          line-height: 1.7;
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          word-wrap: break-word;
          white-space: pre-wrap;
          font-weight: 400;
          letter-spacing: 0.01em;
        }
        
        .tiptap-typewriter .ProseMirror p {
          margin: 0 0 1.2rem 0;
          animation: geminiSlideIn 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          transform: translateY(0);
        }
        
        .tiptap-typewriter .ProseMirror p:last-child {
          margin-bottom: 0;
        }
        
        /* Headers with Gemini-style */
        .tiptap-typewriter .ProseMirror h1 {
          font-size: 1.875rem;
          font-weight: 700;
          margin: 2rem 0 1.5rem 0;
          line-height: 1.2;
          animation: geminiSlideIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          letter-spacing: -0.02em;
        }
        
        .tiptap-typewriter .ProseMirror h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1.75rem 0 1rem 0;
          line-height: 1.3;
          animation: geminiSlideIn 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          letter-spacing: -0.01em;
        }
        
        .tiptap-typewriter .ProseMirror h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 1.5rem 0 0.75rem 0;
          line-height: 1.4;
          animation: geminiSlideIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }
        
        /* Wave word animation */
        .tiptap-typewriter .wave-word {
          display: inline-block;
        }
        
        /* Stagger the wave effect */
        .tiptap-typewriter .wave-word:nth-child(even) {
          animation-delay: 0.05s;
        }
        
        .tiptap-typewriter .wave-word:nth-child(3n) {
          animation-delay: 0.1s;
        }
        
        /* Text formatting */
        .tiptap-typewriter .ProseMirror strong {
          font-weight: 700;
        }
        
        .tiptap-typewriter .ProseMirror em {
          font-style: italic;
        }
        
        @keyframes geminiSlideIn {
          from {
            opacity: 0;
            transform: translateY(12px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>
    </div>
  );
}
