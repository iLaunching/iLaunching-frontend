/**
 * Canvas Engine
 * Main orchestrator for the node-based automation builder
 * Manages 3-layer canvas rendering with optimized performance
 * 
 * Features:
 * - 3-layer canvas architecture for optimal rendering
 * - Dirty-flag rendering system to reduce CPU usage
 * - Tab visibility detection to pause when hidden
 * - Zoom-to-cursor and smooth panning
 * - Production-ready error handling and validation
 * 
 * @example
 * ```typescript
 * const engine = new CanvasEngine({
 *   containerElement: document.getElementById('canvas-container'),
 *   gridEnabled: true,
 *   gridSize: 50,
 *   enableDebug: false
 * });
 * engine.start();
 * ```
 */

import { Camera } from './core/Camera.js';
import { GridRenderer } from './renderers/GridRenderer.js';
import { NodeRenderer } from './renderers/NodeRenderer.js';
import { LinkRenderer } from './renderers/LinkRenderer.js';
import { InteractionManager } from './interaction/InteractionManager.js';
import { StateManager } from './state/StateManager.js';
import { ConnectionManager } from './connections/ConnectionManager.js';
import { validateEngineConfig } from './utils/validation.js';
import { PerformanceTracker } from './utils/performance.js';
import type { CanvasEngineConfig, CanvasEventType, CanvasEventListener, PerformanceMetrics } from './types/index.js';

export class CanvasEngine {
  // Canvas layers
  private layers: {
    background: HTMLCanvasElement;
    connections: HTMLCanvasElement;
    nodes: HTMLCanvasElement;
  };
  
  // Rendering contexts
  private contexts: {
    background: CanvasRenderingContext2D;
    connections: CanvasRenderingContext2D;
    nodes: CanvasRenderingContext2D;
  };
  
  // Core systems
  private camera: Camera;
  private gridRenderer: GridRenderer;
  private nodeRenderer: NodeRenderer;
  private linkRenderer: LinkRenderer;
  private interactionManager: InteractionManager;
  private stateManager: StateManager;
  private connectionManager: ConnectionManager;
  
  // Container element
  private container: HTMLElement;
  
  // Render loop
  private animationFrameId: number | null = null;
  private isRunning: boolean = false;
  private lastFrameTime: number = 0;
  private animationTime: number = 0;
  
  // Performance tracking
  private fps: number = 60;
  private frameCount: number = 0;
  private fpsUpdateTime: number = 0;
  private frameTimes: number[] = [];
  private performanceTracker: PerformanceTracker;
  
  // Event system
  private eventListeners: Map<CanvasEventType, CanvasEventListener[]> = new Map();
  
  // Error handling
  private errorCount: number = 0;
  private maxErrors: number = 10;
  
  // Debug mode
  private debugMode: boolean = false;
  
  // Dirty flags for optimized rendering
  private isDirty: boolean = true;
  private backgroundDirty: boolean = true;
  private isTabVisible: boolean = true;
  
  // ResizeObserver for better resize handling
  private resizeObserver: ResizeObserver | null = null;
  
  // High-DPI (Retina) support
  private devicePixelRatio: number = 1;
  private cssWidth: number = 0;
  private cssHeight: number = 0;
  
  constructor(config: CanvasEngineConfig) {
    // Validate configuration
    try {
      validateEngineConfig(config);
    } catch (error) {
      console.error('❌ Invalid canvas engine configuration:', error);
      throw error;
    }

    this.container = config.containerElement;
    this.debugMode = config.enableDebug ?? false;
    
    // Initialize performance tracker
    this.performanceTracker = new PerformanceTracker(60);
    
    try {
      // Initialize camera
      this.camera = new Camera(config.initialCamera);
      
      // Initialize grid renderer
      this.gridRenderer = new GridRenderer({
        enabled: config.gridEnabled ?? true,
        size: config.gridSize ?? 50,
        type: config.gridType ?? 'lines',
        color: config.gridColor ?? '#e5e7eb'
      });
      
      // Initialize link renderer
      this.linkRenderer = new LinkRenderer();
      
      // Initialize node renderer
      this.nodeRenderer = new NodeRenderer();
      
      // Initialize state manager
      this.stateManager = new StateManager();
      
      // Initialize connection manager
      this.connectionManager = new ConnectionManager(this.stateManager, this.camera);
      
      // Initialize interaction manager with markDirty callback and grid snapping
      this.interactionManager = new InteractionManager(
        this.camera, 
        () => this.markDirty(),
        config.gridSize ?? 50,
        config.snapToGrid ?? false
      );
      this.interactionManager.setNodes(this.stateManager.getNodes());
      
      // Wire up state manager events
      this.stateManager.on('nodeAdded', () => {
        this.interactionManager.setNodes(this.stateManager.getNodes());
        this.markDirty();
      });
      this.stateManager.on('nodeRemoved', () => {
        this.interactionManager.setNodes(this.stateManager.getNodes());
        this.markDirty();
      });
      this.stateManager.on('nodeUpdated', () => this.markDirty());
      this.stateManager.on('linkAdded', () => {
        this.markDirty();
        this.emit('link-added', { timestamp: Date.now() });
      });
      this.stateManager.on('linkRemoved', () => {
        this.markDirty();
        this.emit('link-removed', { timestamp: Date.now() });
      });
      this.stateManager.on('nodeUpdated', () => {
        // Invalidate link caches when nodes move
        this.connectionManager.invalidateAllCaches();
      });
      
      // Create canvas layers
      this.layers = this.createCanvasLayers();
      this.contexts = this.getCanvasContexts();
      
      // Set initial canvas size
      this.handleResize();
      
      // Setup event listeners
      this.setupEventListeners();
      
      console.log('🎨 Canvas Engine initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize canvas engine:', error);
      this.cleanup();
      throw error;
    }
  }
  
