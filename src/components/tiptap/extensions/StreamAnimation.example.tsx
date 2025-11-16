/**
 * StreamAnimation Extension - Usage Example
 * 
 * This extension automatically detects new content being inserted into the editor
 * and applies smooth wave and fade animations to it. Perfect for streaming responses!
 */

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import StreamAnimation from './StreamAnimation';
import Response from './Response';
import AITurn from './AITurn';
import Query from './Query';
import StreamContent from './StreamContent';

// Example: Setting up editor with StreamAnimation
function MyEditor() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      
      // Add the StreamAnimation extension
      StreamAnimation.configure({
        enabled: true,           // Enable animations
        waveDuration: 800,       // 800ms for the bouncy wave effect
        fadeDuration: 500,       // 500ms for the line fade in
        fadeDelay: 0.3,          // Start fade at 30% of animation duration
      }),
      
      // Your other extensions
      Response,
      AITurn,
      Query,
      StreamContent,
    ],
    content: '',
  });

  return <EditorContent editor={editor} />;
}

// Example: How the animation works with streaming
function StreamingExample() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      StreamAnimation, // Just add this extension!
      Response,
      StreamContent,
    ],
  });

  // When you insert content during streaming, it will automatically animate
  const handleStreamChunk = (chunk: string, responseId: string) => {
    // Find the response node
    editor?.state.doc.descendants((node, pos) => {
      if (node.type.name === 'response' && node.attrs.responseId === responseId) {
        const insertPos = pos + node.nodeSize - 1;
        
        // Insert content - StreamAnimation will detect this and apply animations!
        editor?.chain()
          .insertContentAt(insertPos, `<p>${chunk}</p>`)
          .run();
        
        return false;
      }
    });
  };

  return <EditorContent editor={editor} />;
}

// Example: Controlling animation programmatically
function AnimationControl() {
  const editor = useEditor({
    extensions: [StarterKit, StreamAnimation],
  });

  const toggleAnimation = () => {
    // Enable/disable animations
    editor?.commands.setStreamAnimation(false);
  };

  const updateSettings = () => {
    // Update animation settings dynamically
    editor?.commands.updateStreamAnimationSettings({
      waveDuration: 600,  // Faster animation
      fadeDelay: 0.2,     // Less delay
    });
  };

  return (
    <div>
      <button onClick={toggleAnimation}>Toggle Animation</button>
      <button onClick={updateSettings}>Make Faster</button>
      <EditorContent editor={editor} />
    </div>
  );
}

// Example: How it integrates with your existing Response component
function IntegrationExample() {
  const editor = useEditor({
    extensions: [
      StarterKit,
      
      // 1. Add StreamAnimation extension
      StreamAnimation.configure({
        enabled: true,
        waveDuration: 800,
        fadeDuration: 500,
        fadeDelay: 0.3,
      }),
      
      // 2. Your existing extensions work as-is
      Response,
      AITurn,
      Query,
      StreamContent,
    ],
  });

  // 3. Your existing streaming code works without changes!
  // StreamAnimation automatically detects insertions and applies animations
  
  return <EditorContent editor={editor} />;
}

/**
 * Key Features:
 * 
 * 1. Automatic Detection:
 *    - Detects when new content is inserted via transactions
 *    - No need to manually trigger animations
 * 
 * 2. Smart Targeting:
 *    - Only animates block-level nodes (paragraphs, headings, lists)
 *    - Applies both line fade and word wave animations
 * 
 * 3. Performance:
 *    - Uses ProseMirror decorations (efficient)
 *    - Cleans up old decorations automatically
 *    - Uses CSS animations (GPU accelerated)
 * 
 * 4. Accessible:
 *    - Respects prefers-reduced-motion
 *    - Gracefully degrades for accessibility
 * 
 * 5. Customizable:
 *    - Adjust timing via options
 *    - Enable/disable dynamically
 *    - Compatible with all Tiptap extensions
 */

export { MyEditor, StreamingExample, AnimationControl, IntegrationExample };
