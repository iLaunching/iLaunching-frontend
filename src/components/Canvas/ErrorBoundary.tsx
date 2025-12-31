/**
 * Canvas Error Boundary
 * Catches and handles errors in the canvas rendering system
 * Production-ready error handling with fallback UI
 */

import React, { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class CanvasErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('🚨 Canvas Error:', error);
    console.error('Error Info:', errorInfo.componentStack);
    
    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);
    
    // Log to error tracking service (e.g., Sentry)
    // Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          padding: '2rem',
          backgroundColor: '#1a1a1a',
          color: '#ffffff'
        }}>
          <div style={{
            maxWidth: '600px',
            textAlign: 'center'
          }}>
            <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>
              ⚠️ Canvas Error
            </h2>
            <p style={{ marginBottom: '1rem', color: '#999' }}>
              The canvas engine encountered an error and needs to restart.
            </p>
            <details style={{ marginBottom: '1.5rem', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>
                Error Details
              </summary>
              <pre style={{
                padding: '1rem',
                backgroundColor: '#2a2a2a',
                borderRadius: '4px',
                overflow: 'auto',
                fontSize: '0.85rem'
              }}>
                {this.state.error?.toString()}
              </pre>
            </details>
            <button
              onClick={this.handleReset}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#0066cc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0052a3';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#0066cc';
              }}
            >
              Restart Canvas
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
