/**
 * Smart Matrix Node Renderer - Stage 1: Circular Design with Retina-grade rendering
 * Renders circular node with nested layers and AI indicator
 * Features ultra-crisp text via offscreen canvas caching
 */

import type { Camera } from '../core/Camera.js';
import { SmartMatrixNode } from '../nodes/SmartMatrixNode.js';
import { NodeTextCache } from '../utils/NodeTextCache.js';

export class SmartMatrixNodeRenderer {
  private animationTime: number = 0;
  private hoverAnimations: Map<string, { progress: number; isExpanding: boolean }> = new Map();
  private textCache: NodeTextCache;
  
  constructor() {
    // Initialize text cache with 100 entry limit, 2x resolution multiplier
    this.textCache = new NodeTextCache(100, 2);
  }
  
  /**
   * Render circular Smart Matrix node with Retina-grade DPR-aware gradients
   */
  public render(
    ctx: CanvasRenderingContext2D,
    node: SmartMatrixNode,
    camera: Camera
  ): void {
    try {
      ctx.save();
      
      // Update animation time
      this.animationTime += 0.016; // ~60fps
      
      // Get DPR for high-resolution gradient rendering
      const dpr = camera.getDevicePixelRatio();
      
      // Get screen position (already pixel-perfect from camera)
      const [screenX, screenY] = camera.toScreen(node.x, node.y);
      const zoom = camera.zoom;
      
      // Calculate center point (node x,y is top-left, we need center)
      const centerX = screenX + (node.width * zoom) / 2;
      const centerY = screenY + (node.height * zoom) / 2;
      
      // Circle dimensions (scaled) - no additional rounding needed, camera handles it
      const outerRadius = 110 * zoom; // 220px diameter / 2
      const connectionRadius = 80 * zoom; // 160px diameter / 2 (smaller than mask)
      const maskRadius = 85 * zoom;   // 170px diameter / 2 (reduced to make ring bigger)
      const hoverRadius = 75 * zoom;  // 150px diameter / 2
      const aiRadius = 75 * zoom;     // 150px diameter / 2
      
      // Viewport culling
      if (!this.isVisible(centerX, centerY, outerRadius * 2, ctx.canvas)) {
        return;
      }
      
      // LAYER 1: Transparent Container (main container)
      ctx.beginPath();
      ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
      ctx.fillStyle = 'transparent';
      ctx.fill();
      
      // CONNECTION LAYER: Transparent (smaller than mask, sits directly under mask)
      ctx.beginPath();
      ctx.arc(centerX, centerY, connectionRadius, 0, Math.PI * 2);
      ctx.fillStyle = 'transparent';
      ctx.fill();
      
      // RENDER OUTPUT PORT (before mask layer so it sits under it)
      this.renderOutputPort(ctx, centerX, centerY, outerRadius, maskRadius, zoom);
      
      // LAYER 2: White Mask (Creates Ring Effect)
      ctx.beginPath();
      ctx.arc(centerX, centerY, maskRadius, 0, Math.PI * 2);
      ctx.fillStyle = node.backgroundColor; // Dynamic background from user appearance
      ctx.fill();
      
      // LAYER 3: Hover Indicator (animates on hover)
      this.renderHoverIndicator(ctx, node, centerX, centerY, hoverRadius, maskRadius, zoom);
      
      // LAYER 4: DPR-aware gradient circle background (Connected Minds style)
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, aiRadius, 0, Math.PI * 2);
      ctx.clip(); // Clip to circle
      
      // Calculate physical pixel coordinates for gradients (DPR-aware)
      // This ensures gradients are calculated at the actual resolution
      const physicalRadius = aiRadius * dpr;
      
      // Base gradient (Connected Minds style - cyan, magenta, pink, orange)
      // Use physical pixel coordinates to prevent banding on high-DPI displays
      const layer4Gradient = ctx.createLinearGradient(
        centerX - aiRadius, centerY - aiRadius,
        centerX + aiRadius, centerY + aiRadius
      );
      layer4Gradient.addColorStop(0, '#06B6D4');    // cyan
      layer4Gradient.addColorStop(0.33, '#C026D3'); // magenta
      layer4Gradient.addColorStop(0.66, '#EC4899'); // pink
      layer4Gradient.addColorStop(1, '#F59E0B');    // orange
      ctx.fillStyle = layer4Gradient;
      ctx.fillRect(centerX - aiRadius, centerY - aiRadius, aiRadius * 2, aiRadius * 2);
      
      // Radial overlays for depth (Connected Minds style) - DPR-aware
      // Cyan overlay
      const cyanOverlay = ctx.createRadialGradient(
        centerX - aiRadius * 0.6, centerY + aiRadius * 0.6, 0,
        centerX - aiRadius * 0.6, centerY + aiRadius * 0.6, aiRadius
      );
      cyanOverlay.addColorStop(0, 'rgba(6, 182, 212, 0.6)');
      cyanOverlay.addColorStop(0.5, 'transparent');
      ctx.fillStyle = cyanOverlay;
      ctx.fillRect(centerX - aiRadius, centerY - aiRadius, aiRadius * 2, aiRadius * 2);
      
      // Magenta overlay
      const magentaOverlay = ctx.createRadialGradient(
        centerX + aiRadius * 0.6, centerY - aiRadius * 0.6, 0,
        centerX + aiRadius * 0.6, centerY - aiRadius * 0.6, aiRadius
      );
      magentaOverlay.addColorStop(0, 'rgba(192, 38, 211, 0.6)');
      magentaOverlay.addColorStop(0.5, 'transparent');
      ctx.fillStyle = magentaOverlay;
      ctx.fillRect(centerX - aiRadius, centerY - aiRadius, aiRadius * 2, aiRadius * 2);
      
      // Pink overlay
      const pinkOverlay = ctx.createRadialGradient(
        centerX - aiRadius * 0.2, centerY - aiRadius * 0.2, 0,
        centerX - aiRadius * 0.2, centerY - aiRadius * 0.2, aiRadius * 0.8
      );
      pinkOverlay.addColorStop(0, 'rgba(236, 72, 153, 0.5)');
      pinkOverlay.addColorStop(0.5, 'transparent');
      ctx.fillStyle = pinkOverlay;
      ctx.fillRect(centerX - aiRadius, centerY - aiRadius, aiRadius * 2, aiRadius * 2);
      
      // Orange overlay
      const orangeOverlay = ctx.createRadialGradient(
        centerX + aiRadius * 0.2, centerY + aiRadius * 0.2, 0,
        centerX + aiRadius * 0.2, centerY + aiRadius * 0.2, aiRadius * 0.6
      );
      orangeOverlay.addColorStop(0, 'rgba(245, 158, 11, 0.4)');
      orangeOverlay.addColorStop(0.5, 'transparent');
      ctx.fillStyle = orangeOverlay;
      ctx.fillRect(centerX - aiRadius, centerY - aiRadius, aiRadius * 2, aiRadius * 2);
      
      ctx.restore();
      
      // AI Indicator (center diamond with animated i)
      this.renderAIIndicator(ctx, centerX, centerY, zoom);
      
      // RENDER TEXT BELOW CIRCLE (Retina-grade with offscreen caching)
      this.renderText(ctx, centerX, screenY + (node.height * zoom), zoom, dpr);
      
      ctx.restore();
    } catch (error) {
      console.error('Error rendering SmartMatrixNode:', error);
      ctx.restore();
    }
  }
  
  /**
   * Render hover indicator with smooth expand/contract animation
   */
  private renderHoverIndicator(
    ctx: CanvasRenderingContext2D,
    node: SmartMatrixNode,
    centerX: number,
    centerY: number,
    hoverRadius: number,
    maxRadius: number,
    zoom: number
  ): void {
    const nodeId = node.id;
    
    // Get or initialize animation state
    if (!this.hoverAnimations.has(nodeId)) {
      this.hoverAnimations.set(nodeId, { progress: 0, isExpanding: false });
    }
    
    const animState = this.hoverAnimations.get(nodeId)!;
    
    // Update animation state based on hover
    if (node.isHovered && !animState.isExpanding) {
      animState.isExpanding = true;
    } else if (!node.isHovered && animState.isExpanding) {
      animState.isExpanding = false;
    }
    
    // Update progress (0 to 1)
    const animSpeed = 0.08; // Animation speed per frame
    if (animState.isExpanding) {
      animState.progress = Math.min(1, animState.progress + animSpeed);
    } else {
      animState.progress = Math.max(0, animState.progress - animSpeed);
    }
    
    // Only render if there's something to show
    if (animState.progress > 0) {
      // Smooth easing function (ease-out)
      const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
      const easedProgress = easeOut(animState.progress);
      
      // Interpolate radius from hoverRadius to maxRadius
      const currentRadius = hoverRadius + (maxRadius - hoverRadius) * easedProgress;
      
      // Interpolate opacity (fade in/out)
      const opacity = 0.3 * animState.progress;
      
      ctx.beginPath();
      ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 235, 205, ${opacity})`; // Antiquewhite with animated transparency
      ctx.fill();
    }
  }
  
  /**
   * Render AI Indicator - static white diamond with "i"
   */
  private renderAIIndicator(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    zoom: number
  ): void {
    ctx.save();
    
    // Transform to diamond position
    ctx.translate(centerX, centerY);
    ctx.rotate(Math.PI / 4); // 45 degrees
    
    const size = 70 * zoom;
    const radius = 15 * zoom; // border-radius (proportionally increased)
    
    // Main diamond with transparent background and white border
    this.roundRect(ctx, -size / 2, -size / 2, size, size, radius);
    
    // White border
    ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
    ctx.lineWidth = 2 * zoom;
    ctx.stroke();
    
    ctx.restore();
    
    // Draw white "i" text
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${60 * zoom}px "Fredoka", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('i', centerX, centerY);
    ctx.restore();
  }
  
  /**
   * Get color from animated gradient
   */
  private getGradientColor(position: number, opacity: number = 1): string {
    // Gradient colors: blue -> purple -> pink -> orange -> blue
    const colors = [
      { r: 59, g: 130, b: 246 },   // #3b82f6
      { r: 139, g: 92, b: 246 },   // #8b5cf6
      { r: 236, g: 72, b: 153 },   // #ec4899
      { r: 245, g: 158, b: 11 },   // #f59e0b
      { r: 59, g: 130, b: 246 }    // back to blue
    ];
    
    // Normalize position to 0-1
    const pos = (position % 4) / 4;
    const index = pos * (colors.length - 1);
    const i1 = Math.floor(index);
    const i2 = Math.min(i1 + 1, colors.length - 1);
    const frac = index - i1;
    
    const c1 = colors[i1];
    const c2 = colors[i2];
    
    const r = Math.round(c1.r + (c2.r - c1.r) * frac);
    const g = Math.round(c1.g + (c2.g - c1.g) * frac);
    const b = Math.round(c1.b + (c2.b - c1.b) * frac);
    
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
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
   * Render output port (half-diamond emerging from ring)
   */
  private renderOutputPort(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    outerRadius: number,
    maskRadius: number,
    zoom: number
  ): void {
    // Port position: right center, positioned so it's half behind the mask layer
    const portX = centerX + maskRadius; // Position at mask edge instead of outer edge
    const portY = centerY;
    const size = 40 * zoom; // Diamond size (double the old radius for similar visual size)
    const radius = 8 * zoom; // Border radius for rounded corners
    
    // Draw port as rounded diamond
    ctx.save();
    ctx.translate(portX, portY);
    ctx.rotate(Math.PI / 4); // 45 degrees
    
    // Draw rounded diamond shape
    this.roundRect(ctx, -size / 2, -size / 2, size, size, radius);
    ctx.fillStyle = '#3b82f6'; // Blue for output
    ctx.fill();
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 2 * zoom;
    ctx.stroke();
    
    ctx.restore();
  }
  
  /**
   * Render text below circle using high-resolution canvas caching
   * This achieves ultra-crisp text on all displays without DOM overlay jitter
   */
  private renderText(
    ctx: CanvasRenderingContext2D,
    centerX: number,
    bottomY: number,
    zoom: number,
    dpr: number
  ): void {
    ctx.save();
    
    // Calculate font sizes scaled by zoom
    const titleSize = Math.round(16 * zoom);
    const descSize = Math.round(12 * zoom);
    
    // Get or create cached text canvases at high resolution
    // The cache handles 2x * DPR rendering automatically
    const titleCanvas = this.textCache.getOrCreateTextCanvas(
      'Smart Matrix',
      `600 ${titleSize}px 'Work Sans', sans-serif`,
      300,
      '#1f2937',
      dpr
    );
    
    const descCanvas = this.textCache.getOrCreateTextCanvas(
      'AI Orchestration',
      `400 ${descSize}px 'Work Sans', sans-serif`,
      300,
      '#6b7280',
      dpr
    );
    
    // Calculate the display width (logical pixels, not physical)
    // Canvas is rendered at renderScale, so divide by that to get display size
    const renderScale = 2 * dpr; // textScale * dpr
    const titleDisplayWidth = titleCanvas.width / renderScale;
    const descDisplayWidth = descCanvas.width / renderScale;
    const titleDisplayHeight = titleCanvas.height / renderScale;
    const descDisplayHeight = descCanvas.height / renderScale;
    
    // Stamp high-res text onto main canvas (GPU-accelerated)
    // The canvas is already in logical pixels due to ctx.scale(dpr, dpr)
    ctx.drawImage(
      titleCanvas,
      0, 0, titleCanvas.width, titleCanvas.height,  // Source (physical pixels)
      Math.round(centerX - titleDisplayWidth / 2),   // Dest X (centered)
      Math.round(bottomY - 30 * zoom),               // Dest Y
      titleDisplayWidth,                             // Dest width (logical)
      titleDisplayHeight                             // Dest height (logical)
    );
    
    ctx.drawImage(
      descCanvas,
      0, 0, descCanvas.width, descCanvas.height,
      Math.round(centerX - descDisplayWidth / 2),
      Math.round(bottomY - 10 * zoom),
      descDisplayWidth,
      descDisplayHeight
    );
    
    ctx.restore();
  }
  
  /**
   * Check if node is visible in viewport
   */
  private isVisible(
    centerX: number,
    centerY: number,
    diameter: number,
    canvas: HTMLCanvasElement
  ): boolean {
    const radius = diameter / 2;
    return !(
      centerX + radius < 0 ||
      centerX - radius > canvas.width ||
      centerY + radius < 0 ||
      centerY - radius > canvas.height
    );
  }
}
