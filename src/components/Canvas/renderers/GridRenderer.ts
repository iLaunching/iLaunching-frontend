/**
 * Grid Renderer
 * Renders infinite grid with adaptive detail based on zoom level
 * Optimized to only draw visible grid lines
 */

import { Camera } from '../core/Camera.js';

export interface GridConfig {
  enabled: boolean;
  size: number;
  type: 'lines' | 'dots'; // Grid type: lines or dots
  color: string;
  opacity: number;
  subGridEnabled: boolean;
  subGridDivisions: number;
  subGridColor: string;
  subGridOpacity: number;
}

export class GridRenderer {
  private config: GridConfig = {
    enabled: true,
    size: 50, // Base grid cell size in world units
    type: 'lines', // Default to line grid
    color: '#e5e7eb',
    opacity: 0.3,
    subGridEnabled: true,
    subGridDivisions: 5,
    subGridColor: '#f3f4f6',
    subGridOpacity: 0.15
  };
  
  constructor(config?: Partial<GridConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
  }
  
  /**
   * Update grid configuration
   */
  setConfig(config: Partial<GridConfig>): void {
    this.config = { ...this.config, ...config };
  }
  
  /**
   * Render the grid on the background canvas
   * Only draws grid lines visible in the current viewport
   */
  render(ctx: CanvasRenderingContext2D, camera: Camera): void {
    const startTime = performance.now();
    
    // Always clear the canvas first
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // If grid is disabled, just clear and return
    if (!this.config.enabled) {
      return;
    }
    
    // Fill with transparent background
    ctx.fillStyle = 'transparent';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Get viewport bounds in world space
    const bounds = camera.getViewportBounds();
    
    // Adaptive grid size based on zoom
    // At low zoom, show larger grid; at high zoom, show smaller grid
    const baseSize = this.config.size;
    const adaptiveSize = this.getAdaptiveGridSize(camera.zoom, baseSize);
    
    // Draw sub-grid (finer lines)
    if (this.config.subGridEnabled && camera.zoom > 0.5) {
      const subSize = adaptiveSize / this.config.subGridDivisions;
      this.drawGrid(
        ctx,
        camera,
        bounds,
        subSize,
        this.config.subGridColor,
        this.config.subGridOpacity
      );
    }
    
    // Draw main grid
    this.drawGrid(
      ctx,
      camera,
      bounds,
      adaptiveSize,
      this.config.color,
      this.config.opacity
    );
    
    // Performance tracking
    const renderTime = performance.now() - startTime;
    if (renderTime > 5) {
      console.warn(`Grid render took ${renderTime.toFixed(2)}ms`);
    }
  }
  
  /**
   * Draw grid lines or dots
   */
  private drawGrid(
    ctx: CanvasRenderingContext2D,
    camera: Camera,
    bounds: { minX: number; minY: number; maxX: number; maxY: number },
    gridSize: number,
    color: string,
    opacity: number
  ): void {
    ctx.globalAlpha = opacity;
    
    if (this.config.type === 'dots') {
      this.drawDottedGrid(ctx, camera, bounds, gridSize, color);
    } else {
      this.drawLineGrid(ctx, camera, bounds, gridSize, color);
    }
    
    ctx.globalAlpha = 1.0;
  }
  
  /**
   * Draw grid as dots
   */
  private drawDottedGrid(
    ctx: CanvasRenderingContext2D,
    camera: Camera,
    bounds: { minX: number; minY: number; maxX: number; maxY: number },
    gridSize: number,
    color: string
  ): void {
    ctx.fillStyle = color;
    const dotRadius = Math.max(1, 1.5 * camera.zoom); // Scale dot size with zoom
    
    // Calculate grid start positions (snap to grid)
    const startX = Math.floor(bounds.minX / gridSize) * gridSize;
    const startY = Math.floor(bounds.minY / gridSize) * gridSize;
    
    // Draw dots at grid intersections
    for (let worldX = startX; worldX <= bounds.maxX; worldX += gridSize) {
      for (let worldY = startY; worldY <= bounds.maxY; worldY += gridSize) {
        const [screenX, screenY] = camera.toScreen(worldX, worldY);
        
        ctx.beginPath();
        ctx.arc(screenX, screenY, dotRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  
  /**
   * Draw grid as lines
   */
  private drawLineGrid(
    ctx: CanvasRenderingContext2D,
    camera: Camera,
    bounds: { minX: number; minY: number; maxX: number; maxY: number },
    gridSize: number,
    color: string
  ): void {
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    // Calculate grid line start positions (snap to grid)
    const startX = Math.floor(bounds.minX / gridSize) * gridSize;
    const startY = Math.floor(bounds.minY / gridSize) * gridSize;
    
    // Vertical lines
    for (let worldX = startX; worldX <= bounds.maxX; worldX += gridSize) {
      const [screenX, screenY1] = camera.toScreen(worldX, bounds.minY);
      const [, screenY2] = camera.toScreen(worldX, bounds.maxY);
      
      ctx.moveTo(screenX, screenY1);
      ctx.lineTo(screenX, screenY2);
    }
    
    // Horizontal lines
    for (let worldY = startY; worldY <= bounds.maxY; worldY += gridSize) {
      const [screenX1, screenY] = camera.toScreen(bounds.minX, worldY);
      const [screenX2] = camera.toScreen(bounds.maxX, worldY);
      
      ctx.moveTo(screenX1, screenY);
      ctx.lineTo(screenX2, screenY);
    }
    
    ctx.stroke();
  }
  
  /**
   * Get adaptive grid size based on zoom level
   * This prevents grid from becoming too dense or too sparse
   */
  private getAdaptiveGridSize(zoom: number, baseSize: number): number {
    // At zoom < 0.5, use larger grid (2x, 4x, 8x base size)
    // At zoom > 2.0, use smaller grid (0.5x, 0.25x base size)
    
    if (zoom < 0.25) {
      return baseSize * 8;
    } else if (zoom < 0.5) {
      return baseSize * 4;
    } else if (zoom < 1.0) {
      return baseSize * 2;
    } else if (zoom > 4.0) {
      return baseSize * 0.25;
    } else if (zoom > 2.0) {
      return baseSize * 0.5;
    }
    
    return baseSize;
  }
  
  /**
   * Snap a world coordinate to grid
   */
  snapToGrid(worldX: number, worldY: number): [number, number] {
    const gridSize = this.config.size;
    const snappedX = Math.round(worldX / gridSize) * gridSize;
    const snappedY = Math.round(worldY / gridSize) * gridSize;
    return [snappedX, snappedY];
  }
  
  /**
   * Enable/disable grid
   */
  setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
  }
  
  /**
   * Get grid configuration
   */
  getConfig(): GridConfig {
    return { ...this.config };
  }
}
