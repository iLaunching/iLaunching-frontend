/**
 * State Manager
 * Centralized state management for nodes and links
 * 
 * Features:
 * - Node CRUD operations
 * - Link CRUD operations
 * - Event system for state changes
 * - Undo/redo support (future)
 * - Serialization for save/load
 * - History tracking
 * 
 * @example
 * ```typescript
 * const manager = new StateManager();
 * manager.on('nodeAdded', (node) => console.log('Added:', node.id));
 * manager.addNode(myNode);
 * ```
 */

import type { BaseNode } from '../nodes/BaseNode.js';
import type { LinkData, CanvasState, CanvasSnapshot, UUID } from '../types/index.js';

export type StateEvent = {
  type: 
    | 'nodeAdded'
    | 'nodeUpdated'
    | 'nodeRemoved'
    | 'linkAdded'
    | 'linkUpdated'
    | 'linkRemoved'
    | 'stateChanged'
    | 'cleared';
  data: any;
  timestamp: number;
};

export type StateEventListener = (event: StateEvent) => void;

export class StateManager {
  // State
  private nodes: Map<string, BaseNode> = new Map();
  private links: Map<string, LinkData> = new Map();
  
  // Event system
  private eventListeners: Map<string, StateEventListener[]> = new Map();
  
  // History (for future undo/redo)
  private history: CanvasSnapshot[] = [];
  private historyIndex: number = -1;
  private maxHistorySize: number = 50;
  
  // Change tracking
  private lastModified: number = Date.now();
  private isDirty: boolean = false;
  
  constructor() {
    // Initialize
  }
  
  // ============================================================================
  // NODE OPERATIONS
  // ============================================================================
  
  /**
   * Add a node to the canvas
   */
  addNode(node: BaseNode): void {
    if (this.nodes.has(node.id)) {
      console.warn(`Node ${node.id} already exists`);
      return;
    }
    
    this.nodes.set(node.id, node);
    this.markDirty();
    
    this.emit({
      type: 'nodeAdded',
      data: { node },
      timestamp: Date.now()
    });
  }
  
  /**
   * Update a node
   */
  updateNode(nodeId: UUID, updates: Partial<BaseNode>): void {
    const node = this.nodes.get(nodeId);
    if (!node) {
      console.warn(`Node ${nodeId} not found`);
      return;
    }
    
    // Apply updates
    Object.assign(node, updates);
    node.updatedAt = Date.now();
    this.markDirty();
    
    this.emit({
      type: 'nodeUpdated',
      data: { node, updates },
      timestamp: Date.now()
    });
  }
  
  /**
   * Remove a node and all its connections
   */
  removeNode(nodeId: UUID): void {
    const node = this.nodes.get(nodeId);
    if (!node) {
      console.warn(`Node ${nodeId} not found`);
      return;
    }
    
    // Remove all links connected to this node
    const linksToRemove: string[] = [];
    this.links.forEach((link, linkId) => {
      if (link.fromNodeId === nodeId || link.toNodeId === nodeId) {
        linksToRemove.push(linkId);
      }
    });
    
    linksToRemove.forEach(linkId => {
      this.removeLink(linkId);
    });
    
    // Remove node
    this.nodes.delete(nodeId);
    this.markDirty();
    
    this.emit({
      type: 'nodeRemoved',
      data: { node },
      timestamp: Date.now()
    });
  }
  
  /**
   * Get a node by ID
   */
  getNode(nodeId: UUID): BaseNode | undefined {
    return this.nodes.get(nodeId);
  }
  
  /**
   * Get all nodes
   */
  getNodes(): Map<string, BaseNode> {
    return this.nodes;
  }
  
  /**
   * Get all nodes as array (cached for performance)
   */
  private nodesArrayCache: BaseNode[] | null = null;
  
  getNodesArray(): BaseNode[] {
    // Return cached array if valid
    if (this.nodesArrayCache && !this.isDirty) {
      return this.nodesArrayCache;
    }
    // Rebuild cache
    this.nodesArrayCache = Array.from(this.nodes.values());
    return this.nodesArrayCache;
  }
  
  /**
   * Batch update multiple nodes (reduces events)
   */
  batchUpdateNodes(updates: Array<{ nodeId: string; updates: Partial<BaseNode> }>): void {
    updates.forEach(({ nodeId, updates }) => {
      const node = this.nodes.get(nodeId);
      if (node) {
        Object.assign(node, updates);
      }
    });
    
    this.nodesArrayCache = null; // Invalidate cache
    this.markDirty();
    
    this.emit({
      type: 'nodeUpdated',
      data: { count: updates.length },
      timestamp: Date.now()
    });
  }
  
