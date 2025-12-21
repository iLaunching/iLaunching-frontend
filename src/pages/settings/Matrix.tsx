import React from 'react';
import { useOutletContext } from 'react-router-dom';

interface SmartHubContextType {
  theme: {
    text: string;
    background: string;
    background_opacity: string;
  };
}

const Matrix: React.FC = () => {
  const { theme } = useOutletContext<SmartHubContextType>();

  return (
    <div className="flex flex-col w-full h-full" style={{ padding: '60px 60px' }}>
      <h1 style={{ 
        fontSize: '28px', 
        fontWeight: 600, 
        marginBottom: '32px',
        color: theme.text,
        fontFamily: 'Work Sans, sans-serif'
      }}>
        Matrix
      </h1>
      
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: 600, 
          marginBottom: '16px',
          color: theme.text,
          fontFamily: 'Work Sans, sans-serif'
        }}>
          Matrix Configuration
        </h2>
      </div>

      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ 
          fontSize: '20px', 
          fontWeight: 600, 
          marginBottom: '16px',
          color: theme.text,
          fontFamily: 'Work Sans, sans-serif'
        }}>
          Connected Services
        </h2>
      </div>
    </div>
  );
};

export default Matrix;
