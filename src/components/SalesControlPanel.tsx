/**
 * Sales Control Panel
 * Adaptive component controlled by MCP server commands from LLM
 * Displays dynamic content based on sales conversation
 */

import React from 'react';

interface SalesControlPanelProps {
  className?: string;
}

export const SalesControlPanel: React.FC<SalesControlPanelProps> = ({ 
  className = '' 
}) => {
  return (
    <div 
      className={`sales-control-panel ${className}`}
      style={{
        position: 'fixed',
        right: 0,
        top: 0,
        width: '55%',
        height: '100vh',
        padding: '2rem',
        boxSizing: 'border-box',
        overflowY: 'auto',
        overflowX: 'hidden',
        zIndex: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        padding: '3rem 2rem',
        textAlign: 'center',
        maxWidth: '600px',
        borderRadius: '24px',
        position: 'relative',
        zIndex: 0,
      }}>
        <h1 style={{
          color: '#ffffff',
          fontFamily: "'work sans', sans-serif",
          fontSize: '3rem',
          fontWeight: '400',
          lineHeight: '1.2',
          margin: 0,
          textShadow: '0 2px 20px rgba(0, 0, 0, 0.3)',
        }}>
          Stop dreaming,<br />
          Start launching,<br />
          Your success begins here
        </h1>
      </div>
    </div>
  );
};

export default SalesControlPanel;
