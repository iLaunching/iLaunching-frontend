/**
 * Interaction Manager
 * Handles all mouse/touch interactions with nodes
 * 
 * Features:
 * - Node selection (single and multi-select)
 * - Drag-and-drop for moving nodes
 * - Box selection (drag to select multiple)
 * - Hover detection
 * - Double-click handling
 * - Context menu support
 * 
 * @example
 * ```typescript
 * const manager = new InteractionManager(camera, stateManager);
 * manager.on('nodeSelected', (node) => console.log('Selected:', node.id));
 * manager.handleMouseDown(e);
 * ```
 */

import type { Camera } from '../core/Camera.js';
import type { BaseNode } from '../nodes/BaseNode.js';

export type InteractionMode =
  | 'idle'
  | 'dragging-node'
  | 'box-selecting'
  | 'dragging-port'
  | 'panning';

export interface InteractionState {
  mode: InteractionMode;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  draggedNodes: BaseNode[];
  dragOffsets: Map<string, { x: number; y: number }>;
  hoveredNode: BaseNode | null;
  boxSelection: {
    startX: number;
    startY: number;
    endX: number;
    endY: number;
  } | null;
}

export type InteractionEvent = {
  type: 'nodeSelected' | 'nodeDeselected' | 'nodesMoved' | 'nodesDeleted' | 'boxSelected';
  data: any;
};

export type InteractionEventListener = (event: InteractionEvent) => void;

export class InteractionManager {
  private camera: Camera;
  private nodes: Map<string, BaseNode> = new Map();
  
  private state: InteractionState = {
    mode: 'idle',
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    draggedNodes: [],
    dragOffsets: new Map(),
    hoveredNode: null,
    boxSelection: null
  };
  
  // Selected nodes
  private selectedNodes: Set<string> = new Set();
  
  // Event system
  private eventListeners: Map<string, InteractionEventListener[]> = new Map();
  
  // Configuration
  private config = {
    multiSelectKey: 'Shift', // Hold shift for multi-select
    boxSelectKey: 'Alt', // Hold alt to start box select
    dragThreshold: 5, // Pixels before drag starts
    doubleClickTime: 300, // ms
    hoverThrottleMs: 16 // ~60fps throttle for hover detection
  };
  
  // Throttling for hover detection
  private lastHoverCheck: number = 0;
  
  // Double-click detection
  private lastClickTime: number = 0;
  private lastClickNode: string | null = null;
  
  // Callback for marking canvas dirty
  private markDirtyCallback?: () => void;
  
  // Grid snapping configuration
  private gridSize: number = 50;
  private snapToGrid: boolean = false;
  
  constructor(camera: Camera, markDirtyCallback?: () => void, gridSize?: number, snapToGrid?: boolean) {
    this.camera = camera;
    this.markDirtyCallback = markDirtyCallback;
    if (gridSize !== undefined) this.gridSize = gridSize;
    if (snapToGrid !== undefined) this.snapToGrid = snapToGrid;
  }
  
  /**
   * Set the nodes to manage
   */
  setNodes(nodes: Map<string, BaseNode>): void {
    this.nodes = nodes;
  }
  
  /**
   * Handle mouse down event
   */
  handleMouseDown(
    screenX: number,
    screenY: number,
    isShiftKey: boolean,
    isAltKey: boolean
  ): void {
    const [worldX, worldY] = this.camera.toWorld(screenX, screenY);
    
    this.state.startX = worldX;
    this.state.startY = worldY;
    this.state.currentX = worldX;
    this.state.currentY = worldY;
    
    // Check for node hit
    const hitNode = this.getNodeAtPoint(worldX, worldY);
    
    if (hitNode) {
      // Check for double-click
      const now = Date.now();
      const isDoubleClick =
        now - this.lastClickTime < this.config.doubleClickTime &&
        this.lastClickNode === hitNode.id;
      
      this.lastClickTime = now;
      this.lastClickNode = hitNode.id;
      
      if (isDoubleClick) {
        this.handleDoubleClick(hitNode);
        return;
      }
      
      // Handle selection
      if (isShiftKey) {
        // Multi-select: toggle node selection
        this.toggleNodeSelection(hitNode);
      } else {
        // Single select: select only this node
        if (!this.selectedNodes.has(hitNode.id)) {
          this.clearSelection();
          this.selectNode(hitNode);
        }
      }
      
      // Start dragging
      this.startDragging();
    } else {
      // Clicked on empty space
      if (isAltKey) {
        // Start box selection
        this.startBoxSelection(worldX, worldY);
      } else {
        // Clear selection
        this.clearSelection();
      }
    }
  }
  
