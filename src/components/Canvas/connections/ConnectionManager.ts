/**
 * Connection Manager
 * Handles interactive connection creation between node ports
 * 
 * Features:
 * - Drag from output port to input port
 * - Real-time connection preview
 * - Connection validation (types, cycles, rules)
 * - Visual feedback (valid/invalid states)
 * - Click to delete connections
 * 
 * @example
 * ```typescript
 * const manager = new ConnectionManager(stateManager, camera);
 * manager.startConnection(nodeId, portId);
 * manager.updateConnectionPreview(mouseX, mouseY);
 * manager.completeConnection(targetNodeId, targetPortId);
 * ```
 */

import type { Camera } from '../core/Camera.js';
import type { StateManager } from '../state/StateManager.js';
import type { BaseNode } from '../nodes/BaseNode.js';
import type { LinkData, Point, UUID } from '../types/index.js';
import { Link } from './Link.js';

/**
 * Connection interaction configuration
 */
const CONNECTION_CONFIG = {
  HIT_THRESHOLD: 12,
  SNAP_THRESHOLD: 30,
  PORT_CLICK_RADIUS: 15,
  DEFAULT_PULSE_SPEED: 200,
  DEFAULT_LINK_COLOR: '#3b82f6'
} as const;

export type ConnectionMode =
  | 'idle'
  | 'dragging-from-output'
  | 'dragging-from-input';

export interface ConnectionState {
  mode: ConnectionMode;
  sourceNodeId: string | null;
  sourcePortId: string | null;
  currentX: number;
  currentY: number;
  isValid: boolean;
  errorMessage: string | null;
  hoveredLink: Link | null;
  hoveredNodeId: string | null; // Track which node is being hovered during drag
}

export class ConnectionManager {
  private stateManager: StateManager;
  private camera: Camera;
  
  private state: ConnectionState = {
    mode: 'idle',
    sourceNodeId: null,
    sourcePortId: null,
    currentX: 0,
    currentY: 0,
    isValid: false,
    errorMessage: null,
    hoveredLink: null,
    hoveredNodeId: null
  };
  
  // Link instances (for hit detection and rendering)
  private links: Map<string, Link> = new Map();
  
  // Configuration
  private config = {
    connectionHitThreshold: CONNECTION_CONFIG.HIT_THRESHOLD,
    snapToPortThreshold: CONNECTION_CONFIG.SNAP_THRESHOLD,
    portClickRadius: CONNECTION_CONFIG.PORT_CLICK_RADIUS
  } as const;
  
  constructor(stateManager: StateManager, camera: Camera) {
    this.stateManager = stateManager;
    this.camera = camera;
    
    // Build initial links
    this.rebuildLinks();
    
    // Listen for state changes
    this.stateManager.on('linkAdded', () => this.rebuildLinks());
    this.stateManager.on('linkRemoved', () => this.rebuildLinks());
    this.stateManager.on('nodeRemoved', () => this.rebuildLinks());
  }
  
  /**
   * Rebuild Link instances from state
   */
  private rebuildLinks(): void {
    try {
      this.links.clear();
      
      const linkDataArray = this.stateManager.getLinksArray();
      const nodes = this.stateManager.getNodes();
      
      linkDataArray.forEach(linkData => {
        const sourceNode = nodes.get(linkData.fromNodeId);
        const targetNode = nodes.get(linkData.toNodeId);
        
        if (sourceNode && targetNode) {
          const link = new Link(linkData, sourceNode, targetNode);
          this.links.set(linkData.id, link);
        } else {
          console.warn(`Cannot create link ${linkData.id}: missing nodes`);
        }
      });
    } catch (error) {
      console.error('Error rebuilding links:', error);
    }
  }
  
  /**
   * Start dragging a connection from a port
   */
  startConnection(nodeId: string, portId: string, worldX: number, worldY: number): void {
    const node = this.stateManager.getNode(nodeId);
    if (!node) return;
    
    const port = node.getPort(portId);
    if (!port) return;
    
    // Check if output port already has a connection
    if (port.type === 'output') {
      const existingLinks = this.stateManager.getLinksArray();
      const hasConnection = existingLinks.some(link => 
        link.fromNodeId === nodeId && link.fromPortId === portId
      );
      
      if (hasConnection) {
        // Output port already connected, don't allow dragging
        return;
      }
      
      this.state.mode = 'dragging-from-output';
    } else {
      this.state.mode = 'dragging-from-input';
    }
    
    this.state.sourceNodeId = nodeId;
    this.state.sourcePortId = portId;
    this.state.currentX = worldX;
    this.state.currentY = worldY;
    this.state.isValid = false;
    this.state.errorMessage = null;
  }
  
