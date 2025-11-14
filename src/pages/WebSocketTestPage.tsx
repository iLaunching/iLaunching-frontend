import { useState } from 'react';
import { StreamingEditor } from '../components/streaming/StreamingEditor';
import { useStreaming } from '../hooks/useStreaming.websocket';

export default function WebSocketTestPage() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [streamMetadata, setStreamMetadata] = useState<any>(null);
  const [editor, setEditor] = useState<any>(null);

  // Initialize streaming with WebSocket
  const streaming = useStreaming(editor, {
    apiUrl: import.meta.env.VITE_SALES_WS_URL || 'wss://sales-api-production-3088.up.railway.app',
    onStreamStart: (message) => {
      addTestResult(`✅ Stream started: ${message.metadata?.complexity || 'unknown'} complexity, ${message.metadata?.word_count || 0} words`);
      setStreamMetadata(message.metadata);
    },
    onStreamComplete: (message) => {
      addTestResult(`✅ Stream completed: ${message.total_chunks || 0} chunks processed`);
    },
    onError: (error) => {
      addTestResult(`❌ Error: ${error}`);
    }
  });

  const addTestResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()} - ${result}`]);
  };

  const runTest = (testName: string) => {
    addTestResult(`🧪 Running test: ${testName}`);
    
    switch(testName) {
      case 'plaintext':
        streaming.addToQueue('Hello from WebSocket! This is a simple text test with multiple words to see the streaming effect.', {
          content_type: 'text',
          speed: 'normal',
          chunk_by: 'word'
        });
        break;
        
      case 'htmlbasic':
        streaming.addToQueue('Testing <strong>bold text</strong> and <em>italic text</em> with <code>inline code</code>.', {
          content_type: 'html',
          speed: 'fast',
          chunk_by: 'word'
        });
        break;
        
      case 'markdown':
        streaming.addToQueue('# Markdown Test\n\nThis is **bold** and *italic* with `code`.', {
          content_type: 'markdown',
          speed: 'normal',
          chunk_by: 'word'
        });
        break;
        
      case 'adaptive':
        streaming.addToQueue('<h2>Complex HTML</h2><p>This is <strong>nested <em>formatting</em> with</strong> multiple <code>elements</code>.</p><ul><li>Item 1</li><li>Item 2</li></ul>', {
          content_type: 'html',
          speed: 'adaptive',
          chunk_by: 'word'
        });
        break;
        
      case 'complex':
        streaming.addToQueue('<h2>Advanced HTML Test</h2><p>Testing <strong>bold with <em>nested italics</em> and <code>inline code</code></strong> all together.</p><ul><li>First <strong>bold item</strong></li><li>Second <em>italic item</em></li><li>Third item with <a href="https://example.com">a link</a></li></ul><blockquote>This is a <strong>quoted</strong> section with <em>emphasis</em>.</blockquote><p>Final paragraph with <code>code</code>, <strong>bold</strong>, and <em>italic</em>.</p>', {
          content_type: 'html',
          speed: 'normal',
          chunk_by: 'word'
        });
        break;
        
      case 'nested':
        streaming.addToQueue('<p>Testing <strong>triple <em>nested <u>underline</u> formatting</em> levels</strong> and <code>code with <strong>bold inside</strong></code>.</p>', {
          content_type: 'html',
          speed: 'fast',
          chunk_by: 'word'
        });
        break;
        
      case 'lists':
        streaming.addToQueue('<h3>Shopping List</h3><ul><li><strong>Apples</strong> - <em>5 pieces</em></li><li><strong>Bananas</strong> - <em>3 bunches</em></li><li><strong>Oranges</strong> - <em>2 dozen</em></li></ul><h3>To-Do List</h3><ol><li>Review <code>code changes</code></li><li>Test <strong>HTML streaming</strong></li><li>Deploy to <em>production</em></li></ol>', {
          content_type: 'html',
          speed: 'normal',
          chunk_by: 'word'
        });
        break;
        
      case 'colors':
        streaming.addToQueue('<h2 style="color: #2563eb;">Advanced Styling Test</h2><p>Text with <span style="color: #dc2626; font-weight: bold;">red bold</span>, <span style="color: #16a34a; font-style: italic;">green italic</span>, and <span style="color: #9333ea; background-color: #fef3c7; padding: 2px 4px;">purple on yellow background</span>.</p><p style="background-color: #e0f2fe; padding: 10px; border-left: 4px solid #0284c7;">This is a <strong>highlighted callout box</strong> with <code style="background-color: #fecaca; color: #991b1b;">colored code</code> inside.</p>', {
          content_type: 'html',
          speed: 'normal',
          chunk_by: 'word'
        });
        break;
        
      case 'table':
        streaming.addToQueue('<h3>Data Table Example</h3><table style="border-collapse: collapse; width: 100%;"><thead><tr style="background-color: #f3f4f6;"><th style="border: 1px solid #d1d5db; padding: 8px;"><strong>Name</strong></th><th style="border: 1px solid #d1d5db; padding: 8px;"><strong>Status</strong></th><th style="border: 1px solid #d1d5db; padding: 8px;"><strong>Code</strong></th></tr></thead><tbody><tr><td style="border: 1px solid #d1d5db; padding: 8px;"><em>Item 1</em></td><td style="border: 1px solid #d1d5db; padding: 8px;"><span style="color: #16a34a; font-weight: bold;">✓ Active</span></td><td style="border: 1px solid #d1d5db; padding: 8px;"><code>ABC-123</code></td></tr><tr style="background-color: #f9fafb;"><td style="border: 1px solid #d1d5db; padding: 8px;"><em>Item 2</em></td><td style="border: 1px solid #d1d5db; padding: 8px;"><span style="color: #ea580c; font-weight: bold;">⚠ Pending</span></td><td style="border: 1px solid #d1d5db; padding: 8px;"><code>DEF-456</code></td></tr><tr><td style="border: 1px solid #d1d5db; padding: 8px;"><em>Item 3</em></td><td style="border: 1px solid #d1d5db; padding: 8px;"><span style="color: #dc2626; font-weight: bold;">✗ Inactive</span></td><td style="border: 1px solid #d1d5db; padding: 8px;"><code>GHI-789</code></td></tr></tbody></table>', {
          content_type: 'html',
          speed: 'normal',
          chunk_by: 'word'
        });
        break;
        
      case 'mega':
        streaming.addToQueue('<div style="border: 2px solid #3b82f6; border-radius: 8px; padding: 16px; background-color: #eff6ff;"><h2 style="color: #1e40af; margin-top: 0;">🚀 Mega Complex HTML Test</h2><p>This test combines <strong style="color: #dc2626;">everything</strong>: <span style="background-color: #fef3c7; padding: 2px 6px; border-radius: 3px;"><code style="color: #854d0e;">styled code blocks</code></span>, <em style="color: #7c3aed;">colored emphasis</em>, and <a href="#" style="color: #2563eb; text-decoration: underline;">styled links</a>.</p><table style="width: 100%; border-collapse: collapse; margin: 12px 0;"><tr style="background-color: #dbeafe;"><td style="border: 1px solid #93c5fd; padding: 6px;"><strong>Feature</strong></td><td style="border: 1px solid #93c5fd; padding: 6px;"><strong>Value</strong></td></tr><tr><td style="border: 1px solid #93c5fd; padding: 6px;"><code>streaming</code></td><td style="border: 1px solid #93c5fd; padding: 6px;"><span style="color: #16a34a;">✓ Enabled</span></td></tr></table><blockquote style="border-left: 4px solid #f59e0b; padding-left: 12px; margin: 12px 0; color: #92400e; background-color: #fef3c7; padding: 8px;">Important: This demonstrates <strong>deeply nested</strong> formatting with <em>multiple <code style="background-color: #fed7aa;">style</code> attributes</em> and <span style="color: #dc2626;">complex <strong>tag combinations</strong></span>.</blockquote><ul style="list-style-type: none; padding-left: 0;"><li style="padding: 4px 0;">✅ <strong style="color: #059669;">Success</strong>: All tests passing</li><li style="padding: 4px 0;">⚡ <strong style="color: #0284c7;">Performance</strong>: Optimized streaming</li><li style="padding: 4px 0;">🎨 <strong style="color: #9333ea;">Styling</strong>: Full CSS support</li></ul></div>', {
          content_type: 'html',
          speed: 'normal',
          chunk_by: 'word'
        });
        break;
        
      case 'sentence':
        streaming.addToQueue('First sentence here. Second sentence follows. Third sentence completes the test. Final sentence for good measure.', {
          content_type: 'text',
          speed: 'fast',
          chunk_by: 'sentence'
        });
        break;
        
      case 'javascript':
        streaming.addToQueue('<h3>JavaScript Example</h3><pre data-language="javascript"><code class="language-javascript">function greet(name) {\n  console.log(`Hello, ${name}!`);\n  return {\n    message: `Welcome, ${name}`,\n    timestamp: Date.now()\n  };\n}\n\nconst user = { name: "Alice", age: 30 };\ngreet(user.name);</code></pre>', {
          content_type: 'html',
          speed: 'fast',
          chunk_by: 'word'
        });
        break;
        
      case 'python':
        streaming.addToQueue('<h3>Python Example</h3><pre data-language="python"><code class="language-python">def calculate_fibonacci(n):\n    """Calculate Fibonacci sequence up to n terms."""\n    fib_sequence = [0, 1]\n    \n    for i in range(2, n):\n        next_fib = fib_sequence[i-1] + fib_sequence[i-2]\n        fib_sequence.append(next_fib)\n    \n    return fib_sequence\n\nresult = calculate_fibonacci(10)\nprint(f"Fibonacci sequence: {result}")</code></pre>', {
          content_type: 'html',
          speed: 'fast',
          chunk_by: 'word'
        });
        break;
        
      case 'typescript':
        streaming.addToQueue('<h3>TypeScript Example</h3><pre data-language="typescript"><code class="language-typescript">interface User {\n  id: number;\n  name: string;\n  email: string;\n}\n\nclass UserService {\n  private users: User[] = [];\n  \n  addUser(user: User): void {\n    this.users.push(user);\n    console.log(`Added user: ${user.name}`);\n  }\n  \n  getUser(id: number): User | undefined {\n    return this.users.find(u => u.id === id);\n  }\n}</code></pre>', {
          content_type: 'html',
          speed: 'fast',
          chunk_by: 'word'
        });
        break;
        
      case 'html':
        streaming.addToQueue('Testing <strong>bold text</strong> and <em>italic text</em> with <code>inline code</code>.', {
          content_type: 'html',
          speed: 'fast',
          chunk_by: 'word'
        });
        break;
        
      case 'mixed':
        streaming.addToQueue('<h2>Full Stack Example</h2><p>Here\'s a complete example with <strong>multiple languages</strong>:</p><h4>Frontend (React)</h4><pre data-language="jsx"><code class="language-jsx">import React, { useState } from "react";\n\nfunction Counter() {\n  const [count, setCount] = useState(0);\n  return (\n    <div>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(count + 1)}>\n        Increment\n      </button>\n    </div>\n  );\n}</code></pre><h4>Backend (Python)</h4><pre data-language="python"><code class="language-python">from fastapi import FastAPI\n\napp = FastAPI()\n\n@app.get("/api/count")\nasync def get_count():\n    return {"count": 42, "status": "success"}</code></pre><p>This demonstrates <strong>syntax highlighting</strong> for multiple code blocks!</p>', {
          content_type: 'html',
          speed: 'normal',
          chunk_by: 'word'
        });
        break;
        
      case 'clear':
        editor?.commands.clearContent();
        editor?.commands.setContent('<p>Cleared! Ready for next test.</p>');
        addTestResult('✅ Editor cleared');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">WebSocket Streaming Test</h1>
          <p className="text-gray-600 mt-2">Testing sales-api-minimal streaming integration</p>
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-4 text-sm">
              <div className={`px-3 py-1 rounded-full ${streaming.isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {streaming.isConnected ? '🟢 Connected' : '🔴 Disconnected'}
              </div>
              <div className={`px-3 py-1 rounded-full ${streaming.isStreaming ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'}`}>
                {streaming.isStreaming ? '⚡ Streaming' : '💤 Idle'}
              </div>
              <div className="px-3 py-1 rounded-full bg-purple-100 text-purple-700">
                📦 Queue: {streaming.queueLength}
              </div>
              {streamMetadata && (
                <div className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-700">
                  🎯 Complexity: {streamMetadata.complexity}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Left: Editor */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Streaming Editor</h2>
            <StreamingEditor onEditorReady={setEditor} />
          </div>

          {/* Right: Tests & Results */}
          <div className="space-y-6">
            {/* Test Controls */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">WebSocket Tests</h2>
              
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-700">Content Types</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => runTest('plaintext')}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm font-medium"
                  >
                    📝 Plain Text
                  </button>
                  <button
                    onClick={() => runTest('htmlbasic')}
                    className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm font-medium"
                  >
                    🏷️ HTML Basic
                  </button>
                  <button
                    onClick={() => runTest('markdown')}
                    className="px-3 py-1 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 text-sm font-medium"
                  >
                    📄 Markdown
                  </button>
                </div>

                <h3 className="text-sm font-medium text-gray-700 mt-4">Advanced</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => runTest('adaptive')}
                    className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200 text-sm font-medium"
                  >
                    ⚡ Adaptive Speed
                  </button>
                  <button
                    onClick={() => runTest('sentence')}
                    className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-sm font-medium"
                  >
                    📖 Sentence Mode
                  </button>
                </div>

                <h3 className="text-sm font-medium text-gray-700 mt-4">Complex HTML Tests</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => runTest('complex')}
                    className="px-3 py-1 bg-orange-100 text-orange-700 rounded hover:bg-orange-200 text-sm font-medium"
                  >
                    🎨 Complex HTML
                  </button>
                  <button
                    onClick={() => runTest('nested')}
                    className="px-3 py-1 bg-pink-100 text-pink-700 rounded hover:bg-pink-200 text-sm font-medium"
                  >
                    🔗 Nested Tags
                  </button>
                  <button
                    onClick={() => runTest('lists')}
                    className="px-3 py-1 bg-teal-100 text-teal-700 rounded hover:bg-teal-200 text-sm font-medium"
                  >
                    📋 Lists
                  </button>
                </div>

                <h3 className="text-sm font-medium text-gray-700 mt-4">Code Block Tests (NEW!)</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => runTest('javascript')}
                    className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 text-sm font-medium"
                  >
                    💛 JavaScript
                  </button>
                  <button
                    onClick={() => runTest('python')}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200 text-sm font-medium"
                  >
                    🐍 Python
                  </button>
                  <button
                    onClick={() => runTest('typescript')}
                    className="px-3 py-1 bg-cyan-100 text-cyan-800 rounded hover:bg-cyan-200 text-sm font-medium"
                  >
                    💙 TypeScript
                  </button>
                  <button
                    onClick={() => runTest('mixed')}
                    className="px-3 py-1 bg-gradient-to-r from-yellow-100 via-blue-100 to-cyan-100 text-gray-800 rounded hover:from-yellow-200 hover:via-blue-200 hover:to-cyan-200 text-sm font-medium"
                  >
                    🌈 Mixed Languages
                  </button>
                </div>

                <h3 className="text-sm font-medium text-gray-700 mt-4">Extreme Tests</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => runTest('colors')}
                    className="px-3 py-1 bg-gradient-to-r from-red-100 to-blue-100 text-purple-700 rounded hover:from-red-200 hover:to-blue-200 text-sm font-medium"
                  >
                    🌈 Colors & Styles
                  </button>
                  <button
                    onClick={() => runTest('table')}
                    className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded hover:bg-cyan-200 text-sm font-medium"
                  >
                    📊 Table
                  </button>
                  <button
                    onClick={() => runTest('mega')}
                    className="px-3 py-1 bg-gradient-to-r from-purple-100 via-pink-100 to-orange-100 text-purple-800 rounded hover:from-purple-200 hover:via-pink-200 hover:to-orange-200 text-sm font-medium border-2 border-purple-300"
                  >
                    🚀 MEGA Complex
                  </button>
                  <button
                    onClick={() => runTest('clear')}
                    className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                  >
                    🗑️ Clear
                  </button>
                </div>

                {/* Stream Controls */}
                <h3 className="text-sm font-medium text-gray-700 mt-4">Stream Controls</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      streaming.pauseStream();
                      addTestResult('⏸️ Pause command sent');
                    }}
                    disabled={!streaming.isStreaming || streaming.isPaused}
                    className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    ⏸️ Pause
                  </button>
                  <button
                    onClick={() => {
                      streaming.resumeStream();
                      addTestResult('▶️ Resume command sent');
                    }}
                    disabled={!streaming.isPaused}
                    className="px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    ▶️ Resume
                  </button>
                  <button
                    onClick={() => {
                      streaming.skipStream();
                      addTestResult('⏭️ Skip command sent');
                    }}
                    disabled={!streaming.isStreaming}
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    ⏭️ Skip to End
                  </button>
                </div>
              </div>
            </div>

            {/* Test Results */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Test Results</h2>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                {testResults.length === 0 ? (
                  <p className="text-gray-500 text-sm">No tests run yet...</p>
                ) : (
                  <div className="space-y-1">
                    {testResults.map((result, index) => (
                      <div
                        key={index}
                        className="font-mono text-xs p-1"
                      >
                        {result}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