  /**
   * Handle mouse move event with throttled hover detection\n   */
  handleMouseMove(screenX: number, screenY: number): void {
    const [worldX, worldY] = this.camera.toWorld(screenX, screenY);
    const now = performance.now();
    
    this.state.currentX = worldX;
    this.state.currentY = worldY;
    
    switch (this.state.mode) {
      case 'dragging-node':
        this.updateDragging(worldX, worldY);
        break;
        
      case 'box-selecting':
        this.updateBoxSelection(worldX, worldY);
        break;
        
      case 'idle':
        // Throttle hover detection for performance (~60fps)
        if (now - this.lastHoverCheck > this.config.hoverThrottleMs) {
          this.updateHover(worldX, worldY);
          this.lastHoverCheck = now;
        }
        break;
    }
  }
  
  /**
   * Handle mouse up event
   */
  handleMouseUp(screenX: number, screenY: number): void {
    const [worldX, worldY] = this.camera.toWorld(screenX, screenY);
    
    switch (this.state.mode) {
      case 'dragging-node':
        this.endDragging();
        break;
        
      case 'box-selecting':
        this.endBoxSelection();
        break;
    }
    
    this.state.mode = 'idle';
  }
  
  /**
   * Handle keyboard events
   */
  handleKeyDown(key: string): void {
    switch (key) {
      case 'Delete':
      case 'Backspace':
        this.deleteSelectedNodes();
        break;
        
      case 'Escape':
        this.clearSelection();
        break;
        
      case 'a':
      case 'A':
        // Ctrl+A or Cmd+A handled externally
        break;
    }
  }
  
  /**
   * Select all nodes
   */
  selectAll(): void {
    this.clearSelection();
    this.nodes.forEach(node => {
      this.selectNode(node);
    });
  }
  
  // ============================================================================
  // PRIVATE METHODS
  // ============================================================================
  
  /**
   * Get node at world coordinates
   */
  private getNodeAtPoint(worldX: number, worldY: number): BaseNode | null {
    // Check in reverse order (top to bottom)
    const nodeArray = Array.from(this.nodes.values()).reverse();
    
    for (const node of nodeArray) {
      if (node.containsPoint(worldX, worldY)) {
        return node;
      }
    }
    
    return null;
  }
  
  /**
   * Select a node
   */
  private selectNode(node: BaseNode): void {
    node.isSelected = true;
    this.selectedNodes.add(node.id);
    this.emit({ type: 'nodeSelected', data: node });
  }
  
  /**
   * Deselect a node
   */
  private deselectNode(node: BaseNode): void {
    node.isSelected = false;
    this.selectedNodes.delete(node.id);
    this.emit({ type: 'nodeDeselected', data: node });
  }
  
  /**
   * Toggle node selection
   */
  private toggleNodeSelection(node: BaseNode): void {
    if (this.selectedNodes.has(node.id)) {
      this.deselectNode(node);
    } else {
      this.selectNode(node);
    }
  }
  
  /**
   * Clear all selections
   */
  private clearSelection(): void {
    this.selectedNodes.forEach(nodeId => {
      const node = this.nodes.get(nodeId);
      if (node) {
        node.isSelected = false;
        this.emit({ type: 'nodeDeselected', data: node });
      }
    });
    this.selectedNodes.clear();
  }
  
  /**
   * Start dragging selected nodes
   */
  private startDragging(): void {
    this.state.mode = 'dragging-node';
    this.state.draggedNodes = [];
    this.state.dragOffsets.clear();
    
    // Get all selected nodes
    this.selectedNodes.forEach(nodeId => {
      const node = this.nodes.get(nodeId);
      if (node) {
        this.state.draggedNodes.push(node);
        
        // Store offset from cursor to node position
        this.state.dragOffsets.set(node.id, {
          x: node.x - this.state.startX,
          y: node.y - this.state.startY
        });
      }
    });
  }
  
  /**
   * Snap a coordinate to the grid
   */
  private snapToGridCoordinate(value: number): number {
    if (!this.snapToGrid) return value;
    return Math.round(value / this.gridSize) * this.gridSize;
  }
  
  /**
   * Update dragging positions
   */
  private updateDragging(worldX: number, worldY: number): void {
    this.state.draggedNodes.forEach(node => {
      const offset = this.state.dragOffsets.get(node.id);
      if (offset) {
        let newX = worldX + offset.x;
        let newY = worldY + offset.y;
        
        // Apply grid snapping if enabled
        if (this.snapToGrid) {
          newX = this.snapToGridCoordinate(newX);
          newY = this.snapToGridCoordinate(newY);
        }
        
        node.setPosition(newX, newY);
      }
    });
  }
  
  /**
   * End dragging
   */
  private endDragging(): void {
    if (this.state.draggedNodes.length > 0) {
      this.emit({
        type: 'nodesMoved',
        data: {
          nodes: this.state.draggedNodes,
          startX: this.state.startX,
          startY: this.state.startY,
          endX: this.state.currentX,
          endY: this.state.currentY
        }
      });
    }
    
    this.state.draggedNodes = [];
    this.state.dragOffsets.clear();
  }
  