  /**
   * Update connection preview as mouse moves
   */
  updateConnectionPreview(worldX: number, worldY: number): void {
    if (this.state.mode === 'idle') return;
    
    this.state.currentX = worldX;
    this.state.currentY = worldY;
    
    // Find node under cursor (not just port)
    const hoveredNode = this.findNodeAtPoint(worldX, worldY);
    this.state.hoveredNodeId = hoveredNode ? hoveredNode.id : null;
    
    // Check if hovering over a valid target port (exact hit)
    let targetPort = this.findPortAtPoint(worldX, worldY);
    
    // If no exact port hit but hovering over a node, check if that node has a compatible port
    if (!targetPort && hoveredNode) {
      const needInputPort = this.state.mode === 'dragging-from-output';
      const ports = needInputPort ? hoveredNode.getInputPorts() : hoveredNode.getOutputPorts();
      
      if (ports.length > 0) {
        // Use first available port for validation
        targetPort = { nodeId: hoveredNode.id, portId: ports[0].id };
      }
    }
    
    if (targetPort) {
      // Validate connection
      const validation = this.validateConnection(
        this.state.sourceNodeId!,
        this.state.sourcePortId!,
        targetPort.nodeId,
        targetPort.portId
      );
      
      this.state.isValid = validation.valid;
      this.state.errorMessage = validation.error || null;
    } else {
      this.state.isValid = false;
      this.state.errorMessage = null;
    }
  }
  
  /**
   * Complete connection attempt
   */
  completeConnection(worldX: number, worldY: number): boolean {
    if (this.state.mode === 'idle') return false;
    
    try {
      // Try exact port hit first
      let targetPort = this.findPortAtPoint(worldX, worldY);
      
      // If no exact port hit, check if hovering over a node and auto-position the port
      if (!targetPort) {
        const hoveredNode = this.findNodeAtPoint(worldX, worldY);
        if (hoveredNode) {
          // Find the appropriate port type we need
          const needInputPort = this.state.mode === 'dragging-from-output';
          const ports = needInputPort ? hoveredNode.getInputPorts() : hoveredNode.getOutputPorts();
          
          if (ports.length > 0) {
            // Use the first available port (node will auto-position it)
            targetPort = { nodeId: hoveredNode.id, portId: ports[0].id };
          }
        }
      }
      
      if (!targetPort) {
        this.cancelConnection();
        return false;
      }
    
    // Validate connection
    const validation = this.validateConnection(
      this.state.sourceNodeId!,
      this.state.sourcePortId!,
      targetPort.nodeId,
      targetPort.portId
    );
    
    if (!validation.valid) {
      console.warn('Invalid connection:', validation.error);
      this.cancelConnection();
      return false;
    }
    
    // Create link based on drag direction
    let fromNodeId: string, fromPortId: string, toNodeId: string, toPortId: string;
    
    if (this.state.mode === 'dragging-from-output') {
      fromNodeId = this.state.sourceNodeId!;
      fromPortId = this.state.sourcePortId!;
      toNodeId = targetPort.nodeId;
      toPortId = targetPort.portId;
    } else {
      fromNodeId = targetPort.nodeId;
      fromPortId = targetPort.portId;
      toNodeId = this.state.sourceNodeId!;
      toPortId = this.state.sourcePortId!;
    }
    
    // Create link data
    const linkData: LinkData = {
      id: this.generateLinkId(),
      fromNodeId,
      fromPortId,
      toNodeId,
      toPortId,
      animated: true,
      color: CONNECTION_CONFIG.DEFAULT_LINK_COLOR,
      pulseSpeed: CONNECTION_CONFIG.DEFAULT_PULSE_SPEED,
      status: 'idle'
    };
    
    // Add to state
    this.stateManager.addLink(linkData);
    
    this.cancelConnection();
    return true;
    } catch (error) {
      console.error('Error completing connection:', error);
      this.cancelConnection();
      return false;
    }
  }
  
  /**
   * Cancel connection creation
   */
  cancelConnection(): void {
    this.state.mode = 'idle';
    this.state.sourceNodeId = null;
    this.state.sourcePortId = null;
    this.state.currentX = 0;
    this.state.currentY = 0;
    this.state.isValid = false;
    this.state.errorMessage = null;
    this.state.hoveredNodeId = null;
  }
  
  /**
   * Check for link hover at point (for deletion)
   */
  checkLinkHover(worldX: number, worldY: number): void {
    // Only check hover when idle
    if (this.state.mode !== 'idle') {
      this.state.hoveredLink = null;
      return;
    }
    
    // Check each link
    for (const link of this.links.values()) {
      if (link.containsPoint(worldX, worldY, this.config.connectionHitThreshold)) {
        this.state.hoveredLink = link;
        return;
      }
    }
    
    this.state.hoveredLink = null;
  }
  
  /**
   * Delete link at point (on click)
   */
  deleteLinkAtPoint(worldX: number, worldY: number): boolean {
    for (const link of this.links.values()) {
      if (link.containsPoint(worldX, worldY, this.config.connectionHitThreshold)) {
        this.stateManager.removeLink(link.data.id);
        this.state.hoveredLink = null;
        return true;
      }
    }
    return false;
  }
  
  /**
   * Find node at world coordinates
   */
  private findNodeAtPoint(worldX: number, worldY: number): BaseNode | null {
    const nodes = this.stateManager.getNodesArray();
    
    for (const node of nodes) {
      if (node.containsPoint(worldX, worldY)) {
        return node;
      }
    }
    
    return null;
  }
  