  /**
   * Find nodes by type
   */
  findNodesByType(type: string): BaseNode[] {
    return this.getNodesArray().filter(node => node.type === type);
  }
  
  // ============================================================================
  // LINK OPERATIONS
  // ============================================================================
  
  /**
   * Add a link between two nodes
   */
  addLink(link: LinkData): void {
    if (this.links.has(link.id)) {
      console.warn(`Link ${link.id} already exists`);
      return;
    }
    
    // Validate link
    if (!this.validateLink(link)) {
      return;
    }
    
    this.links.set(link.id, link);
    
    // Update port connection status
const sourceNode = this.nodes.get(link.fromNodeId);
    const targetNode = this.nodes.get(link.toNodeId);

    if (sourceNode) {
      sourceNode.setPortConnected(link.fromPortId, true);
    }
    if (targetNode) {
      targetNode.setPortConnected(link.toPortId, true);
    }
    
    this.markDirty();
    
    this.emit({
      type: 'linkAdded',
      data: { link },
      timestamp: Date.now()
    });
  }
  
  /**
   * Remove a link
   */
  removeLink(linkId: UUID): void {
    const link = this.links.get(linkId);
    if (!link) {
      console.warn(`Link ${linkId} not found`);
      return;
    }
    
    // Update port connection status
    const sourceNode = this.nodes.get(link.fromNodeId);
    const targetNode = this.nodes.get(link.toNodeId);
    
    // Check if this is the only connection to these ports
    const otherLinks = Array.from(this.links.values()).filter(l => l.id !== linkId);
    
    const sourcePortHasOtherLinks = otherLinks.some(
      l => l.fromNodeId === link.fromNodeId && l.fromPortId === link.fromPortId
    );
    const targetPortHasOtherLinks = otherLinks.some(
      l => l.toNodeId === link.toNodeId && l.toPortId === link.toPortId
    );
    
    if (sourceNode && !sourcePortHasOtherLinks) {
      sourceNode.setPortConnected(link.fromPortId, false);
    }
    if (targetNode && !targetPortHasOtherLinks) {
      targetNode.setPortConnected(link.toPortId, false);
    }
    
    this.links.delete(linkId);
    this.markDirty();
    
    this.emit({
      type: 'linkRemoved',
      data: { link },
      timestamp: Date.now()
    });
  }
  
  /**
   * Get a link by ID
   */
  getLink(linkId: UUID): LinkData | undefined {
    return this.links.get(linkId);
  }
  
  /**
   * Get all links
   */
  getLinks(): Map<string, LinkData> {
    return this.links;
  }
  
  /**
   * Get all links as array
   */
  getLinksArray(): LinkData[] {
    return Array.from(this.links.values());
  }
  
  /**
   * Get links connected to a node
   */
  getNodeLinks(nodeId: UUID): LinkData[] {
    return this.getLinksArray().filter(
      link => link.fromNodeId === nodeId || link.toNodeId === nodeId
    );
  }
  
  /**
   * Get output links from a node
   */
  getNodeOutputLinks(nodeId: UUID): LinkData[] {
    return this.getLinksArray().filter(link => link.fromNodeId === nodeId);
  }
  
  /**
   * Get input links to a node
   */
  getNodeInputLinks(nodeId: UUID): LinkData[] {
    return this.getLinksArray().filter(link => link.toNodeId === nodeId);
  }
  
  /**
   * Validate a link before adding
   */
  private validateLink(link: LinkData): boolean {
    // Check nodes exist
    const sourceNode = this.nodes.get(link.fromNodeId);
    const targetNode = this.nodes.get(link.toNodeId);
    
    if (!sourceNode || !targetNode) {
      console.warn('Source or target node not found');
      return false;
    }
    
    // Check ports exist
    const sourcePort = sourceNode.getPort(link.fromPortId);
    const targetPort = targetNode.getPort(link.toPortId);
    
    if (!sourcePort || !targetPort) {
      console.warn('Source or target port not found');
      return false;
    }
    
    // Check port types
    if (sourcePort.type !== 'output') {
      console.warn('Source port must be an output port');
      return false;
    }
    
    if (targetPort.type !== 'input') {
      console.warn('Target port must be an input port');
      return false;
    }
    
    // Check data type compatibility (basic check)
    if (sourcePort.dataType !== targetPort.dataType && 
        sourcePort.dataType !== 'any' && 
        targetPort.dataType !== 'any') {
      console.warn(`Data type mismatch: ${sourcePort.dataType} -> ${targetPort.dataType}`);
      return false;
    }
    
    // Check for cycles (prevent infinite loops)
    if (this.wouldCreateCycle(link)) {
      console.warn('Link would create a cycle');
      return false;
    }
    
    return true;
  }
  
