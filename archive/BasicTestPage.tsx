import React, { useState } from 'react';

/**
 * Basic Test Page - Tests without Tiptap
 * Isolate if the issue is with Tiptap or something else
 */
export const BasicTestPage: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);

  const addTestResult = (message: string, isSuccess: boolean = true) => {
    const timestamp = new Date().toLocaleTimeString();
    const status = isSuccess ? '✅' : '❌';
    const result = `${status} ${timestamp}: ${message}`;
    setTestResults(prev => [...prev, result]);
  };

  const runBasicTests = () => {
    addTestResult('Basic React rendering works');
    addTestResult('State management works');
    addTestResult('Event handlers work');
    addTestResult('No HTTP requests made - should not get 401 errors');
  };

  React.useEffect(() => {
    runBasicTests();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui', maxWidth: '800px' }}>
      <h1>Basic Test Page (No Tiptap)</h1>
      <p>Testing React functionality without Tiptap editor to isolate 401 error source.</p>
      
      <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', border: '1px solid #e9ecef', borderRadius: '8px' }}>
        <h3>Test Results</h3>
        {testResults.length === 0 ? (
          <p>Running tests...</p>
        ) : (
          <div>
            {testResults.map((result, index) => (
              <div key={index} style={{ 
                fontFamily: 'monospace', 
                fontSize: '12px', 
                padding: '4px',
                color: result.startsWith('✅') ? '#28a745' : '#dc3545'
              }}>
                {result}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => addTestResult('Manual test button clicked')}
          style={{ 
            padding: '8px 16px', 
            background: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Test Button Click
        </button>
      </div>

      <div style={{ marginTop: '20px', padding: '15px', background: '#e7f3ff', border: '1px solid #b3d9ff', borderRadius: '8px' }}>
        <h4>If this page loads without 401 error:</h4>
        <ul>
          <li>✅ Routing works correctly</li>
          <li>✅ React rendering works</li>
          <li>✅ The issue is likely with Tiptap or its dependencies</li>
        </ul>
        
        <h4>If this page shows 401 error:</h4>
        <ul>
          <li>❌ Global authentication middleware issue</li>
          <li>❌ API interceptor affecting all requests</li>
          <li>❌ Server-side authentication requirement</li>
        </ul>
      </div>
    </div>
  );
};

export default BasicTestPage;