  /**
   * Create the 3-layer canvas system
   */
  private createCanvasLayers(): {
    background: HTMLCanvasElement;
    connections: HTMLCanvasElement;
    nodes: HTMLCanvasElement;
  } {
    // Layer 1: Background (grid)
    const background = document.createElement('canvas');
    background.style.position = 'absolute';
    background.style.top = '0';
    background.style.left = '0';
    background.style.zIndex = '1';
    background.style.pointerEvents = 'none';
    
    // Layer 2: Connections (links and animations)
    const connections = document.createElement('canvas');
    connections.style.position = 'absolute';
    connections.style.top = '0';
    connections.style.left = '0';
    connections.style.zIndex = '2';
    connections.style.pointerEvents = 'none';
    
    // Layer 3: Nodes (interactive elements)
    const nodes = document.createElement('canvas');
    nodes.style.position = 'absolute';
    nodes.style.top = '0';
    nodes.style.left = '0';
    nodes.style.zIndex = '3';
    nodes.style.cursor = 'default';
    
    // Append to container
    this.container.style.position = 'relative';
    this.container.style.overflow = 'hidden';
    this.container.appendChild(background);
    this.container.appendChild(connections);
    this.container.appendChild(nodes);
    
    return { background, connections, nodes };
  }
  
  /**
   * Get 2D contexts for all layers with Retina-optimized settings
   * @throws {Error} If context creation fails
   */
  private getCanvasContexts(): {
    background: CanvasRenderingContext2D;
    connections: CanvasRenderingContext2D;
    nodes: CanvasRenderingContext2D;
  } {
    const background = this.layers.background.getContext('2d', { 
      alpha: true,
      desynchronized: true  // Better performance for animations
    });
    const connections = this.layers.connections.getContext('2d', { 
      alpha: true,
      desynchronized: true
    });
    const nodes = this.layers.nodes.getContext('2d', { 
      alpha: true,
      desynchronized: true
    });
    
    if (!background || !connections || !nodes) {
      throw new Error('Failed to get canvas 2D contexts');
    }
    
    // Configure image smoothing for Retina displays
    // High quality smoothing for gradients and images
    [background, connections, nodes].forEach(ctx => {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    });
    
    return { background, connections, nodes };
  }
  
  /**
   * Setup event listeners for window resize and visibility
   */
  private setupEventListeners(): void {
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // Pause rendering when tab is not visible
    document.addEventListener('visibilitychange', () => {
      this.isTabVisible = !document.hidden;
      if (this.isTabVisible) {
        this.markDirty();
      }
    });
  }
  
