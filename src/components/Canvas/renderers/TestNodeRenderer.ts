/**
 * Test Node Renderer
 * Renders circular test node with input diamond connector (left) for testing connections
 */

import type { Camera } from '../core/Camera.js';
import type { TestNode } from '../nodes/TestNode.js';

export class TestNodeRenderer {
  private portHoverAnimations: Map<string, { progress: number; isExpanding: boolean }> = new Map();
  private lastCleanupFrame = 0;
  private frameCount = 0;
  
  /**
   * Render the test node with circular design
   */
  public render(ctx: CanvasRenderingContext2D, node: TestNode, camera: Camera, nodeConnectionMap: Map<string, { sourceNodes: any[], targetNodes: any[] }>, connectionManager?: any): void {
    // Cleanup stale animation states every 300 frames
    this.frameCount++;
    if (this.frameCount - this.lastCleanupFrame > 300) {
      this.cleanupStaleAnimations();
      this.lastCleanupFrame = this.frameCount;
    }
    // Convert world coordinates to screen coordinates
    const [centerX, centerY] = camera.toScreen(node.x + node.width / 2, node.y + node.height / 2);
    const zoom = camera.zoom;
    const maskRadius = 85 * zoom;
    
    ctx.save();
    
    // Draw outer ring (green gradient)
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maskRadius + 20 * zoom);
    gradient.addColorStop(0, 'rgba(16, 185, 129, 0)'); // Transparent center
    gradient.addColorStop(0.7, 'rgba(16, 185, 129, 0.3)'); // Green glow
    gradient.addColorStop(1, 'rgba(16, 185, 129, 0.6)'); // Brighter edge
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, maskRadius + 20 * zoom, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw inner circle (dark background)
    ctx.fillStyle = node.backgroundColor;
    ctx.beginPath();
    ctx.arc(centerX, centerY, maskRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw label
    ctx.fillStyle = '#10b981'; // Green text
    ctx.font = `bold ${14 * zoom}px Inter, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('TEST', centerX, centerY - 10 * zoom);
    
    ctx.font = `${12 * zoom}px Inter, system-ui, sans-serif`;
    ctx.fillStyle = '#94a3b8'; // Lighter gray
    ctx.fillText('Connection Test', centerX, centerY + 10 * zoom);
    
    // Render ports
    this.renderInputPort(ctx, centerX, centerY, maskRadius, node.isPortHovered, zoom, node.id, node.backgroundColor, node, nodeConnectionMap, connectionManager);
    this.renderOutputPort(ctx, centerX, centerY, maskRadius, zoom, node, nodeConnectionMap);
    
    ctx.restore();
  }
  
  /**
   * Clean up stale animation states (prevent memory leaks)
   */
  private cleanupStaleAnimations(): void {
    for (const [key, state] of this.portHoverAnimations) {
      if (state.progress === 0 && !state.isExpanding) {
        this.portHoverAnimations.delete(key);
      }
    }
    if (this.portHoverAnimations.size > 200) {
      const toDelete = this.portHoverAnimations.size - 200;
      let deleted = 0;
      for (const key of this.portHoverAnimations.keys()) {
        if (deleted >= toDelete) break;
        this.portHoverAnimations.delete(key);
        deleted++;
      }
    }
  }
  
  /**
   * Draw rounded rectangle helper
   */
  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
  
  /**
   * Render the input port (diamond on left side) - matching SmartMatrix style
   */
  private renderInputPort(
    ctx: CanvasRenderingContext2D, 
    centerX: number, 
    centerY: number, 
    maskRadius: number,
    isHovered: boolean,
    zoom: number,
    nodeId: string,
    maskColor: string,
    node: any,
    nodeConnectionMap: Map<string, { sourceNodes: any[], targetNodes: any[] }>,
    connectionManager?: any
  ): void {
    // Calculate dynamic port position based on connection angle
    let angle = Math.PI; // Default: left
    
    // Check if being dragged over during connection creation
    const state = connectionManager && connectionManager.getState && connectionManager.getState();
    const isBeingDraggedOver = state && state.mode === 'dragging-from-output' && state.hoveredNodeId === nodeId;
    
    if (isBeingDraggedOver && state) {
      // Point toward the drag cursor
      const nodeCenterX = node.x + node.width / 2;
      const nodeCenterY = node.y + node.height / 2;
      angle = Math.atan2(state.currentY - nodeCenterY, state.currentX - nodeCenterX);
    } else {
      // Use existing connection angle
      const connections = nodeConnectionMap.get(nodeId);
      if (connections && connections.sourceNodes.length > 0) {
        const sourceNode = connections.sourceNodes[0];
        const sourceCenterX = sourceNode.x + sourceNode.width / 2;
        const sourceCenterY = sourceNode.y + sourceNode.height / 2;
        const nodeCenterX = node.x + node.width / 2;
        const nodeCenterY = node.y + node.height / 2;
        angle = Math.atan2(sourceCenterY - nodeCenterY, sourceCenterX - nodeCenterX);
      }
    }
    
    const basePortX = centerX + maskRadius * Math.cos(angle); // Dynamic position
    const portY = centerY + maskRadius * Math.sin(angle); // Dynamic position
    const size = 40 * zoom; // Diamond size (same as SmartMatrix)
    const radius = 8 * zoom; // Border radius for rounded corners
    
    // Get or initialize animation state
    const portKey = `${nodeId}-input`;
    if (!this.portHoverAnimations.has(portKey)) {
      this.portHoverAnimations.set(portKey, { progress: 0, isExpanding: false });
    }
    
    const animState = this.portHoverAnimations.get(portKey)!;
    
    // Update animation state based on hover
    if (isHovered && !animState.isExpanding) {
      animState.isExpanding = true;
    } else if (!isHovered && animState.isExpanding) {
      animState.isExpanding = false;
    }
    
    // Update progress (0 to 1)
    const animSpeed = 0.2; // Animation speed per frame
    if (animState.isExpanding) {
      animState.progress = Math.min(1, animState.progress + animSpeed);
    } else {
      animState.progress = Math.max(0, animState.progress - animSpeed);
    }
    
    // Smooth easing function (ease-out)
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
    const easedProgress = easeOut(animState.progress);
    
    // Animate position along the angle direction
    const moveDistance = 10 * zoom;
    const portX = basePortX + Math.cos(angle) * (moveDistance * easedProgress);
    const portY_adjusted = portY + Math.sin(angle) * (moveDistance * easedProgress);
    
    // Interpolate color from semi-transparent to solid (green instead of purple)
    const baseOpacity = 0.502;
    const targetOpacity = 1.0;
    const currentOpacity = baseOpacity + (targetOpacity - baseOpacity) * easedProgress;

    // Draw port as rounded diamond - rotated to align with connection
    ctx.save();
    ctx.translate(portX, portY_adjusted);
    ctx.rotate(angle + Math.PI / 4); // Rotate to align with connection angle + 45° for diamond
    
    // Draw mask layer (background) - slightly larger
    const maskSize = size + (4 * zoom);
    this.roundRect(ctx, -maskSize / 2, -maskSize / 2, maskSize, maskSize, radius);
    ctx.fillStyle = maskColor; // Node mask color
    ctx.fill();
    
    // Draw green connector on top
    this.roundRect(ctx, -size / 2, -size / 2, size, size, radius);
    ctx.fillStyle = `rgba(16, 185, 129, ${currentOpacity})`; // Green with animated opacity (#10b981)
    ctx.fill();
    
    ctx.restore();
    
    // Draw modern "-" icon (minus for input) along the angle direction
    ctx.save();
    const iconDistance = maskRadius + (moveDistance * easedProgress) / 2;
    const iconX = centerX + Math.cos(angle) * iconDistance;
    const iconY = centerY + Math.sin(angle) * iconDistance;
    
    const iconSize = 6 * zoom;
    const lineWidth = 1.5 * zoom;
    
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    
    // Draw horizontal line (minus sign)
    ctx.beginPath();
    ctx.moveTo(iconX - iconSize, iconY);
    ctx.lineTo(iconX + iconSize, iconY);
    ctx.stroke();
    
    ctx.restore();
  }
  
  /**
   * Render the output port (diamond on right side)
   */
  private renderOutputPort(
    ctx: CanvasRenderingContext2D, 
    centerX: number, 
    centerY: number, 
    maskRadius: number,
    zoom: number,
    node: any,
    nodeConnectionMap: Map<string, { sourceNodes: any[], targetNodes: any[] }>
  ): void {
    // Calculate dynamic port position based on connection angle
    let angle = 0; // Default: right
    const connections = nodeConnectionMap.get(node.id);
    if (connections && connections.targetNodes.length > 0) {
      const targetNode = connections.targetNodes[0];
      const targetCenterX = targetNode.x + targetNode.width / 2;
      const targetCenterY = targetNode.y + targetNode.height / 2;
      const nodeCenterX = node.x + node.width / 2;
      const nodeCenterY = node.y + node.height / 2;
      angle = Math.atan2(targetCenterY - nodeCenterY, targetCenterX - nodeCenterX);
    }
    
    const portX = centerX + maskRadius * Math.cos(angle); // Dynamic position
    const portY = centerY + maskRadius * Math.sin(angle); // Dynamic position
    const diamondSize = 12 * zoom;
    
    ctx.save();
    ctx.translate(portX, portY);
    ctx.rotate(angle + Math.PI / 4); // Rotate to align with connection angle + 45° for diamond
    
    // Draw diamond
    ctx.fillStyle = '#334155'; // Dark gray
    ctx.fillRect(-diamondSize / 2, -diamondSize / 2, diamondSize, diamondSize);
    
    // Draw border
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.strokeRect(-diamondSize / 2, -diamondSize / 2, diamondSize, diamondSize);
    
    ctx.restore();
    
    // Draw port label along the angle
    ctx.fillStyle = '#94a3b8';
    ctx.font = `${10 * zoom}px Inter, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const labelDistance = maskRadius + 15 * zoom;
    const labelX = centerX + Math.cos(angle) * labelDistance;
    const labelY = centerY + Math.sin(angle) * labelDistance;
    ctx.fillText('OUT', labelX, labelY);
  }
}
