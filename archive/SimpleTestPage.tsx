import React from 'react';

/**
 * Simple Test Page - No external dependencies
 * Test if the routing and basic page loading works
 */
export const SimpleTestPage: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h1>Simple Test Page</h1>
      <p>If you can see this, the routing is working correctly.</p>
      <p>Current time: {new Date().toLocaleString()}</p>
      
      <div style={{ marginTop: '20px', padding: '10px', background: '#f0f0f0', borderRadius: '4px' }}>
        <strong>Test Status:</strong>
        <ul>
          <li>✅ React rendering working</li>
          <li>✅ Route accessible</li>
          <li>✅ No authentication blocking</li>
        </ul>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => alert('Button click works!')}
          style={{ padding: '8px 16px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
        >
          Test Button
        </button>
      </div>
    </div>
  );
};

export default SimpleTestPage;