  /**
   * Handle window resize with Retina-grade DPI support
   * Implements high-DPI canvas scaling for crisp rendering on all displays
   */
  private handleResize(): void {
    const rect = this.container.getBoundingClientRect();
    const cssWidth = rect.width;
    const cssHeight = rect.height;
    
    // Get device pixel ratio (2x for Retina, 3x for high-end phones, 1x for standard)
    const dpr = window.devicePixelRatio || 1;
    
    // Store for coordinate transformations
    this.devicePixelRatio = dpr;
    this.cssWidth = cssWidth;
    this.cssHeight = cssHeight;
    
    // Update all canvas sizes with DPR scaling
    [this.layers.background, this.layers.connections, this.layers.nodes].forEach(canvas => {
      // Set physical buffer size (actual pixels)
      canvas.width = Math.round(cssWidth * dpr);
      canvas.height = Math.round(cssHeight * dpr);
      
      // Set CSS display size (logical pixels)
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;
    });
    
    // Apply DPR scaling to all contexts so we can draw in logical pixels
    [this.contexts.background, this.contexts.connections, this.contexts.nodes].forEach(ctx => {
      ctx.scale(dpr, dpr);
    });
    
    // Update camera with CSS dimensions (camera works in logical pixels)
    this.camera.setCanvasSize(cssWidth, cssHeight);
    this.camera.setDevicePixelRatio(dpr);
    
    // Mark for re-render
    this.backgroundDirty = true;
    this.markDirty();
    
    console.log(`📐 Canvas resized to ${cssWidth}x${cssHeight} (${Math.round(cssWidth * dpr)}x${Math.round(cssHeight * dpr)} physical pixels, DPR: ${dpr})`);
  }
  
  /**
   * Start the render loop
   */
  start(): void {
    if (this.isRunning) {
      console.warn('Canvas engine already running');
      return;
    }
    
    this.isRunning = true;
    this.lastFrameTime = performance.now();
    this.fpsUpdateTime = this.lastFrameTime;
    this.animationFrameId = requestAnimationFrame(this.renderLoop.bind(this));
    
    console.log('▶️ Canvas engine started');
  }
  
  /**
   * Stop the render loop
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }
    
    this.isRunning = false;
    
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    
    console.log('⏸️ Canvas engine stopped');
  }
  
  /**optimized - only renders when needed)
   */
  private renderLoop(currentTime: number): void {
    if (!this.isRunning) {
      return;
    }
    
    // Skip rendering if tab is not visible
    if (!this.isTabVisible) {
      this.animationFrameId = requestAnimationFrame(this.renderLoop.bind(this));
      return;
    }
    
    // Calculate delta time
    const deltaTime = currentTime - this.lastFrameTime;
    this.lastFrameTime = currentTime;
      this.animationTime += deltaTime / 1000; // Convert to seconds
    if (this.frameTimes.length > 60) {
      this.frameTimes.shift();
    }
    
    // Update FPS counter every second
    this.frameCount++;
    if (currentTime - this.fpsUpdateTime >= 1000) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.fpsUpdateTime = currentTime;
    }
    
    // Only render if something changed
    if (this.isDirty || this.backgroundDirty) {
      this.render(deltaTime);
      this.isDirty = false;
      
      // Check if animations need continuous rendering
      if (this.nodeRenderer.hasActiveAnimations()) {
        this.markDirty();
      }
    }

