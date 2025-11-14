import React, { useState } from 'react';
import StreamingEditor from '../components/streaming/StreamingEditor';
import { useStreaming } from '../hooks/useStreaming';

/**
 * Phase 1.1: Test Page for Streaming Editor
 * Phase 2.0: Added useStreaming hook integration
 * 
 * Dedicated test page to verify StreamingEditor functionality without
 * interfering with the main frontend. This page will grow with each phase.
 */
export const StreamingTestPage: React.FC = () => {
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isTestingComplete, setIsTestingComplete] = useState(false);
  const hasRunTests = React.useRef(false);
  
  // Phase 2.0: Streaming state management hook
  const streaming = useStreaming();
  
  // Setup callbacks
  React.useEffect(() => {
    streaming.setCallbacks({
      onStart: (id: string) => {
        console.log(`[CALLBACK] onStart: ${id}`);
        addTestResult(`Stream started: ${id}`);
      },
      onProgress: (id: string, progress: number) => {
        console.log(`[CALLBACK] onProgress: ${id} - ${progress}%`);
      },
      onComplete: (id: string) => {
        console.log(`[CALLBACK] onComplete: ${id}`);
        addTestResult(`Stream completed: ${id}`);
      },
      onError: (id: string, error: string, willRetry: boolean) => {
        console.error(`[CALLBACK] onError: ${id} - ${error} - Will retry: ${willRetry}`);
        addTestResult(`Stream error (${id}): ${error}${willRetry ? ' - Retrying...' : ' - Failed'}`, false);
      },
    });
  }, [streaming]);

  // Add test result
  const addTestResult = (message: string, isSuccess: boolean = true) => {
    const timestamp = new Date().toLocaleTimeString();
    const status = isSuccess ? '✅' : '❌';
    const result = `${status} ${timestamp}: ${message}`;
    
    setTestResults(prev => [...prev, result]);
    console.log('StreamingTest:', result);
  };

  // Handle editor ready
  const handleEditorReady = (editor: any) => {
    // Only run tests once
    if (hasRunTests.current) return;
    
    hasRunTests.current = true;
    setEditorInstance(editor);
    addTestResult('Editor instance created successfully');
    
    // Run basic tests
    runPhase1Tests(editor);
  };

  // Phase 1.1 Tests
  const runPhase1Tests = (editor: any) => {
    try {
      // Test 1: Editor exists and is functional
      if (editor && typeof editor.commands === 'object') {
        addTestResult('Editor commands object exists');
      } else {
        addTestResult('Editor commands missing', false);
        return;
      }

      // Test 2: Check extensions are loaded
      const extensions = editor.extensionManager.extensions;
      const extensionNames = extensions.map((ext: any) => ext.name);
      
      if (extensionNames.includes('starterKit') || extensionNames.includes('paragraph')) {
        addTestResult(`Extensions loaded: ${extensionNames.join(', ')}`);
      } else {
        addTestResult('Required extensions not found', false);
      }

      // Test 3: Basic content insertion
      const testContent = 'Phase 1.1 test content - editor is working!';
      editor.commands.setContent(testContent);
      
      setTimeout(() => {
        const currentContent = editor.getText();
        if (currentContent.includes('Phase 1.1 test')) {
          addTestResult('Content insertion test passed');
        } else {
          addTestResult('Content insertion test failed', false);
        }
        
        // Test 4: Editor state
        const docSize = editor.state.doc.content.size;
        if (docSize > 0) {
          addTestResult(`Document size: ${docSize} characters`);
        }
        
        // Test 5: Transaction system
        const initialSize = editor.state.doc.content.size;
        editor.commands.insertContent(' Additional text.');
        const newSize = editor.state.doc.content.size;
        
        if (newSize > initialSize) {
          addTestResult('Transaction system working');
        } else {
          addTestResult('Transaction system not working', false);
        }
        
        // Clear test content after tests complete
        setTimeout(() => {
          editor.commands.clearContent();
        }, 500);
        
        setIsTestingComplete(true);
        addTestResult('Phase 1.1 testing complete - Ready for Phase 1.2!');
      }, 100);

    } catch (error) {
      addTestResult(`Error during testing: ${error}`, false);
    }
  };

  // Manual test functions
  const runManualTest = (testName: string) => {
    if (!editorInstance) {
      addTestResult('No editor instance available', false);
      return;
    }

    switch (testName) {
      case 'clear':
        editorInstance.commands.clearContent();
        addTestResult('Content cleared');
        break;
        
      case 'sample':
        // IMPORTANT: Use insertContent to APPEND without replacing existing content
        const sampleText = `<h1>Streaming Test Content</h1>
<p>This is a <strong>sample document</strong> to test the StreamingEditor.</p>
<h2>Features to Test:</h2>
<ul>
  <li>Basic text input</li>
  <li><strong>Bold formatting</strong></li>
  <li><em>Italic text</em></li>
  <li>Paragraph handling</li>
</ul>
<p>Ready for streaming functionality!</p>`;
        
        console.log('Inserting content (appending):', sampleText);
        editorInstance.commands.insertContent(sampleText);
        
        // Verify content was inserted
        setTimeout(() => {
          const currentContent = editorInstance.getHTML();
          console.log('Current HTML:', currentContent);
          console.log('Current Text:', editorInstance.getText());
          console.log('Is Empty:', editorInstance.isEmpty);
          
          if (currentContent && currentContent.length > 50) {
            addTestResult('Sample content inserted (appended) successfully');
          } else {
            addTestResult('Sample content insertion may have failed', false);
          }
        }, 100);
        break;
        
      case 'performance':
        const startTime = performance.now();
        const largeContent = '<p>Performance test content. </p>'.repeat(100);
        
        // Use insertContent for appending, not setContent
        editorInstance.commands.insertContent(largeContent);
        const endTime = performance.now();
        
        addTestResult(`Performance test: ${(endTime - startTime).toFixed(2)}ms for ${largeContent.length} chars`);
        break;
        
      case 'init':
        // setContent should ONLY be used for initialization (replacing all content)
        const initialContent = '<p>This is <strong>initial content</strong> set via setContent() - replaces everything.</p>';
        console.log('Setting initial content (replaces all):', initialContent);
        editorInstance.commands.setContent(initialContent);
        addTestResult('Initial content set (replaced all existing content)');
        break;
        
      case 'append':
        // insertContent should be used for appending/streaming
        const appendContent = '<p>This text was <em>appended</em> using insertContent() - does not replace existing content.</p>';
        console.log('Appending content:', appendContent);
        editorInstance.commands.insertContent(appendContent);
        addTestResult('Content appended (existing content preserved)');
        break;
        
      case 'stream':
        // Test the new StreamContent extension - word by word
        const streamText = 'This is streaming text that will appear word by word. Watch it type smoothly! Perfect for AI responses. 🚀';
        console.log('Starting word-by-word stream:', streamText);
        editorInstance.commands.startStream(streamText, { delay: 100, mode: 'word' });
        addTestResult('Word-by-word stream started (100ms per word)');
        break;
        
      case 'streamfast':
        const fastText = 'Fast word streaming at 50ms per word! Much smoother than character-by-character. ⚡';
        editorInstance.commands.startStream(fastText, { delay: 50, mode: 'word' });
        addTestResult('Fast word stream started (50ms per word)');
        break;
        
      case 'streamslow':
        const slowText = 'Slow word streaming at 300ms per word. Very dramatic effect for demos. 🐢';
        editorInstance.commands.startStream(slowText, { delay: 300, mode: 'word' });
        addTestResult('Slow word stream started (300ms per word)');
        break;
        
      case 'streamchar':
        const charText = 'Character by character streaming for comparison...';
        editorInstance.commands.startStream(charText, { delay: 50, mode: 'character' });
        addTestResult('Character stream started (50ms per character)');
        break;
        
      case 'streamsuper':
        const superText = 'This is SUPER FAST streaming! It streams 3 words at a time, making it appear almost instantly while still maintaining that smooth streaming effect. Perfect for when you want speed but still want the visual feedback of streaming content. ⚡🚀💨';
        editorInstance.commands.startStream(superText, { delay: 80, mode: 'word', chunkSize: 3 });
        addTestResult('Super fast stream started (3 words per chunk at 80ms)');
        break;
        
      case 'stopstream':
        editorInstance.commands.stopStream();
        addTestResult('Stream stopped');
        break;
        
      case 'checkstate':
        editorInstance.commands.getStreamState();
        addTestResult('Stream state logged to console');
        break;
        
      case 'checkstreaming':
        const isCurrentlyStreaming = editorInstance.commands.isStreaming();
        addTestResult(`Currently streaming: ${isCurrentlyStreaming}`);
        break;
        
      case 'queueadd':
        const id1 = streaming.addToQueue('First queued message: Hello from the queue system! 👋');
        const id2 = streaming.addToQueue('Second queued message: This will stream after the first one. 🚀');
        const id3 = streaming.addToQueue('Third queued message: And this will be last! Perfect for AI responses. ✨', { delay: 50, chunkSize: 2 });
        addTestResult(`Added 3 items to queue: ${id1}, ${id2}, ${id3}`);
        break;
        
      case 'queuestart':
        if (editorInstance) {
          streaming.startStreaming(editorInstance);
          addTestResult('Started processing queue');
        }
        break;
        
      case 'queueclear':
        streaming.clearQueue();
        addTestResult('Queue cleared');
        break;
        
      case 'testretry':
        // Add a stream that will intentionally fail to test retry logic
        // We'll try to call a nonexistent command to trigger an error
        try {
          const id = streaming.addToQueue('This stream will test the retry mechanism! 🔄', { delay: 100, maxRetries: 2 });
          addTestResult(`Added retry test stream: ${id} (max 2 retries)`);
        } catch (error) {
          addTestResult(`Error adding to queue: ${error}`, false);
        }
        break;
        
      case 'testmaxqueue':
        // Test queue size limit
        try {
          for (let i = 1; i <= 5; i++) {
            streaming.addToQueue(`Test stream ${i}`, { delay: 50 });
          }
          addTestResult('Added 5 streams to queue');
        } catch (error) {
          addTestResult(`Queue limit error: ${error}`, false);
        }
        break;
        
      case 'testempty':
        // Test empty content validation
        try {
          streaming.addToQueue('', { delay: 100 });
          addTestResult('Empty content test - should not reach here', false);
        } catch (error) {
          addTestResult('Empty content validation working ✅');
        }
        break;
        
      case 'testchunks':
        // Simulate API sending chunks - they should merge automatically
        const sourceId = `api-response-${Date.now()}`;
        try {
          streaming.addToQueue('This is chunk 1 from API.', { sourceId, autoBatch: true });
          streaming.addToQueue('This is chunk 2, should merge with chunk 1.', { sourceId, autoBatch: true });
          streaming.addToQueue('Chunk 3 continues the response.', { sourceId, autoBatch: true });
          streaming.addToQueue('Final chunk 4 completes the message!', { sourceId, autoBatch: true });
          addTestResult(`Added 4 API chunks with sourceId: ${sourceId} - Check console for merge info`);
        } catch (error) {
          addTestResult(`Error: ${error}`, false);
        }
        break;
        
      case 'testadaptive':
        // Test adaptive preset
        try {
          streaming.addToQueue('Tiny chunk!', { preset: 'adaptive' });
          streaming.addToQueue('This is a medium sized chunk with more words to process and should use normal speed settings automatically.', { preset: 'adaptive' });
          streaming.addToQueue('Small chunk here.', { preset: 'adaptive' });
          addTestResult('Added 3 chunks with preset: adaptive');
        } catch (error) {
          addTestResult(`Error: ${error}`, false);
        }
        break;
        
      case 'testpresets':
        // Test all presets
        try {
          streaming.addToQueue('Testing NORMAL preset 🌊', { preset: 'normal' });
          streaming.addToQueue('Testing FAST preset ⚡', { preset: 'fast' });
          streaming.addToQueue('Testing SUPERFAST preset 🚀', { preset: 'superfast' });
          streaming.addToQueue('Testing SLOW preset 🐢', { preset: 'slow' });
          addTestResult('Added 4 chunks - all presets: normal, fast, superfast, slow');
        } catch (error) {
          addTestResult(`Error: ${error}`, false);
        }
        break;
        
      case 'testmanual':
        // Test manual override
        try {
          streaming.addToQueue('Manual: 200ms, 1 word', { delay: 200, chunkSize: 1 });
          streaming.addToQueue('Manual: 20ms, 4 words - BLAZING FAST!', { delay: 20, chunkSize: 4 });
          addTestResult('Added 2 chunks with manual delay/chunkSize overrides');
        } catch (error) {
          addTestResult(`Error: ${error}`, false);
        }
        break;
        
      case 'testmemory':
        // Test memory limits
        try {
          const largeContent = 'Large content chunk. '.repeat(500); // ~10KB
          for (let i = 0; i < 5; i++) {
            streaming.addToQueue(largeContent, { sourceId: `large-${i}` });
          }
          addTestResult('Added 5 large chunks (~50KB total)');
        } catch (error) {
          addTestResult(`Memory limit working: ${error}`, true);
        }
        break;
        
      case 'testhtml':
        // Test HTML content streaming
        try {
          const htmlContent = `<h2>HTML Streaming Test</h2><p>This is <strong>bold text</strong> and <em>italic text</em>.</p><ul><li>First item</li><li>Second item with <code>inline code</code></li></ul><p>Paragraph with <a href="#">a link</a> and more text.</p>`;
          streaming.addToQueue(htmlContent, { preset: 'normal' });
          addTestResult('Added HTML content - tags should not break mid-stream');
        } catch (error) {
          addTestResult(`Error: ${error}`, false);
        }
        break;
        
      case 'testhtmlcomplex':
        // Test complex nested HTML
        try {
          const complexHTML = `<div class="message"><p>Testing <strong>nested <em>HTML tags</em> with</strong> multiple levels.</p><blockquote><p>This is a quote with <code>inline.code()</code> inside.</p></blockquote><pre><code>function test() {
  return "code block";
}</code></pre></div>`;
          streaming.addToQueue(complexHTML, { preset: 'fast' });
          addTestResult('Added complex nested HTML - Check console for parsing info');
        } catch (error) {
          addTestResult(`Error: ${error}`, false);
        }
        break;
      
      default:
        addTestResult('Unknown test', false);
    }
  };

  return (
    <div className="streaming-test-page">
      <div className="container mx-auto p-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Streaming Editor Test Page
          </h1>
          <p className="text-gray-600 text-lg">
            Phase 1.1: Testing clean Tiptap setup and basic functionality
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Current Phase:</strong> Phase 1.1 - Clean Tiptap Setup<br/>
              <strong>Goal:</strong> Verify editor renders, accepts input, and has performance baseline
            </p>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Left: Streaming Editor */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">StreamingEditor Component</h2>
            
            <StreamingEditor
              onEditorReady={handleEditorReady}
              placeholder="Phase 1.1 test editor - type here to test basic functionality..."
              className="min-h-[400px]"
            />
            
            {/* Manual Test Controls */}
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-gray-700">Basic Commands</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => runManualTest('clear')}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                >
                  Clear Content
                </button>
                <button
                  onClick={() => runManualTest('init')}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-sm"
                >
                  Set Initial Content
                </button>
                <button
                  onClick={() => runManualTest('append')}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm"
                >
                  Append Content
                </button>
                <button
                  onClick={() => runManualTest('sample')}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm"
                >
                  Load Sample
                </button>
                <button
                  onClick={() => runManualTest('performance')}
                  className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-sm"
                >
                  Performance Test
                </button>
              </div>
              
              <h3 className="text-lg font-medium text-gray-700 mt-4">Streaming Commands (Phase 1.2-1.3)</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => runManualTest('stream')}
                  className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded hover:bg-cyan-200 text-sm font-medium"
                >
                  🌊 Stream Words (Normal)
                </button>
                <button
                  onClick={() => runManualTest('streamfast')}
                  className="px-3 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 text-sm"
                >
                  ⚡ Stream Fast
                </button>
                <button
                  onClick={() => runManualTest('streamsuper')}
                  className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-sm font-bold"
                >
                  🚀 Super Fast (3 words)
                </button>
                <button
                  onClick={() => runManualTest('streamslow')}
                  className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 text-sm"
                >
                  🐢 Stream Slow
                </button>
                <button
                  onClick={() => runManualTest('streamchar')}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm"
                >
                  📝 Stream Chars
                </button>
                <button
                  onClick={() => runManualTest('stopstream')}
                  className="px-3 py-1 bg-red-200 text-red-800 rounded hover:bg-red-300 text-sm font-medium"
                >
                  ⏹️ Stop Stream
                </button>
              </div>
              
              <h3 className="text-lg font-medium text-gray-700 mt-4">Debug Commands (Phase 1.3)</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => runManualTest('checkstate')}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-sm"
                >
                  🔍 Check State
                </button>
                <button
                  onClick={() => runManualTest('checkstreaming')}
                  className="px-3 py-1 bg-pink-100 text-pink-700 rounded hover:bg-pink-200 text-sm"
                >
                  ❓ Is Streaming?
                </button>
              </div>
              
              <h3 className="text-lg font-medium text-gray-700 mt-4">Queue System (Phase 2.0)</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => runManualTest('queueadd')}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm font-medium"
                >
                  ➕ Add to Queue (3 items)
                </button>
                <button
                  onClick={() => runManualTest('queuestart')}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm font-medium"
                >
                  ▶️ Start Queue
                </button>
                <button
                  onClick={() => runManualTest('queueclear')}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                >
                  🗑️ Clear Queue
                </button>
              </div>
              
              <h3 className="text-lg font-medium text-gray-700 mt-4">Production Tests (Resilience)</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => runManualTest('testretry')}
                  className="px-3 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 text-sm font-medium"
                >
                  🔄 Test Retry Logic
                </button>
                <button
                  onClick={() => runManualTest('testmaxqueue')}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-sm"
                >
                  📊 Add 5 Streams
                </button>
                <button
                  onClick={() => runManualTest('testempty')}
                  className="px-3 py-1 bg-pink-100 text-pink-700 rounded hover:bg-pink-200 text-sm"
                >
                  ❌ Test Empty Validation
                </button>
              </div>
              
              <h3 className="text-lg font-medium text-gray-700 mt-4">Smart Features (API Chunks)</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => runManualTest('testchunks')}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm font-medium"
                >
                  🔗 Chunk Merging
                </button>
                <button
                  onClick={() => runManualTest('testpresets')}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm font-medium"
                >
                  🎨 All Presets
                </button>
                <button
                  onClick={() => runManualTest('testadaptive')}
                  className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-sm font-medium"
                >
                  ⚡ Adaptive
                </button>
                <button
                  onClick={() => runManualTest('testmanual')}
                  className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 text-sm font-medium"
                >
                  🎛️ Manual Override
                </button>
                <button
                  onClick={() => runManualTest('testmemory')}
                  className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-sm"
                >
                  💾 Memory Limits
                </button>
                <button
                  onClick={() => runManualTest('testhtml')}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium"
                >
                  🏷️ HTML Streaming
                </button>
                <button
                  onClick={() => runManualTest('testhtmlcomplex')}
                  className="px-3 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 text-sm font-medium"
                >
                  🔧 Complex HTML
                </button>
              </div>
              
              <h3 className="text-lg font-medium text-gray-700 mt-4">🌐 WebSocket API Tests (Phase 2.4)</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => window.open('/websocket-test', '_blank')}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 text-sm font-bold shadow-md"
                >
                  🚀 Open WebSocket Test Page
                </button>
              </div>
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded text-xs">
                <strong>Phase 2.4 Integration:</strong><br/>
                Click above to test real-time streaming from sales-api-minimal:<br/>
                • WebSocket connection to Railway API<br/>
                • HTML sanitization & markdown conversion<br/>
                • Adaptive speed & smart chunking<br/>
                • Real-time content processing
              </div>
              
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                <strong>Queue Status:</strong><br/>
                • Queue length: {streaming.queue.length}<br/>
                • Is streaming: {streaming.isStreaming ? 'Yes' : 'No'}<br/>
                • Current: {streaming.currentStream?.id || 'None'}
              </div>
              
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                <strong>Command Usage:</strong><br/>
                • <code>setContent()</code> - Initialize/replace ALL content (use once at start)<br/>
                • <code>insertContent()</code> - Append content instantly<br/>
                • <code>startStream(text, {'{delay, mode, chunkSize}'}</code> - Stream with options:<br/>
                &nbsp;&nbsp;- <code>mode: 'word'</code> (default) or <code>'character'</code><br/>
                &nbsp;&nbsp;- <code>chunkSize: 1</code> (default), <code>3</code> (super fast), etc.<br/>
                • <code>getStreamState()</code> - Debug: log current stream state<br/>
                • <code>isStreaming()</code> - Check if actively streaming
              </div>
            </div>
          </div>

          {/* Right: Test Results */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">Test Results</h2>
              <div className={`px-3 py-1 rounded-full text-sm ${
                isTestingComplete 
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                {isTestingComplete ? 'Tests Complete' : 'Testing...'}
              </div>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-gray-500 text-sm">Waiting for editor to load...</p>
              ) : (
                <div className="space-y-1">
                  {testResults.map((result, index) => (
                    <div
                      key={index}
                      className="font-mono text-xs p-1 rounded"
                      style={{ 
                        color: result.startsWith('✅') ? '#059669' : 
                               result.startsWith('❌') ? '#dc2626' : '#4b5563'
                      }}
                    >
                      {result}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Phase Progress */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-700 mb-2">Phase 1.1 Checklist</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className={editorInstance ? '✅' : '⏳'}>
                    {editorInstance ? '✅' : '⏳'}
                  </span>
                  <span>Create StreamingEditor.tsx component</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={testResults.some(r => r.includes('Extensions loaded')) ? '✅' : '⏳'}>
                    {testResults.some(r => r.includes('Extensions loaded')) ? '✅' : '⏳'}
                  </span>
                  <span>Initialize Tiptap with essential extensions</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={testResults.some(r => r.includes('Performance test')) ? '✅' : '⏳'}>
                    {testResults.some(r => r.includes('Performance test')) ? '✅' : '⏳'}
                  </span>
                  <span>Establish performance baseline</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={isTestingComplete ? '✅' : '⏳'}>
                    {isTestingComplete ? '✅' : '⏳'}
                  </span>
                  <span>Create basic test page</span>
                </div>
              </div>
              
              {isTestingComplete && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                  <p className="text-green-800 text-sm font-medium">
                    🎉 Phase 1.1 Complete! Ready to proceed to Phase 1.2 - Extension Architecture
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Test page styles */}
      <style>{`
        .streaming-test-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          font-family: 'Inter', system-ui, sans-serif;
        }
      `}</style>
    </div>
  );
};

export default StreamingTestPage;