  /**
   * Check if adding a link would create a cycle
   */
  public wouldCreateCycle(newLink: LinkData): boolean {
    // Use DFS to detect cycles
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const hasCycle = (nodeId: string): boolean => {
      visited.add(nodeId);
      recursionStack.add(nodeId);
      
      // Get all output links (including the potential new link)
      const outputLinks = this.getNodeOutputLinks(nodeId);
      if (nodeId === newLink.fromNodeId) {
        outputLinks.push(newLink);
      }
      
      for (const link of outputLinks) {
        const targetId = link.toNodeId;
        
        if (!visited.has(targetId)) {
          if (hasCycle(targetId)) {
            return true;
          }
        } else if (recursionStack.has(targetId)) {
          return true;
        }
      }
      
      recursionStack.delete(nodeId);
      return false;
    };
    
    return hasCycle(newLink.fromNodeId);
  }
  
  // ============================================================================
  // STATE OPERATIONS
  // ============================================================================
  
  /**
   * Clear all nodes and links
   */
  clear(): void {
    this.nodes.clear();
    this.links.clear();
    this.markDirty();
    
    this.emit({
      type: 'cleared',
      data: {},
      timestamp: Date.now()
    });
  }
  
  /**
   * Get current state
   */
  getState(): Omit<CanvasState, 'selection' | 'interaction' | 'history'> {
    return {
      nodes: new Map(this.getNodesArray().map(node => [node.id, node.toJSON()])),
      links: this.links,
      camera: { x: 0, y: 0, zoom: 1.0, minZoom: 0.1, maxZoom: 5.0 } // TODO: Get from camera
    };
  }
  
  /**
   * Load state
   */
  loadState(state: CanvasState): void {
    this.clear();
    
    // Load nodes (needs factory to create proper node types)
    // TODO: Implement node factory
    
    // Load links
    state.links.forEach(link => {
      this.links.set(link.id, link);
    });
    
    this.markDirty();
    
    this.emit({
      type: 'stateChanged',
      data: { state },
      timestamp: Date.now()
    });
  }
  
  /**
   * Create snapshot for undo/redo
   */
  createSnapshot(): CanvasSnapshot {
    return {
      timestamp: Date.now(),
      nodes: this.getNodesArray().map(node => node.toJSON()),
      links: this.getLinksArray(),
      camera: { x: 0, y: 0, zoom: 1.0, minZoom: 0.1, maxZoom: 5.0 }
    };
  }
  
  /**
   * Mark state as dirty (modified)
   */
  private markDirty(): void {
    this.isDirty = true;
    this.lastModified = Date.now();
    this.nodesArrayCache = null; // Invalidate array cache
  }
  
  /**
   * Check if state has been modified
   */
  isDirtyState(): boolean {
    return this.isDirty;
  }
  
  /**
   * Mark state as clean (saved)
   */
  markClean(): void {
    this.isDirty = false;
  }
  
  // ============================================================================
  // EVENT SYSTEM
  // ============================================================================
  
  /**
   * Subscribe to state events
   */
  on(eventType: string, listener: StateEventListener): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType)!.push(listener);
  }
  
  /**
   * Unsubscribe from state events
   */
  off(eventType: string, listener: StateEventListener): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }
  
  /**
   * Emit state event
   */
  private emit(event: StateEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(listener => listener(event));
    }
    
    // Also emit general 'stateChanged' event
    if (event.type !== 'stateChanged') {
      const stateChangedListeners = this.eventListeners.get('stateChanged');
      if (stateChangedListeners) {
        stateChangedListeners.forEach(listener => 
          listener({
            type: 'stateChanged',
            data: event,
            timestamp: event.timestamp
          })
        );
      }
    }
  }
  
  // ============================================================================
  // UTILITY
  // ============================================================================
  
  /**
   * Generate unique ID
   */
  private generateId(): UUID {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}` as UUID;
  }
  
  /**
   * Get statistics
   */
  getStats(): {
    nodeCount: number;
    linkCount: number;
    lastModified: number;
    isDirty: boolean;
  } {
    return {
      nodeCount: this.nodes.size,
      linkCount: this.links.size,
      lastModified: this.lastModified,
      isDirty: this.isDirty
    };
  }
}