    this.animationFrameId = requestAnimationFrame(this.renderLoop.bind(this));
  }

  /**
   * Render all layers
   */
  private render(deltaTime: number): void {
    // Render background only when camera changed
    if (this.backgroundDirty) {
      this.renderBackground();
      this.backgroundDirty = false;
    }
    
    // Clear connection and node layers
    this.contexts.connections.clearRect(
      0,
      0,
      this.layers.connections.width,
      this.layers.connections.height
    );
    
    this.contexts.nodes.clearRect(
      0,
      0,
      this.layers.nodes.width,
      this.layers.nodes.height
    );
    
    // Update node renderer animation
    this.nodeRenderer.updateAnimation(deltaTime);
    
    // Render connections (will be implemented in Phase 3)
    this.renderConnections(deltaTime);
    
    // Render nodes
    this.renderNodes();
    
    // Render box selection if active
    if (this.interactionManager.isBoxSelecting()) {
      this.renderBoxSelection();
    }
    
    // Render debug overlay
    if (this.debugMode) {
      this.renderDebugOverlay();
    }
  }
  
  /**
   * Render background grid
   */
  private renderBackground(): void {
    this.gridRenderer.render(this.contexts.background, this.camera);
  }
  
  /**
   * Render connections with animations
   */
  private renderConnections(deltaTime: number): void {
    const ctx = this.contexts.connections;
    const links = this.connectionManager.getLinks();
    const hoveredLink = this.connectionManager.getHoveredLink();
    
    // Render each link
    links.forEach(link => {
      const isHovered = hoveredLink === link;
      this.linkRenderer.render(
        ctx,
        link,
        this.camera,
        this.animationTime,
        false, // isSelected - TODO: implement link selection
        isHovered
      );
    });
    
    // Render connection preview if dragging
    if (this.connectionManager.isDragging()) {
      const start = this.connectionManager.getPreviewStart();
      const end = this.connectionManager.getPreviewEnd();
      const state = this.connectionManager.getState();
      
      if (start && end) {
        this.linkRenderer.renderPreview(
          ctx,
          start,
          end,
          this.camera,
          state.isValid
        );
      }
    }
  }
  
  /**
   * Render all nodes with viewport culling
   */
  private renderNodes(): void {
    const nodes = this.stateManager.getNodesArray();
    const linksMap = this.connectionManager.getLinks();
    const canvas = this.layers.nodes;
    
    // Build connection map ONCE per frame (O(n) instead of O(n*m))
    // Maps nodeId -> { sourceNodes: [], targetNodes: [] }
    const nodeConnectionMap = new Map<string, { sourceNodes: any[], targetNodes: any[] }>();
    for (const link of linksMap.values()) {
      // Track source connections (for output ports)
      if (!nodeConnectionMap.has(link.data.fromNodeId)) {
        nodeConnectionMap.set(link.data.fromNodeId, { sourceNodes: [], targetNodes: [] });
      }
      nodeConnectionMap.get(link.data.fromNodeId)!.targetNodes.push(link.targetNode);
      
      // Track target connections (for input ports)
      if (!nodeConnectionMap.has(link.data.toNodeId)) {
        nodeConnectionMap.set(link.data.toNodeId, { sourceNodes: [], targetNodes: [] });
      }
      nodeConnectionMap.get(link.data.toNodeId)!.sourceNodes.push(link.sourceNode);
    }
    
    // Calculate visible bounds in world space
    const [worldMinX, worldMinY] = this.camera.toWorld(0, 0);
    const [worldMaxX, worldMaxY] = this.camera.toWorld(canvas.width, canvas.height);
    
    // Add padding to catch nodes partially outside viewport
    const padding = 100;
    
    // Render only visible nodes (viewport culling)
    let renderedCount = 0;
    nodes.forEach(node => {
      // Quick bounds check
      if (
        node.x + node.width < worldMinX - padding ||
        node.x > worldMaxX + padding ||
        node.y + node.height < worldMinY - padding ||
        node.y > worldMaxY + padding
      ) {
        return; // Skip nodes outside viewport
      }
      
      this.nodeRenderer.render(this.contexts.nodes, node, this.camera, nodeConnectionMap);
      renderedCount++;
    });
  }
  
  /**
   * Render box selection rectangle
   */
  private renderBoxSelection(): void {
    const boxSelection = this.interactionManager.getBoxSelection();
    if (!boxSelection) return;
    
    const [startX, startY] = this.camera.toScreen(boxSelection.startX, boxSelection.startY);
    const [endX, endY] = this.camera.toScreen(boxSelection.endX, boxSelection.endY);
    
    const ctx = this.contexts.nodes;
    
    // Draw dashed rectangle
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(
      startX,
      startY,
      endX - startX,
      endY - startY
    );
    ctx.setLineDash([]);
    
    // Fill with semi-transparent blue
    ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
    ctx.fillRect(
      startX,
      startY,
      endX - startX,
      endY - startY
    );
  }
  
  /**
   * Render debug overlay (FPS, metrics, etc.)
   */
  private renderDebugOverlay(): void {
    const ctx = this.contexts.nodes;
    const metrics = this.getPerformanceMetrics();
    
    // Semi-transparent background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(10, 10, 200, 120);
    
    // Text
    ctx.fillStyle = '#00ff00';
    ctx.font = '12px monospace';
    ctx.fillText(`FPS: ${metrics.fps.toFixed(1)}`, 20, 30);
    ctx.fillText(`Frame: ${metrics.frameTime.toFixed(2)}ms`, 20, 50);
    ctx.fillText(`Nodes: ${metrics.nodeCount}`, 20, 70);
    ctx.fillText(`Links: ${metrics.linkCount}`, 20, 90);
    ctx.fillText(`Zoom: ${(this.camera.zoom * 100).toFixed(0)}%`, 20, 110);
  }
  
  /**
   * Get camera instance
   */
  getCamera(): Camera {
    return this.camera;
  }
  
  /**
   * Get grid renderer instance
   */
  getGridRenderer(): GridRenderer {
    return this.gridRenderer;
  }
  
  /**
   * Mark canvas as dirty (needs re-render)
   */
  markDirty(): void {
    this.isDirty = true;
  }

  /**
   * Mark background as dirty to trigger re-render (call after camera change)
   */
  updateBackground(): void {
    this.backgroundDirty = true;
  }
  
  /**
   * Get performance metrics
   */
  getPerformanceMetrics(): PerformanceMetrics {
    const avgFrameTime = this.frameTimes.length > 0
      ? this.frameTimes.reduce((a, b) => a + b, 0) / this.frameTimes.length
      : 0;
    
    const stats = this.stateManager.getStats();
    
    return {
      fps: this.fps,
      frameTime: avgFrameTime,
      nodeCount: stats.nodeCount,
      linkCount: stats.linkCount,
      renderTime: avgFrameTime,
      updateTime: 0
    };
  }
  
  /**
   * Enable/disable debug mode
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }
  
  // ============================================================================
  // NODE & STATE MANAGEMENT API
  // ============================================================================
  
  /**
   * Get state manager instance
   */
  getStateManager(): StateManager {
    return this.stateManager;
  }
  
  /**
   * Get interaction manager instance
   */
  getInteractionManager(): InteractionManager {
    return this.interactionManager;
  }
  
  /**
   * Get connection manager instance
   */
  getConnectionManager(): ConnectionManager {
    return this.connectionManager;
  }
  
  /**
   * Set grid type (lines or dots)
   */
  setGridType(type: 'lines' | 'dots'): void {
    this.gridRenderer.setConfig({ type });
    this.backgroundDirty = true;
  }
  
  /**
   * Set grid color
   */
  setGridColor(color: string): void {
    this.gridRenderer.setConfig({ color });
    this.backgroundDirty = true;
  }
  
  /**
   * Handle mouse down for interactions
   */
  handleMouseDown(e: MouseEvent): void {
    const rect = this.layers.nodes.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    
    this.interactionManager.handleMouseDown(
      screenX,
      screenY,
      e.shiftKey,
      e.altKey
    );
    
    this.markDirty();
  }
  
  /**
   * Handle mouse move for interactions
   */
  handleMouseMove(e: MouseEvent): void {
    const rect = this.layers.nodes.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    
    this.interactionManager.handleMouseMove(screenX, screenY);
    
    if (this.interactionManager.isDragging() || this.interactionManager.isBoxSelecting()) {
      this.markDirty();
    }
  }
  
  /**
   * Handle mouse up for interactions
   */
  handleMouseUp(e: MouseEvent): void {
    const rect = this.layers.nodes.getBoundingClientRect();
    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;
    
    this.interactionManager.handleMouseUp(screenX, screenY);
    
    this.markDirty();
  }
  
  /**
   * Handle keyboard input for interactions
   */
  handleKeyDown(e: KeyboardEvent): void {
    this.interactionManager.handleKeyDown(e.key);
    this.markDirty();
  }
  
  // ============================================================================
  // EVENT SYSTEM
  // ============================================================================
  
  /**
   * Event system: Subscribe to engine events
   */
  on(event: CanvasEventType, listener: CanvasEventListener): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(listener);
  }
  
  /**
   * Event system: Unsubscribe from engine events
   */
  off(event: CanvasEventType, listener: CanvasEventListener): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
  
  /**
   * Event system: Emit event
   */
  protected emit(event: CanvasEventType, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        listener({
          type: event,
          timestamp: Date.now(),
          data
        });
      });
    }
  }
  
  /**
   * Internal cleanup method
   * @private
   */
  private cleanup(): void {
    // Remove ResizeObserver if it exists
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    
    // Remove canvas elements if they were added to DOM
    if (this.container && this.layers) {
      [this.layers.background, this.layers.connections, this.layers.nodes].forEach(canvas => {
        if (canvas.parentElement) {
          canvas.remove();
        }
      });
    }
  }

  /**
   * Cleanup and destroy engine
   * Call this when unmounting the component to prevent memory leaks
   * 
   * @example
   * ```typescript
   * useEffect(() => {
   *   const engine = new CanvasEngine(config);
   *   engine.start();
   *   return () => engine.destroy();
   * }, []);
   * ```
   */
  destroy(): void {
    console.log('🗑️ Destroying canvas engine...');
    
    // Stop render loop
    this.stop();
    
    // Remove ResizeObserver
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }
    
    // Remove window event listeners (fallback)
    window.removeEventListener('resize', this.handleResize);
    
    // Remove visibility listener
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    
    // Remove canvas elements
    [this.layers.background, this.layers.connections, this.layers.nodes].forEach(canvas => {
      canvas.remove();
    });
    
    // Clear event listeners
    this.eventListeners.clear();
    
    // Clear performance tracking
    this.frameTimes = [];
    this.performanceTracker.reset();
    
    console.log('✅ Canvas engine destroyed successfully');
  }

  /**
   * Handle visibility change
   * @private
   */
  private handleVisibilityChange = (): void => {
    this.isTabVisible = !document.hidden;
    if (this.isTabVisible) {
      this.markDirty();
      
      if (this.debugMode) {
        console.log('👁️ Tab visible - resuming render');
      }
    } else {
      if (this.debugMode) {
        console.log('👁️ Tab hidden - pausing render');
      }
    }
  };
}