  /**
   * Start box selection
   */
  private startBoxSelection(worldX: number, worldY: number): void {
    this.state.mode = 'box-selecting';
    this.state.boxSelection = {
      startX: worldX,
      startY: worldY,
      endX: worldX,
      endY: worldY
    };
  }
  
  /**
   * Update box selection
   */
  private updateBoxSelection(worldX: number, worldY: number): void {
    if (this.state.boxSelection) {
      this.state.boxSelection.endX = worldX;
      this.state.boxSelection.endY = worldY;
    }
  }
  
  /**
   * End box selection and select nodes in box
   */
  private endBoxSelection(): void {
    if (!this.state.boxSelection) return;
    
    const { startX, startY, endX, endY } = this.state.boxSelection;
    
    // Calculate box bounds
    const minX = Math.min(startX, endX);
    const maxX = Math.max(startX, endX);
    const minY = Math.min(startY, endY);
    const maxY = Math.max(startY, endY);
    
    // Select nodes inside box
    const selectedNodes: BaseNode[] = [];
    this.nodes.forEach(node => {
      const nodeCenter = node.getCenter();
      if (
        nodeCenter.x >= minX &&
        nodeCenter.x <= maxX &&
        nodeCenter.y >= minY &&
        nodeCenter.y <= maxY
      ) {
        this.selectNode(node);
        selectedNodes.push(node);
      }
    });
    
    this.emit({
      type: 'boxSelected',
      data: {
        nodes: selectedNodes,
        bounds: { minX, maxX, minY, maxY }
      }
    });
    
    this.state.boxSelection = null;
  }
  
  /**
   * Update hover state
   */
  private updateHover(worldX: number, worldY: number): void {
    const hitNode = this.getNodeAtPoint(worldX, worldY);
    
    // Clear previous hover
    if (this.state.hoveredNode && this.state.hoveredNode !== hitNode) {
      this.state.hoveredNode.isHovered = false;
      // Clear port hover if it's a SmartMatrixNode
      if ('isPortHovered' in this.state.hoveredNode) {
        (this.state.hoveredNode as any).isPortHovered = false;
      }
    }
    
    // Set new hover
    if (hitNode) {
      hitNode.isHovered = true;
      this.state.hoveredNode = hitNode;
    } else {
      this.state.hoveredNode = null;
    }
    
    // Check port hover for all SmartMatrixNodes
    this.nodes.forEach(node => {
      if (node.type === 'smart-matrix' && 'containsPortPoint' in node) {
        const smartNode = node as any;
        const wasHovered = smartNode.isPortHovered;
        smartNode.isPortHovered = smartNode.containsPortPoint(worldX, worldY);
        // Mark dirty if hover state changed
        if (wasHovered !== smartNode.isPortHovered && this.markDirtyCallback) {
          this.markDirtyCallback();
        }
      }
    });
    
    // Mark canvas as dirty to trigger re-render
    if (this.markDirtyCallback) {
      this.markDirtyCallback();
    }
  }
  
  /**
   * Handle double-click on node
   */
  private handleDoubleClick(node: BaseNode): void {
    // Override in subclass or emit event
    console.log('Double-clicked node:', node.id);
    // Could open node configuration dialog, etc.
  }
  
  /**
   * Delete selected nodes
   */
  private deleteSelectedNodes(): void {
    const nodesToDelete: BaseNode[] = [];
    
    this.selectedNodes.forEach(nodeId => {
      const node = this.nodes.get(nodeId);
      if (node) {
        nodesToDelete.push(node);
        this.nodes.delete(nodeId);
      }
    });
    
    this.selectedNodes.clear();
    
    if (nodesToDelete.length > 0) {
      this.emit({
        type: 'nodesDeleted',
        data: { nodes: nodesToDelete }
      });
    }
  }
  
  // ============================================================================
  // EVENT SYSTEM
  // ============================================================================
  
  /**
   * Subscribe to interaction events
   */
  on(eventType: string, listener: InteractionEventListener): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(listener);
  }
  
  /**
   * Unsubscribe from interaction events
   */
  off(eventType: string, listener: InteractionEventListener): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
  
  /**
   * Emit interaction event
   */
  private emit(event: InteractionEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(listener => listener(event));
    }
  }
  
  // ============================================================================
  // PUBLIC API
  // ============================================================================
  
  /**
   * Get current interaction state
   */
  getState(): InteractionState {
    return { ...this.state };
  }
  
  /**
   * Get box selection bounds (for rendering)
   */
  getBoxSelection(): { startX: number; startY: number; endX: number; endY: number } | null {
    return this.state.boxSelection;
  }
  
  /**
   * Get selected node IDs
   */
  getSelectedNodes(): Set<string> {
    return new Set(this.selectedNodes);
  }
  
  /**
   * Check if currently dragging
   */
  isDragging(): boolean {
    return this.state.mode === 'dragging-node';
  }
  
  /**
   * Check if currently box selecting
   */
  isBoxSelecting(): boolean {
    return this.state.mode === 'box-selecting';
  }
}
