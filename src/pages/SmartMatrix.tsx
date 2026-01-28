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

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CanvasEngine } from '../components/Canvas/CanvasEngine.js';
import { CanvasErrorBoundary } from '../components/Canvas/ErrorBoundary.js';
import { TestNode } from '../components/Canvas/nodes/TestNode.js';
import { SmartMatrixNode } from '../components/Canvas/nodes/SmartMatrixNode.js';
import { useManifestSync } from '../hooks/useManifestSync';
import { useCanvasPersistence } from '../hooks/useCanvasPersistence';
import api from '../lib/api.js';
import './SmartMatrix.css';

interface SmartMatrixData {
  smart_matrix: {
    id: string;
    name: string;
    smart_hub_id: string;
    owner_id: string;
    color: string | null;
    order_number: number;
    created_at: string;
    modified_at: string;
  } | null;
  smart_hub: {
    id: string;
    name: string;
    show_grid: boolean;
    grid_style: string;
    snap_to_grid: boolean;
  } | null;
  theme: {
    background: string;
    text: string;
    header_overlay: string;
    header_background: string;
    solid_color: string;
    menu: string;
    border: string;
    line_grid_color: string;
    dotted_grid_color: string;
    [key: string]: any;
  } | null;
  profile: {
    id: string;
    user_id: string;
    first_name: string;
    surname: string;
  };
}

interface ManifestData {
  manifest_id: string;
  smart_matrix_id: string;
  user_id: string;
  master_context_id?: string; // Direct reference to master context (optimization)
  current_x: number;
  current_y: number;
  zoom_level: number;
  business_dna: Record<string, any>;
  created_at: string;
  updated_at: string;
  manifest?: { // Added manifest property to ManifestData interface based on the instruction's usage
    context_id: string;
  };
}

const SmartMatrixCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null); // State for canvas engine
  const containerRef = useRef<HTMLDivElement>(null); // Container for canvas
  const engineRef = useRef<CanvasEngine | null>(null);
  const hasInitialized = useRef(false); // Prevent double initialization
  const [isEngineReady, setIsEngineReady] = useState(false);
  const [fps, setFps] = useState(0);
  const [debugMode, setDebugMode] = useState(false);
  const queryClient = useQueryClient();

  // Fetch current smart matrix data from API server
  const { data: matrixData, isLoading, error } = useQuery<SmartMatrixData>({
    queryKey: ['current-smart-matrix'],
    queryFn: async () => {
      // Call API server endpoint - includes JWT token automatically
      const response = await api.get('/users/me/current-smart-matrix');
      console.log('📊 Smart Matrix data loaded:', response.data);
      console.log('🎨 Smart Matrix - Smart Hub Grid Settings:', {
        show_grid: response.data?.smart_hub?.show_grid,
        grid_style: response.data?.smart_hub?.grid_style,
        snap_to_grid: response.data?.smart_hub?.snap_to_grid,
        smart_hub_id: response.data?.smart_hub?.id,
        smart_hub_name: response.data?.smart_hub?.name
      });
      return response.data;
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch manifest data for spatial state (camera position, zoom)
  const { data: manifestData, isLoading: isManifestLoading, error: manifestError } = useQuery<ManifestData>({
    queryKey: ['manifest', matrixData?.smart_matrix?.id],
    queryFn: async () => {
      const response = await api.get(`/manifest/smart-matrix/${matrixData!.smart_matrix!.id}`);
      console.log('📍 Manifest data loaded:', response.data);
      return response.data;
    },
    enabled: !!matrixData?.smart_matrix?.id,
    staleTime: 30 * 1000,
    retry: (failureCount: number, error: any) => {
      const status = error?.response?.status;
      if (status === 404 || status === 401) return false;
      return failureCount < 2;
    },
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Phase 3: Canvas Persistence - Automatically load and save nodes
  const {
    persistNodeCreation,
    persistConnectionCreation,
    updateNodePosition,
    deleteNode,
    deleteConnection,
    isLoaded
  } = useCanvasPersistence({
    contextId: manifestData?.master_context_id, // Direct reference - no extra query needed!
    engine: engineRef.current,
    enabled: isEngineReady && !!manifestData?.master_context_id
  });

  console.log('🔄 Canvas persistence status:', {
    isLoaded,
    contextId: manifestData?.master_context_id,
    engineReady: isEngineReady
  });

  // Warn if manifest fails to load (but don't block canvas)
  if (manifestError) {
    console.warn('⚠️ Manifest load failed, using default camera position:', manifestError);
  }

  // Extract theme and grid settings from matrixData
  const backgroundColor = matrixData?.theme?.background || '#ffffff';
  const textColor = matrixData?.theme?.text || '#1f2937';
  const solidColor = matrixData?.theme?.solid_color || '#7F77F1';
  const borderLineColor = matrixData?.theme?.border || '#e5e7eb';
  const lineGridColor = matrixData?.theme?.line_grid_color || '#d6d6d6';
  const dottedGridColor = matrixData?.theme?.dotted_grid_color || '#a0a0a0';

  // Get grid settings from Smart Hub (linked via smart_matrix → smart_hub relationship)
  const showGrid = matrixData?.smart_hub?.show_grid ?? false;
  const gridStyle = matrixData?.smart_hub?.grid_style || 'line';
  const snapToGrid = matrixData?.smart_hub?.snap_to_grid ?? false;


  // Calculate the appropriate grid color based on grid style
  const gridColor = gridStyle === 'dotted' ? dottedGridColor : lineGridColor;

  const [gridType, setGridType] = useState<'lines' | 'dots'>(
    gridStyle === 'dotted' ? 'dots' : 'lines'
  );

  // Sync gridType state with context when it changes
  useEffect(() => {
    const newGridType = gridStyle === 'dotted' ? 'dots' : 'lines';
    // Only update if actually changed to prevent infinite loop
    if (gridType !== newGridType) {
      setGridType(newGridType);
    }
  }, [gridStyle, gridType]);


  // Production-ready position sync with smart batching and retry logic
  const { updatePosition, isDirty, syncStatus } = useManifestSync(
    manifestData?.manifest_id,
    matrixData?.smart_matrix?.id
  );

  // Log sync status changes
  useEffect(() => {
    if (syncStatus.status === 'saved') {
      console.log('✅ Position saved to manifest');
    } else if (syncStatus.status === 'error') {
      console.warn('⚠️ Position sync error:', syncStatus.errorMessage);
    }
  }, [syncStatus]);
  // Track when engine becomes ready
  useEffect(() => {
    console.log('🔔 isEngineReady changed to:', isEngineReady);
  }, [isEngineReady]);

  // Initialize Canvas Engine (only once when data is first loaded)
  useEffect(() => {
    // Don't initialize if already initialized, no container, or no data
    if (hasInitialized.current || !containerRef.current || !matrixData) {
      console.log('⏸️ Skipping canvas initialization:', {
        hasInitialized: hasInitialized.current,
        hasContainer: !!containerRef.current,
        hasData: !!matrixData
      });
      return;
    }

    console.log('🚀 Initializing Canvas Engine...');

    try {
      // Create engine instance
      engineRef.current = new CanvasEngine({
        containerElement: containerRef.current,
        gridEnabled: showGrid,
        gridSize: 50,
        gridColor: gridColor,
        gridType: gridStyle === 'dotted' ? 'dots' : 'lines',
        snapToGrid: snapToGrid,
        enableDebug: debugMode,
        initialCamera: {
          x: manifestData?.current_x ?? 0,
          y: manifestData?.current_y ?? 0,
          zoom: manifestData?.zoom_level ?? 1.0,
          minZoom: 0.1,
          maxZoom: 1.0
        }
      });

      // Start render loop
      engineRef.current.start();
      hasInitialized.current = true; // Mark as initialized
      setIsEngineReady(true);

      console.log('✅ Canvas Engine initialized and ready - initial grid state:', showGrid);

      // Apply initial grid settings immediately after engine is ready
      const gridRenderer = engineRef.current.getGridRenderer?.();
      if (gridRenderer) {
        gridRenderer.setConfig({
          enabled: showGrid,
          type: gridStyle === 'dotted' ? 'dots' : 'lines'
        });
        engineRef.current.updateBackground();
        console.log('✅ Initial grid settings applied:', { showGrid, gridStyle });
      }

      // Phase 3: Nodes will be loaded from API via useCanvasPersistence hook
      // No hardcoded test nodes - canvas starts empty and loads persisted state

      // Setup FPS monitoring
      const fpsIntervalRef = setInterval(() => {
        if (engineRef.current) {
          const metrics = engineRef.current.getPerformanceMetrics();
          setFps(metrics.fps);
        }
      }, 1000);

      // Store interval ID in a way that persists
      (engineRef.current as any).__fpsInterval = fpsIntervalRef;
    } catch (error) {
      console.error('Failed to initialize Canvas Engine:', error);
    }
  }, [matrixData, manifestData, debugMode]); // Run when data loads or debugMode changes, but hasInitialized prevents re-initialization

  // Cleanup only on unmount
  useEffect(() => {
    return () => {
      // Clear FPS monitoring
      if (engineRef.current && (engineRef.current as any).__fpsInterval) {
        clearInterval((engineRef.current as any).__fpsInterval);
      }

      // Destroy engine
      if (engineRef.current) {
        engineRef.current.stop();
        engineRef.current.destroy();
        engineRef.current = null;
      }

      hasInitialized.current = false;
      setIsEngineReady(false);
      console.log('🧹 Canvas engine cleaned up on unmount');
    };
  }, []); // Empty deps - only runs on mount/unmount

  // Update all SmartMatrixNode colors and names when data changes
  useEffect(() => {
    if (engineRef.current && isEngineReady && matrixData) {
      const nodes = engineRef.current.getStateManager().getNodesArray();
      const matrixName = matrixData.smart_matrix?.name || 'Smart Matrix';

      let updated = false;
      nodes.forEach(node => {
        if (node.type === 'smart-matrix') {
          const smartNode = node as SmartMatrixNode;
          smartNode.backgroundColor = backgroundColor;
          smartNode.textColor = textColor;
          smartNode.solidColor = solidColor;
          smartNode.matrixName = matrixName;
          updated = true;
        }
      });

      if (updated) {
        // Mark all layers dirty to trigger re-render
        engineRef.current.markDirty();
        engineRef.current.updateBackground(); // Update background grid too
        console.log('🎨 Updated Smart Matrix node colors:', { backgroundColor, textColor, solidColor });
      }
    }
  }, [backgroundColor, textColor, solidColor, matrixData, isEngineReady]);

  // Update grid type when changed
  useEffect(() => {
    if (engineRef.current && isEngineReady) {
      engineRef.current.setGridType(gridType);
    }
  }, [gridType, isEngineReady]);

  // Update grid settings when smart_hub context changes
  useEffect(() => {
    console.log('🔄 SmartMatrix - Grid settings changed:');
    console.log('   showGrid:', showGrid);
    console.log('   gridStyle:', gridStyle);
    console.log('   snapToGrid:', snapToGrid);
    console.log('   isEngineReady:', isEngineReady);
    console.log('   engineRef.current exists:', !!engineRef.current);

    if (!engineRef.current || !isEngineReady) {
      console.log('⏸️ SmartMatrix - Engine not ready, skipping grid update');
      return;
    }

    // Use a small timeout to ensure the engine is fully initialized
    const timeoutId = setTimeout(() => {
      if (engineRef.current) {
        const engine = engineRef.current;
        const gridRenderer = engine.getGridRenderer?.();
        const interactionManager = engine.getInteractionManager?.();

        if (gridRenderer) {
          const newConfig = {
            enabled: showGrid,
            type: (gridStyle === 'dotted' ? 'dots' : 'lines') as 'lines' | 'dots',
            color: gridColor
          };
          console.log('✅ SmartMatrix - Updating grid config:', newConfig);
          gridRenderer.setConfig(newConfig);
          engine.updateBackground();
          engine.markDirty();
        }

        // Update snap to grid setting on interaction manager
        if (interactionManager && typeof (interactionManager as any).setSnapToGrid === 'function') {
          (interactionManager as any).setSnapToGrid(snapToGrid);
        }
      }
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [showGrid, gridStyle, snapToGrid, gridColor, isEngineReady]);

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

      // Zoom at cursor position with optimized sensitivity
      // deltaY typically ranges from -100 to 100 per wheel tick
      // Negative deltaY = scroll up = zoom in
      camera.zoomToPoint(e.deltaY, screenX, screenY, 1.0);

      // Update background (uses dirty flag now)
      engineRef.current?.updateBackground();

      // Update manifest position
      updatePosition(camera.x, camera.y, camera.zoom);
    };

    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [isEngineReady, updatePosition]);

  // Listen for camera changes from ANY source (trackpad, touch, drag, etc)
  useEffect(() => {
    if (!engineRef.current || !isEngineReady) return;

    const camera = engineRef.current.getCamera();
    let lastPosition = { x: camera.x, y: camera.y, zoom: camera.zoom };

    const checkCameraChange = () => {
      if (!engineRef.current) return;
      const camera = engineRef.current.getCamera();

      if (camera.x !== lastPosition.x || camera.y !== lastPosition.y || camera.zoom !== lastPosition.zoom) {
        updatePosition(camera.x, camera.y, camera.zoom);
        lastPosition = { x: camera.x, y: camera.y, zoom: camera.zoom };
      }
    };

    // Check for camera changes every 100ms
    const interval = setInterval(checkCameraChange, 100);

    return () => clearInterval(interval);
  }, [isEngineReady, updatePosition]);

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
      // Store mouse position on canvas for port hover detection
      const rect = canvas.getBoundingClientRect();
      canvas.dataset.mouseX = String(e.clientX - rect.left);
      canvas.dataset.mouseY = String(e.clientY - rect.top);

      if (isPanning) {
        // Throttle pan updates using requestAnimationFrame
        if (animationFrameId === null) {
          animationFrameId = requestAnimationFrame(() => {
            const deltaX = e.clientX - lastX;
            const deltaY = e.clientY - lastY;

            camera.pan(-deltaX, -deltaY);

            // Update manifest position
            updatePosition(camera.x, camera.y, camera.zoom);
            console.log('🔄 Pan: calling updatePosition with', camera.x, camera.y, camera.zoom);
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
          // Use specialized port detection for SmartMatrix and TestNode
          if ((node.type === 'smart-matrix' || node.type === 'test') && 'containsPortPoint' in node) {
            const customNode = node as any;
            if (customNode.containsPortPoint(worldX, worldY)) {
              // Find which port was clicked (output for SmartMatrix, input/output for TestNode)
              const allPorts = [...node.getOutputPorts(), ...node.getInputPorts()];
              for (const port of allPorts) {
                const portPos = node.getPortPosition(port.id);
                if (portPos) {
                  const dx = worldX - portPos.x;
                  const dy = worldY - portPos.y;
                  const distance = Math.sqrt(dx * dx + dy * dy);

                  if (distance <= 30) { // Generous threshold for circular ports
                    connectionManager.startConnection(node.id, port.id, worldX, worldY);
                    clickedPort = true;
                    break;
                  }
                }
              }
              if (clickedPort) break;
            }
          } else {
            // Standard port detection for rectangular nodes
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

      // Store mouse position on canvas for port hover detection
      canvas.dataset.mouseX = String(screenX);
      canvas.dataset.mouseY = String(screenY);

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

      // Mark dirty to trigger re-render for port hover animation
      engine.markDirty();
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
      const matrixName = matrixData?.smart_matrix?.name || 'Smart Matrix';
      const smartNode = new SmartMatrixNode(
        `smart-${nodeCount + 1}` as any,
        (nodeCount % 3) * 350,
        Math.floor(nodeCount / 3) * 300,
        backgroundColor,
        textColor,
        solidColor,
        matrixName
      );
      engineRef.current.getStateManager().addNode(smartNode);
    }
  };

  // Toggle grid type
  const toggleGridType = () => {
    setGridType(prev => prev === 'lines' ? 'dots' : 'lines');
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="smart-matrix-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        background: backgroundColor
      }}>
        <div style={{ textAlign: 'center', color: textColor }}>
          <div className="loading-spinner" style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(0,0,0,0.1)',
            borderTop: `4px solid ${solidColor}`,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p>Loading Smart Matrix...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="smart-matrix-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        background: backgroundColor
      }}>
        <div style={{ textAlign: 'center', color: textColor }}>
          <p style={{ color: '#ef4444', marginBottom: '8px' }}>Failed to load Smart Matrix</p>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ['current-smart-matrix'] })}
            style={{
              padding: '8px 16px',
              background: solidColor,
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
