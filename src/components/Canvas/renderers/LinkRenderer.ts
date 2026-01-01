/**
 * Link Renderer
 * Renders animated connections between nodes with flowing pulses
 * 
 * Features:
 * - Smooth Bezier curve rendering
 * - Animated data flow pulses
 * - Connection status visualization (idle, active, error)
 * - Selection and hover states
 * - Performance-optimized with viewport culling
 * 
 * @example
 * ```typescript
 * const renderer = new LinkRenderer();
 * renderer.render(ctx, link, camera, animationTime);
 * ```
 */

import type { Camera } from '../core/Camera.js';
import type { Link } from '../connections/Link.js';
import type { Point } from '../types/index.js';

/**
 * Render configuration constants
 */
const RENDER_CONFIG = {
  ARROW_SIZE_BASE: 8,
  ARROW_ANGLE: Math.PI / 6, // 30 degrees
  PULSE_RADIUS_BASE: 4,
  PULSE_GLOW_MULTIPLIER: 2,
  SHADOW_BLUR_BASE: 10,
  SHADOW_OPACITY: 0.4
} as const;

export interface LinkRenderConfig {
  lineWidth: number;
  selectedLineWidth: number;
  showArrows: boolean;
  showPulses: boolean;
  pulseSpeed: number;
  pulseCount: number;
}

export class LinkRenderer {
  private config: LinkRenderConfig = {
    lineWidth: 2,
    selectedLineWidth: 3,
    showArrows: true,
    showPulses: true,
    pulseSpeed: 200, // pixels per second
    pulseCount: 3 // number of pulses per link
  };
  
  // Colors
  private readonly colors = {
    idle: '#94a3b8',
    active: '#3b82f6',
    error: '#ef4444',
    success: '#10b981',
    selected: '#3b82f6',
    hover: '#60a5fa',
    pulse: '#60a5fa'
  };
  
  constructor(config?: Partial<LinkRenderConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }
  
  /**
   * Update renderer configuration
   */
  setConfig(config: Partial<LinkRenderConfig>): void {
    this.config = { ...this.config, ...config };
  }
  
  /**
   * Render a link on the canvas
   */
  render(
    ctx: CanvasRenderingContext2D,
    link: Link,
    camera: Camera,
    animationTime: number = 0,
    isSelected: boolean = false,
    isHovered: boolean = false
  ): void {
    try {
      // Get endpoints in world space
      const { start, end } = link.getEndpoints();
      const { cp1, cp2 } = link.getControlPoints();
    
    // Transform to screen space
    const [startX, startY] = camera.toScreen(start.x, start.y);
    const [endX, endY] = camera.toScreen(end.x, end.y);
    const [cp1X, cp1Y] = camera.toScreen(cp1.x, cp1.y);
    const [cp2X, cp2Y] = camera.toScreen(cp2.x, cp2.y);
    
    // Viewport culling - skip if completely outside
    if (!this.isVisible(startX, startY, endX, endY, ctx.canvas)) {
      return;
    }
    
    ctx.save();
    
    // Draw connection curve
    this.renderCurve(
      ctx,
      { x: startX, y: startY },
      { x: cp1X, y: cp1Y },
      { x: cp2X, y: cp2Y },
      { x: endX, y: endY },
      link.data.status,
      camera.zoom,
      isSelected,
      isHovered
    );
    
    // Draw arrow at end
    if (this.config.showArrows) {
      this.renderArrow(
        ctx,
        { x: cp2X, y: cp2Y },
        { x: endX, y: endY },
        link.data.status,
        camera.zoom,
        isSelected
      );
    }
    
    // Draw animated pulses
    if (this.config.showPulses && link.data.status === 'active') {
      this.renderPulses(
        ctx,
        link,
        camera,
        animationTime
      );
    }
    
    ctx.restore();
    } catch (error) {
      console.error('Error rendering link:', error);
      ctx.restore(); // Ensure context is restored even on error
    }
  }
  
