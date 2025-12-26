/**
 * Smart Matrix Component
 * Node-based automation builder with Smart Matrix AI orchestration
 * Integrated into SmartHub as default view
 * 
 * Features:
 * - Infinite canvas with zoom and pan
 * - Production-ready error handling
 * - Accessibility support
 * - Performance monitoring
 */

import React, { useRef, useEffect, useState } from 'react';
import { CanvasEngine } from '../components/Canvas/CanvasEngine.js';
import { CanvasErrorBoundary } from '../components/Canvas/ErrorBoundary.js';
import './SmartMatrix.css';

const SmartMatrixCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<CanvasEngine | null>(null);
  const [isEngineReady, setIsEngineReady] = useState(false);
  const [fps, setFps] = useState(60);
  const [debugMode, setDebugMode] = useState(false);

  // Initialize Canvas Engine
  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    console.log('🚀 Initializing Canvas Engine...');

    try {
      // Create engine instance
      engineRef.current = new CanvasEngine({
        containerElement: containerRef.current,
        gridEnabled: true,
        gridSize: 50,
        snapToGrid: false,
        enableDebug: debugMode,
        initialCamera: {
          x: 0,
          y: 0,
          zoom: 1.0,
          minZoom: 0.1,
          maxZoom: 3.0
        }
      });

      // Start render loop
      engineRef.current.start();
      setIsEngineReady(true);

      // Setup FPS monitoring
      const fpsInterval = setInterval(() => {
        if (engineRef.current) {
          const metrics = engineRef.current.getPerformanceMetrics();
          setFps(metrics.fps);
        }
      }, 1000);

      // Cleanup
      return () => {
        clearInterval(fpsInterval);
        if (engineRef.current) {
          engineRef.current.stop();
          engineRef.current.destroy();
          engineRef.current = null;
        }
        setIsEngineReady(false);
      };
    } catch (error) {
      console.error('Failed to initialize Canvas Engine:', error);
    }
  }, [debugMode]);

  // Handle mouse wheel for zoom
  useEffect(() => {
    const canvas = containerRef.current;
    if (!canvas || !engineRef.current) {
      return;
    }

    const camera = engineRef.current.getCamera();

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      
      const rect = canvas.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;

      // Zoom at cursor position
      camera.zoomToPoint(-e.deltaY * 0.01, screenX, screenY);
      
      // Update background (uses dirty flag now)
      engineRef.current?.updateBackground();
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [isEngineReady]);

  // Handle middle mouse button pan with throttling
  useEffect(() => {
    const canvas = containerRef.current;
    if (!canvas || !engineRef.current) {
      return;
    }

    const camera = engineRef.current.getCamera();
    let isPanning = false;
    let lastX = 0;
    let lastY = 0;
    let animationFrameId: number | null = null;

    const handleMouseDown = (e: MouseEvent) => {
      if (e.button === 1) { // Middle mouse button
        e.preventDefault();
        isPanning = true;
        lastX = e.clientX;
        lastY = e.clientY;
        canvas.style.cursor = 'grabbing';
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning) {
        // Throttle pan updates using requestAnimationFrame
        if (animationFrameId === null) {
          animationFrameId = requestAnimationFrame(() => {
            const deltaX = e.clientX - lastX;
            const deltaY = e.clientY - lastY;
            
            camera.pan(-deltaX, -deltaY);
            engineRef.current?.updateBackground();
            
            lastX = e.clientX;
            lastY = e.clientY;
            animationFrameId = null;
          });
        }
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (e.button === 1) {
        isPanning = false;
        canvas.style.cursor = 'default';
        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }
      }
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isEngineReady]);

  // Toggle debug mode
  const toggleDebug = () => {
    setDebugMode(!debugMode);
    if (engineRef.current) {
      engineRef.current.setDebugMode(!debugMode);
    }
  };

  // Reset camera
  const resetCamera = () => {
    if (engineRef.current) {
      const camera = engineRef.current.getCamera();
      camera.reset();
      engineRef.current.updateBackground();
    }
  };

  return (
    <div 
      className="smart-matrix-container"
      role="application"
      aria-label="Smart Matrix Node Automation Builder"
    >
      {/* Canvas Container */}
      <div 
        ref={containerRef} 
        className="canvas-container"
        role="img"
        aria-label="Interactive canvas for node-based automation"
        tabIndex={0}
      />

      {/* Instructions Overlay (temporary, remove after Phase 2) */}
      {isEngineReady && (
        <div className="instructions-overlay" aria-live="polite">
          <div className="instructions-box">
            <h3>🎨 Canvas Controls</h3>
            <ul>
              <li><strong>Scroll Wheel:</strong> Zoom in/out at cursor</li>
              <li><strong>Middle Mouse Button:</strong> Pan canvas</li>
              <li><strong>Space + Drag:</strong> Pan canvas (coming soon)</li>
            </ul>
            <p className="instructions-note">
              Node creation and interactions coming in Phase 2!
            </p>
          </div>
        </div>
      )}

      {/* FPS Counter (debug mode) */}
      {debugMode && (
        <div className="fps-counter" aria-live="polite" aria-atomic="true">
          FPS: {Math.round(fps)}
        </div>
      )}
    </div>
  );
};

/**
 * Export with Error Boundary wrapper for production-ready error handling
 */
export const SmartMatrix: React.FC = () => {
  return (
    <CanvasErrorBoundary
      onError={(error, errorInfo) => {
        // Log to error tracking service
        console.error('🚨 Canvas Error:', error, errorInfo);
        // TODO: Send to Sentry or similar service
      }}
    >
      <SmartMatrixCanvas />
    </CanvasErrorBoundary>
  );
};

export default SmartMatrix;
