import { useState } from 'react';
import { StreamingEditor } from '../components/streaming/StreamingEditor';
import { useStreaming } from '../hooks/useStreaming.websocket';
import ChatWindowPrompt from '../components/ChatWindowPrompt';

export default function WebSocketTestPage() {
  const [editor, setEditor] = useState<any>(null);

  // Initialize streaming with WebSocket
  const streaming = useStreaming(editor, {
    apiUrl: import.meta.env.VITE_SALES_WS_URL || 'wss://sales-api-production-3088.up.railway.app',
    onStreamStart: (message) => {
      console.log('✅ Stream started:', message.metadata);
    },
    onStreamComplete: (message) => {
      console.log('✅ Stream completed:', message.total_chunks);
    },
    onError: (error) => {
      console.error('❌ Error:', error);
    }
  });

  const handleQuerySubmit = (content: any) => {
    if (!editor) return;
    
    // Extract the content nodes from the editor JSON
    let contentNodes = content?.content || [];
    
    // Filter out empty paragraphs (paragraphs with no content or only empty text)
    contentNodes = contentNodes.filter((node: any) => {
      // Keep non-paragraph nodes
      if (node.type !== 'paragraph') return true;
      
      // Filter out empty paragraphs
      if (!node.content || node.content.length === 0) return false;
      
      // Filter out paragraphs with only whitespace
      const hasContent = node.content.some((child: any) => {
        if (child.type === 'text') {
          return child.text && child.text.trim().length > 0;
        }
        return true; // Keep non-text nodes (like hard breaks, etc.)
      });
      
      return hasContent;
    });
    
    // Don't submit if no content after filtering
    if (contentNodes.length === 0) return;
    
    // Extract plain text from content nodes for API
    const queryText = contentNodes.map((node: any) => {
      if (node.type === 'paragraph' && node.content) {
        return node.content.map((child: any) => child.text || '').join('');
      }
      return '';
    }).join('\n');
    
    // Find AI Indicator position
    const { doc } = editor.state;
    let aiIndicatorPos = -1;
    
    doc.descendants((node, pos) => {
      if (node.type.name === 'aiIndicator') {
        aiIndicatorPos = pos;
        return false; // Stop early
      }
    });
    
    const insertPos = aiIndicatorPos >= 0 ? aiIndicatorPos : doc.content.size;
    
    // Generate unique IDs for this conversation turn
    const turnId = 'turn_' + Date.now() + '_' + Math.random().toString(36).substring(2, 9);
    const queryId = 'q_' + Date.now();
    const responseId = turnId; // Use same ID as turnId for simplicity
    const timestamp = new Date().toISOString();
    
    // Insert AITurn node with only Query child (no Response yet)
    editor.commands.insertContentAt(insertPos, {
      type: 'aiTurn',
      attrs: {
        turnId: turnId,
        timestamp: timestamp,
        summary: '', // Will be filled by LLM after response
        cites: [] // Will be filled if response includes citations
      },
      content: [
        {
          type: 'query',
          attrs: {
            user_avatar_type: 'text',
            user_avatar_text: 'U',
            user_first_name: 'User',
            user_surname: '',
            user_id: 'user_' + Date.now(),
            query_id: queryId
          },
          content: contentNodes // User's rich content
        }
      ]
    });
    
    console.log('💬 AITurn created with Query only:', { turnId, queryId });
    
    // Send query to LLM via streaming API
    streaming.addToQueue(queryText, {
      content_type: 'markdown',
      speed: 'normal',
      chunk_by: 'paragraph',
      responseId: responseId,
      turnId: turnId,
      timestamp: timestamp
    });
    
    return { turnId, queryId, responseId };
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">iLaunching AI Chat</h1>
            <p className="text-gray-600">Powered by streaming AI with real-time responses</p>
          </div>

          {/* Main Content - Transparent Editor */}
          <div className="bg-transparent">
            <StreamingEditor
              onEditorReady={setEditor}
              className="min-h-[400px]"
            />
          </div>
        </div>
      </div>
      
      {/* Chat Input - Sticky at Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="max-w-4xl mx-auto">
            <ChatWindowPrompt
              onSubmit={handleQuerySubmit}
              placeholder="Type your message..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