  /**
   * Render the Bezier curve
   */
  private renderCurve(
    ctx: CanvasRenderingContext2D,
    start: Point,
    cp1: Point,
    cp2: Point,
    end: Point,
    status: string,
    zoom: number,
    isSelected: boolean,
    isHovered: boolean
  ): void {
    const lineWidth = (isSelected ? this.config.selectedLineWidth : this.config.lineWidth) * zoom;
    
    // Determine color based on status and state
    let color = this.colors.idle;
    if (isSelected) {
      color = this.colors.selected;
    } else if (isHovered) {
      color = this.colors.hover;
    } else {
      switch (status) {
        case 'active':
          color = this.colors.active;
          break;
        case 'error':
          color = this.colors.error;
          break;
        default:
          color = this.colors.idle;
      }
    }
    
    // Draw shadow for selected/hover
    if (isSelected || isHovered) {
      ctx.shadowColor = `rgba(59, 130, 246, ${RENDER_CONFIG.SHADOW_OPACITY})`;
      ctx.shadowBlur = RENDER_CONFIG.SHADOW_BLUR_BASE * zoom;
    }
    
    // Draw curve (straight line instead of bezier for circular nodes)
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y); // Draw straight line
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
  }
  
  /**
   * Render arrow at end of connection
   */
  private renderArrow(
    ctx: CanvasRenderingContext2D,
    cp2: Point,
    end: Point,
    status: string,
    zoom: number,
    isSelected: boolean
  ): void {
    // Calculate arrow direction
    const dx = end.x - cp2.x;
    const dy = end.y - cp2.y;
    const angle = Math.atan2(dy, dx);
    
    const arrowSize = RENDER_CONFIG.ARROW_SIZE_BASE * zoom;
    const arrowAngle = RENDER_CONFIG.ARROW_ANGLE;
    
    // Arrow color matches line color
    let color = this.colors.idle;
    if (isSelected) {
      color = this.colors.selected;
    } else if (status === 'active') {
      color = this.colors.active;
    } else if (status === 'error') {
      color = this.colors.error;
    }
    
    ctx.save();
    ctx.translate(end.x, end.y);
    ctx.rotate(angle);
    
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-arrowSize, -arrowSize * Math.tan(arrowAngle));
    ctx.lineTo(-arrowSize, arrowSize * Math.tan(arrowAngle));
    ctx.closePath();
    
    ctx.fillStyle = color;
    ctx.fill();
    
    ctx.restore();
  }
  
  /**
   * Render animated pulses along the connection
   */
  private renderPulses(
    ctx: CanvasRenderingContext2D,
    link: Link,
    camera: Camera,
    animationTime: number
  ): void {
    const pathLength = link.getPathLength();
    const pulseRadius = RENDER_CONFIG.PULSE_RADIUS_BASE * camera.zoom;
    
    // Calculate pulse positions
    for (let i = 0; i < this.config.pulseCount; i++) {
      // Stagger pulses evenly
      const offset = (i / this.config.pulseCount) * pathLength;
      const distance = ((animationTime * this.config.pulseSpeed) + offset) % pathLength;
      
      const point = link.getPointAtDistance(distance);
      if (!point) continue;
      
      const [screenX, screenY] = camera.toScreen(point.x, point.y);
      
      // Draw pulse with glow effect
      const gradient = ctx.createRadialGradient(
        screenX, screenY, 0,
        screenX, screenY, pulseRadius * RENDER_CONFIG.PULSE_GLOW_MULTIPLIER
      );
      gradient.addColorStop(0, this.colors.pulse);
      gradient.addColorStop(0.5, 'rgba(96, 165, 250, 0.5)');
      gradient.addColorStop(1, 'rgba(96, 165, 250, 0)');
      
      ctx.beginPath();
      ctx.arc(screenX, screenY, pulseRadius * 2, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      
      // Inner bright circle
      ctx.beginPath();
      ctx.arc(screenX, screenY, pulseRadius, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
    }
  }
  
  /**
   * Render connection preview (while dragging to create)
   */
  renderPreview(
    ctx: CanvasRenderingContext2D,
    start: Point,
    end: Point,
    camera: Camera,
    isValid: boolean
  ): void {
    const [startX, startY] = camera.toScreen(start.x, start.y);
    const [endX, endY] = camera.toScreen(end.x, end.y);
    
    // Calculate control points
    const dx = endX - startX;
    const distance = Math.abs(dx);
    const offset = Math.min(Math.max(distance * 0.4, 50), 200) * camera.zoom;
    
    const cp1X = startX + offset;
    const cp1Y = startY;
    const cp2X = endX - offset;
    const cp2Y = endY;
    
    // Draw dashed curve
    ctx.save();
    ctx.setLineDash([5 * camera.zoom, 5 * camera.zoom]);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(cp1X, cp1Y, cp2X, cp2Y, endX, endY);
    ctx.strokeStyle = isValid ? this.colors.active : this.colors.error;
    ctx.lineWidth = 2 * camera.zoom;
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
    
    // Draw end circle
    ctx.beginPath();
    ctx.arc(endX, endY, 6 * camera.zoom, 0, Math.PI * 2);
    ctx.fillStyle = isValid ? this.colors.active : this.colors.error;
    ctx.fill();
  }
  
  /**
   * Check if link is visible in viewport (rough check)
   */
  private isVisible(
    x1: number, y1: number,
    x2: number, y2: number,
    canvas: HTMLCanvasElement
  ): boolean {
    const minX = Math.min(x1, x2);
    const maxX = Math.max(x1, x2);
    const minY = Math.min(y1, y2);
    const maxY = Math.max(y1, y2);
    
    return !(
      maxX < 0 ||
      minX > canvas.width ||
      maxY < 0 ||
      minY > canvas.height
    );
  }
}
