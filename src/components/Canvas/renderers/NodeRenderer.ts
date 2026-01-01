/**
 * Node Renderer
 * Renders nodes on the canvas with offscreen caching for performance
 * 
 * Features:
 * - Offscreen canvas caching for static node parts
 * - Dynamic rendering for animated elements
 * - Port visualization with connection indicators
 * - Status indicators (idle, running, success, error)
 * - Selection and hover states
 * - Smooth animations
 * 
 * @example
 * ```typescript
 * const renderer = new NodeRenderer();
 * renderer.render(ctx, node, camera);
 * ```
 */

import type { Camera } from '../core/Camera.js';
import type { BaseNode } from '../nodes/BaseNode.js';
import { SmartMatrixNode } from '../nodes/SmartMatrixNode.js';
import { SmartMatrixNodeRenderer } from './SmartMatrixNodeRenderer.js';
import { TestNode } from '../nodes/TestNode.js';
import { TestNodeRenderer } from './TestNodeRenderer.js';
import type { NodeStatus } from '../types/index.js';

export interface NodeRenderConfig {
  showPorts: boolean;
  showLabels: boolean;
  showStatus: boolean;
  shadowEnabled: boolean;
  animationsEnabled: boolean;
}

export class NodeRenderer {
  private config: NodeRenderConfig = {
    showPorts: true,
    showLabels: true,
    showStatus: true,
    shadowEnabled: true,
    animationsEnabled: true
  };
  
  // Specialized renderer for SmartMatrixNode
  private smartMatrixRenderer: SmartMatrixNodeRenderer;
  
  // Specialized renderer for TestNode
  private testNodeRenderer: TestNodeRenderer;
  
  // Offscreen canvas cache for static node parts
  private nodeCache: Map<string, HTMLCanvasElement> = new Map();
  private cacheInvalidated: Set<string> = new Set();
  
  // Animation state
  private animationTime: number = 0;
  
