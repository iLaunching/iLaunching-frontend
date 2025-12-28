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
import { useOutletContext } from 'react-router-dom';
import { CanvasEngine } from '../components/Canvas/CanvasEngine.js';
import { CanvasErrorBoundary } from '../components/Canvas/ErrorBoundary.js';
import { TestNode } from '../components/Canvas/nodes/TestNode.js';
import { SmartMatrixNode } from '../components/Canvas/nodes/SmartMatrixNode.js';
import './SmartMatrix.css';

interface SmartHubContext {
  theme: {
    background: string;
    [key: string]: any;
  } | null;
}

const SmartMatrixCanvas: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<CanvasEngine | null>(null);
  const [isEngineReady, setIsEngineReady] = useState(false);
  const [fps, setFps] = useState(60);
  const [debugMode, setDebugMode] = useState(false);
  
  // Get theme from SmartHub context
  const context = useOutletContext<SmartHubContext>();
  const backgroundColor = context?.theme?.background || '#ffffff';

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

      // Add test nodes to demonstrate Phase 3
      const testNode = new TestNode('test-1', -300, 0);
      engineRef.current.getStateManager().addNode(testNode);
      
      // Add SmartMatrixNode (Stage 1: Visual Design) with user's appearance background color
      const smartNode = new SmartMatrixNode('smart-1', 100, 0, backgroundColor);
      engineRef.current.getStateManager().addNode(smartNode);

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
  }, [debugMode, backgroundColor]);

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

  // Handle node interactions
  useEffect(() => {
    const canvas = containerRef.current;
    if (!canvas || !engineRef.current) {
      return;
    }

    const engine = engineRef.current;
    const connectionManager = engine.getConnectionManager();

    const handleNodeMouseDown = (e: MouseEvent) => {
      // Only handle left click for nodes
      if (e.button === 0) {
        const rect = canvas.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        const camera = engine.getCamera();
        const [worldX, worldY] = camera.toWorld(screenX, screenY);
        
        // Check if clicking on a port to start connection
        const nodes = engine.getStateManager().getNodesArray();
        let clickedPort = false;
        
        for (const node of nodes) {
          const allPorts = [...node.getInputPorts(), ...node.getOutputPorts()];
          for (const port of allPorts) {
            const portPos = node.getPortPosition(port.id);
            if (portPos) {
              const dx = worldX - portPos.x;
              const dy = worldY - portPos.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              
              if (distance <= 15) { // Port click threshold
                connectionManager.startConnection(node.id, port.id, worldX, worldY);
                clickedPort = true;
                break;
              }
            }
          }
          if (clickedPort) break;
        }
        
        // If not clicking port, handle node selection/drag
        if (!clickedPort) {
          // Check if clicking on a link to delete it
          if (e.altKey) {
            const deleted = connectionManager.deleteLinkAtPoint(worldX, worldY);
            if (deleted) return;
          }
          
          engine.handleMouseDown(e);
        }
      }
    };

    const handleNodeMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const screenX = e.clientX - rect.left;
      const screenY = e.clientY - rect.top;
      const camera = engine.getCamera();
      const [worldX, worldY] = camera.toWorld(screenX, screenY);
      
      // Update connection preview if dragging
      if (connectionManager.isDragging()) {
        connectionManager.updateConnectionPreview(worldX, worldY);
      } else {
        // Check for link hover (for deletion feedback)
        connectionManager.checkLinkHover(worldX, worldY);
        engine.handleMouseMove(e);
      }
    };

    const handleNodeMouseUp = (e: MouseEvent) => {
      if (connectionManager.isDragging()) {
        const rect = canvas.getBoundingClientRect();
        const screenX = e.clientX - rect.left;
        const screenY = e.clientY - rect.top;
        const camera = engine.getCamera();
        const [worldX, worldY] = camera.toWorld(screenX, screenY);
        
        connectionManager.completeConnection(worldX, worldY);
      } else {
        engine.handleMouseUp(e);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      engine.handleKeyDown(e);
    };

    canvas.addEventListener('mousedown', handleNodeMouseDown);
    window.addEventListener('mousemove', handleNodeMouseMove);
    window.addEventListener('mouseup', handleNodeMouseUp);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      canvas.removeEventListener('mousedown', handleNodeMouseDown);
      window.removeEventListener('mousemove', handleNodeMouseMove);
      window.removeEventListener('mouseup', handleNodeMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEngineReady]);

  // Toggle debug mode
  const toggleDebug = () => {
    setDebugMode(!debugMode);
    if (engineRef.current) {
      engineRef.current.setDebugMode(!debugMode);
    }
  };
  
  // Add test node
  const addTestNode = () => {
    if (engineRef.current) {
      const nodeCount = engineRef.current.getStateManager().getNodesArray().length;
      const testNode = new TestNode(
        `test-${nodeCount + 1}` as any,
        (nodeCount % 3) * 300 - 300,
        Math.floor(nodeCount / 3) * 200 - 100
      );
      engineRef.current.getStateManager().addNode(testNode);
    }
  };
  
  // Add Smart Matrix node
  const addSmartMatrixNode = () => {
    if (engineRef.current) {
      const nodeCount = engineRef.current.getStateManager().getNodesArray().length;
      const smartNode = new SmartMatrixNode(
        `smart-${nodeCount + 1}` as any,
        (nodeCount % 3) * 350,
        Math.floor(nodeCount / 3) * 300,
        backgroundColor
      );
      engineRef.current.getStateManager().addNode(smartNode);
    }
  };

  return (
    <div 
      className="smart-matrix-container"
      role="application"
      aria-label="Smart Matrix Node Automation Builder"
    >
      {/* Test Toolbar */}
      {isEngineReady && (
        <div style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 100,
          display: 'flex',
          gap: '10px'
        }}>
          <button
            onClick={addTestNode}
            style={{
              padding: '10px 20px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            + Add Test Node
          </button>
          <button
            onClick={addSmartMatrixNode}
            style={{
              padding: '10px 20px',
              background: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            ✨ Add Smart Matrix
          </button>
          <button

            onClick={toggleDebug}
            style={{
              padding: '10px 20px',
              background: debugMode ? '#10b981' : '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {debugMode ? '✓' : ''} Debug
          </button>
        </div>
      )}
      
      {/* Canvas Container */}
      <div 
        ref={containerRef} 
        className="canvas-container"
        role="img"
        aria-label="Interactive canvas for node-based automation"
        tabIndex={0}
      />

      {/* Instructions Overlay */}
      {isEngineReady && (
        <div className="instructions-overlay" aria-live="polite">
          <div className="instructions-box">
            <h3>🎨 Canvas Controls - Phase 3: Connections</h3>
            <ul>
              <li><strong>Scroll Wheel:</strong> Zoom in/out at cursor</li>
              <li><strong>Middle Mouse:</strong> Pan canvas</li>
              <li><strong>Click Node:</strong> Select</li>
              <li><strong>Shift + Click:</strong> Multi-select</li>
              <li><strong>Alt + Drag:</strong> Box select</li>
              <li><strong>Drag Port:</strong> Create connection</li>
              <li><strong>Alt + Click Link:</strong> Delete connection</li>
              <li><strong>Delete Key:</strong> Delete selected</li>
            </ul>
            <p className="instructions-note">
              ✨ Drag from output (right) to input (left) ports to connect nodes!
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