  /**
   * Find port at world coordinates
   */
  private findPortAtPoint(worldX: number, worldY: number): { nodeId: string; portId: string } | null {
    const nodes = this.stateManager.getNodesArray();
    
    for (const node of nodes) {
      // Check all ports
      const allPorts = [...node.getInputPorts(), ...node.getOutputPorts()];
      
      for (const port of allPorts) {
        const portPos = node.getPortPosition(port.id);
        if (!portPos) continue;
        
        const dx = worldX - portPos.x;
        const dy = worldY - portPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= this.config.portClickRadius) {
          return { nodeId: node.id, portId: port.id };
        }
      }
    }
    
    return null;
  }
  
  /**
   * Validate a potential connection
   */
  private validateConnection(
    fromNodeId: string,
    fromPortId: string,
    toNodeId: string,
    toPortId: string
  ): { valid: boolean; error?: string } {
    const fromNode = this.stateManager.getNode(fromNodeId);
    const toNode = this.stateManager.getNode(toNodeId);
    
    if (!fromNode || !toNode) {
      return { valid: false, error: 'Node not found' };
    }
    
    // Can't connect node to itself
    if (fromNodeId === toNodeId) {
      return { valid: false, error: 'Cannot connect node to itself' };
    }
    
    const fromPort = fromNode.getPort(fromPortId);
    const toPort = toNode.getPort(toPortId);
    
    if (!fromPort || !toPort) {
      return { valid: false, error: 'Port not found' };
    }
    
    // Check port types (output → input only)
    if (fromPort.type === toPort.type) {
      return { valid: false, error: 'Must connect output to input' };
    }
    
    // Ensure correct direction (output → input)
    if (fromPort.type !== 'output' || toPort.type !== 'input') {
      return { valid: false, error: 'Invalid connection direction' };
    }
    
    // Check data type compatibility
    if (fromPort.dataType !== 'any' && toPort.dataType !== 'any' && fromPort.dataType !== toPort.dataType) {
      return { valid: false, error: `Type mismatch: ${fromPort.dataType} → ${toPort.dataType}` };
    }
    
    // Check for existing connection to input port (inputs can only have one connection)
    const existingLinks = this.stateManager.getLinksArray();
    const hasExistingInput = existingLinks.some(
      link => link.toNodeId === toNodeId && link.toPortId === toPortId
    );
    
    if (hasExistingInput) {
      return { valid: false, error: 'Input already connected' };
    }
    
    // Create temporary link for cycle check
    const tempLink: LinkData = {
      id: 'temp',
      fromNodeId,
      fromPortId,
      toNodeId,
      toPortId,
      animated: true,
      color: '#3b82f6',
      pulseSpeed: 200,
      status: 'idle'
    };
    
    // Check for cycles
    if (this.stateManager.wouldCreateCycle(tempLink)) {
      return { valid: false, error: 'Would create circular dependency' };
    }
    
    return { valid: true };
  }
  
  /**
   * Generate unique link ID
   */
  private generateLinkId(): string {
    return `link-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  // ============================================================================
  // PUBLIC GETTERS
  // ============================================================================
  
  /**
   * Get current connection state
   */
  getState(): ConnectionState {
    return { ...this.state };
  }
  
  /**
   * Check if currently dragging a connection
   */
  isDragging(): boolean {
    return this.state.mode !== 'idle';
  }
  
  /**
   * Get preview start position (for rendering)
   */
  getPreviewStart(): Point | null {
    if (this.state.mode === 'idle' || !this.state.sourceNodeId || !this.state.sourcePortId) {
      return null;
    }
    
    const node = this.stateManager.getNode(this.state.sourceNodeId);
    if (!node) return null;
    
    const portPos = node.getPortPosition(this.state.sourcePortId);
    return portPos || null;
  }
  
  /**
   * Get source node center and radius for dynamic connector positioning
   */
  getSourceNodeInfo(): { center: Point; radius: number } | null {
    if (this.state.mode === 'idle' || !this.state.sourceNodeId) {
      return null;
    }
    
    const node = this.stateManager.getNode(this.state.sourceNodeId);
    if (!node) return null;
    
    // Calculate node center
    const center = {
      x: node.x + node.width / 2,
      y: node.y + node.height / 2
    };
    
    // Estimate radius from node dimensions (use larger dimension / 2)
    const radius = Math.max(node.width, node.height) / 2;
    
    return { center, radius };
  }
  
  /**
   * Get preview end position (for rendering)
   */
  getPreviewEnd(): Point | null {
    if (this.state.mode === 'idle') return null;
    return { x: this.state.currentX, y: this.state.currentY };
  }
  
  /**
   * Get all links for rendering
   */
  getLinks(): Map<string, Link> {
    return this.links;
  }
  
  /**
   * Get hovered link
   */
  getHoveredLink(): Link | null {
    return this.state.hoveredLink;
  }
  
  /**
   * Invalidate all link caches (when nodes move)
   */
  invalidateAllCaches(): void {
    this.links.forEach(link => link.invalidateCache());
  }
}