  // Colors
  private readonly colors = {
    background: '#ffffff',
    border: {
      idle: '#cbd5e1',
      selected: '#3b82f6',
      hover: '#60a5fa',
      running: '#f59e0b',
      success: '#10b981',
      error: '#ef4444'
    },
    port: {
      input: '#8b5cf6',
      output: '#06b6d4',
      connected: '#10b981',
      disconnected: '#94a3b8'
    },
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
      error: '#ef4444'
    }
  };
  
  constructor(config?: Partial<NodeRenderConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    
    // Initialize specialized renderers
    this.smartMatrixRenderer = new SmartMatrixNodeRenderer();
    this.testNodeRenderer = new TestNodeRenderer();
  }
  
  /**
   * Update renderer configuration
   */
  setConfig(config: Partial<NodeRenderConfig>): void {
    this.config = { ...this.config, ...config };
  }
  
  /**
   * Update animation time (call from render loop)
   */
  updateAnimation(deltaTime: number): void {
    this.animationTime += deltaTime;
  }
  
  /**
   * Check if any nodes have active animations
   */
  hasActiveAnimations(): boolean {
    return this.smartMatrixRenderer.hasActiveAnimations();
  }
  
  /**
   * Invalidate cache for a specific node
   */
  invalidateCache(nodeId: string): void {
    this.cacheInvalidated.add(nodeId);
  }
  
  /**
   * Clear all cached nodes
   */
  clearCache(): void {
    this.nodeCache.clear();
    this.cacheInvalidated.clear();
  }
  
  /**
   * Limit cache size to prevent memory bloat (LRU-style cleanup)
   */
  private limitCacheSize(maxSize: number = 100): void {
    if (this.nodeCache.size > maxSize) {
      // Remove oldest 20% of cached nodes
      const toRemove = Math.floor(maxSize * 0.2);
      const keys = Array.from(this.nodeCache.keys());
      for (let i = 0; i < toRemove; i++) {
        this.nodeCache.delete(keys[i]);
      }
    }
  }
  
  /**
   * Render a node on the canvas
   */
  render(
    ctx: CanvasRenderingContext2D,
    node: BaseNode,
    camera: Camera,
    nodeConnectionMap: Map<string, { sourceNodes: any[], targetNodes: any[] }>,
    connectionManager?: any
  ): void {
    // Use specialized renderer for SmartMatrixNode
    if (node instanceof SmartMatrixNode) {
      this.smartMatrixRenderer.render(ctx, node, camera, nodeConnectionMap, connectionManager);
      return;
    }
    
    // Use specialized renderer for TestNode
    if (node instanceof TestNode) {
      this.testNodeRenderer.render(ctx, node, camera, nodeConnectionMap, connectionManager);
      return;
    }
    
    // Convert world coordinates to screen coordinates
    const [screenX, screenY] = camera.toScreen(node.x, node.y);
    const screenWidth = node.width * camera.zoom;
    const screenHeight = node.height * camera.zoom;
    
    // Skip if node is outside viewport
    if (!this.isVisible(screenX, screenY, screenWidth, screenHeight, ctx.canvas)) {
      return;
    }
    
    // Save context state
    ctx.save();
    
    // Draw node body
    this.renderNodeBody(
      ctx,
      node,
      screenX,
      screenY,
      screenWidth,
      screenHeight,
      camera.zoom
    );
    
    // Draw ports
    if (this.config.showPorts) {
      this.renderPorts(ctx, node, camera);
    }
    
    // Draw label
    if (this.config.showLabels) {
      this.renderLabel(ctx, node, screenX, screenY, screenWidth, screenHeight, camera.zoom);
    }
    
    // Draw status indicator
    if (this.config.showStatus) {
      this.renderStatusIndicator(ctx, node, screenX, screenY, screenWidth, camera.zoom);
    }
    
    // Restore context state
    ctx.restore();
  }
  
  /**
   * Check if node is visible in viewport
   */
  private isVisible(
    x: number,
    y: number,
    width: number,
    height: number,
    canvas: HTMLCanvasElement
  ): boolean {
    return !(
      x + width < 0 ||
      x > canvas.width ||
      y + height < 0 ||
      y > canvas.height
    );
  }
  
  /**
   * Render node body (background, border, shadow)
   */
  private renderNodeBody(
    ctx: CanvasRenderingContext2D,
    node: BaseNode,
    x: number,
    y: number,
    width: number,
    height: number,
    zoom: number
  ): void {
    const borderRadius = 8 * zoom;
    const borderWidth = (node.isSelected ? 3 : 2) * zoom;
    
    // Shadow
    if (this.config.shadowEnabled) {
      ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
      ctx.shadowBlur = 10 * zoom;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4 * zoom;
    }
    
    // Background
    ctx.fillStyle = this.colors.background;
    this.roundRect(ctx, x, y, width, height, borderRadius);
    ctx.fill();
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Border
    const borderColor = this.getBorderColor(node);
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;
    this.roundRect(ctx, x, y, width, height, borderRadius);
    ctx.stroke();
    
    // Hover effect
    if (node.isHovered && !node.isSelected) {
      ctx.fillStyle = 'rgba(96, 165, 250, 0.05)';
      this.roundRect(ctx, x, y, width, height, borderRadius);
      ctx.fill();
    }
    
    // Selected effect
    if (node.isSelected) {
      ctx.fillStyle = 'rgba(59, 130, 246, 0.05)';
      this.roundRect(ctx, x, y, width, height, borderRadius);
      ctx.fill();
    }
    
    // Top accent bar (color indicator)
    ctx.fillStyle = node.color;
    this.roundRect(
      ctx,
      x,
      y,
      width,
      20 * zoom,
      borderRadius,
      true, // top corners only
      false
    );
    ctx.fill();
  }
  
  /**
   * Render input and output ports
   */
  private renderPorts(
    ctx: CanvasRenderingContext2D,
    node: BaseNode,
    camera: Camera
  ): void {
    const portRadius = 8 * camera.zoom;
    const portBorder = 2 * camera.zoom;
    
    // Render input ports (left side)
    const inputPorts = node.getInputPorts();
    const inputSpacing = node.height / (inputPorts.length + 1);
    inputPorts.forEach((port, index) => {
      const worldX = node.x;
      const worldY = node.y + inputSpacing * (index + 1);
      const [screenX, screenY] = camera.toScreen(worldX, worldY);
      
      // Port circle
      ctx.beginPath();
      ctx.arc(screenX, screenY, portRadius, 0, Math.PI * 2);
      ctx.fillStyle = port.connected 
        ? this.colors.port.connected 
        : this.colors.port.input;
      ctx.fill();
      ctx.strokeStyle = this.colors.background;
      ctx.lineWidth = portBorder;
      ctx.stroke();
      
      // Port label (if zoomed in enough)
      if (camera.zoom > 0.6) {
        ctx.fillStyle = this.colors.text.secondary;
        ctx.font = `${12 * camera.zoom}px Inter, sans-serif`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(port.label, screenX - portRadius - 8, screenY);
      }
    });
    
    // Render output ports (right side)
    const outputPorts = node.getOutputPorts();
    const outputSpacing = node.height / (outputPorts.length + 1);
    outputPorts.forEach((port, index) => {
      const worldX = node.x + node.width;
      const worldY = node.y + outputSpacing * (index + 1);
      const [screenX, screenY] = camera.toScreen(worldX, worldY);
      
      // Port circle
      ctx.beginPath();
      ctx.arc(screenX, screenY, portRadius, 0, Math.PI * 2);
      ctx.fillStyle = port.connected 
        ? this.colors.port.connected 
        : this.colors.port.output;
      ctx.fill();
      ctx.strokeStyle = this.colors.background;
      ctx.lineWidth = portBorder;
      ctx.stroke();
      
      // Port label (if zoomed in enough)
      if (camera.zoom > 0.6) {
        ctx.fillStyle = this.colors.text.secondary;
        ctx.font = `${12 * camera.zoom}px Inter, sans-serif`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(port.label, screenX + portRadius + 8, screenY);
      }
    });
  }
  
  /**
   * Render node label
   */
  private renderLabel(
    ctx: CanvasRenderingContext2D,
    node: BaseNode,
    x: number,
    y: number,
    width: number,
    height: number,
    zoom: number
  ): void {
    // Node type/label in accent bar
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${14 * zoom}px Inter, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.label, x + width / 2, y + 10 * zoom);
    
    // Error message (if any)
    if (node.errorMessage && zoom > 0.5) {
      ctx.fillStyle = this.colors.text.error;
      ctx.font = `${11 * zoom}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      
      // Wrap text if too long
      const maxWidth = width - 20 * zoom;
      const words = node.errorMessage.split(' ');
      let line = '';
      let lineY = y + 35 * zoom;
      
      words.forEach(word => {
        const testLine = line + word + ' ';
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && line !== '') {
          ctx.fillText(line, x + width / 2, lineY);
          line = word + ' ';
          lineY += 15 * zoom;
        } else {
          line = testLine;
        }
      });
      ctx.fillText(line, x + width / 2, lineY);
    }
  }
  
  /**
   * Render status indicator (running animation, success/error icons)
   */
  private renderStatusIndicator(
    ctx: CanvasRenderingContext2D,
    node: BaseNode,
    x: number,
    y: number,
    width: number,
    zoom: number
  ): void {
    const indicatorSize = 12 * zoom;
    const indicatorX = x + width - 15 * zoom;
    const indicatorY = y + 5 * zoom;
    
    switch (node.status) {
      case 'running':
        // Animated spinner
        if (this.config.animationsEnabled) {
          const rotation = (this.animationTime * 0.003) % (Math.PI * 2);
          ctx.save();
          ctx.translate(indicatorX, indicatorY);
          ctx.rotate(rotation);
          ctx.strokeStyle = this.colors.border.running;
          ctx.lineWidth = 2 * zoom;
          ctx.beginPath();
          ctx.arc(0, 0, indicatorSize / 2, 0, Math.PI * 1.5);
          ctx.stroke();
          ctx.restore();
        }
        break;
        
      case 'success':
        // Checkmark
        ctx.strokeStyle = this.colors.border.success;
        ctx.lineWidth = 2 * zoom;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        ctx.moveTo(indicatorX - indicatorSize / 3, indicatorY);
        ctx.lineTo(indicatorX - indicatorSize / 6, indicatorY + indicatorSize / 3);
        ctx.lineTo(indicatorX + indicatorSize / 3, indicatorY - indicatorSize / 3);
        ctx.stroke();
        break;
        
      case 'error':
        // X mark
        ctx.strokeStyle = this.colors.border.error;
        ctx.lineWidth = 2 * zoom;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(indicatorX - indicatorSize / 3, indicatorY - indicatorSize / 3);
        ctx.lineTo(indicatorX + indicatorSize / 3, indicatorY + indicatorSize / 3);
        ctx.moveTo(indicatorX + indicatorSize / 3, indicatorY - indicatorSize / 3);
        ctx.lineTo(indicatorX - indicatorSize / 3, indicatorY + indicatorSize / 3);
        ctx.stroke();
        break;
    }
  }
  
  /**
   * Get border color based on node state
   */
  private getBorderColor(node: BaseNode): string {
    if (node.isSelected) {
      return this.colors.border.selected;
    }
    
    switch (node.status) {
      case 'running':
        return this.colors.border.running;
      case 'success':
        return this.colors.border.success;
      case 'error':
        return this.colors.border.error;
      default:
        return node.isHovered 
          ? this.colors.border.hover 
          : this.colors.border.idle;
    }
  }
  
  /**
   * Draw rounded rectangle
   */
  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    topOnly: boolean = false,
    bottomOnly: boolean = false
  ): void {
    ctx.beginPath();
    
    if (topOnly) {
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height);
      ctx.lineTo(x, y + height);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
    } else if (bottomOnly) {
      ctx.moveTo(x, y);
      ctx.lineTo(x + width, y);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y);
    } else {
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
    }
    
    ctx.closePath();
  }
}
