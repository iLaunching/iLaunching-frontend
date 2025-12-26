/**
 * Camera System
 * Manages viewport transformations between world space and screen space
 * Handles zoom-to-cursor and smooth panning with production-ready validation
 * 
 * @example
 * ```typescript
 * const camera = new Camera({ x: 0, y: 0, zoom: 1.0 });
 * camera.setCanvasSize(800, 600);
 * const [screenX, screenY] = camera.toScreen(100, 100);
 * ```
 */

import type { CameraState, Point } from '../types/index.js';
import { validateCameraState } from '../utils/validation.js';

export class Camera {
  // Camera position in world space
  public x: number = 0;
  public y: number = 0;
  
  // Zoom level (1.0 = 100%)
  public zoom: number = 1.0;
  
  // Zoom constraints
  public minZoom: number = 0.1;
  public maxZoom: number = 3.0;
  
  // Canvas dimensions (screen space)
  private canvasWidth: number = 0;
  private canvasHeight: number = 0;
  
  constructor(initialState?: Partial<CameraState>) {
    if (initialState) {
      // Validate initial state
      validateCameraState(initialState);
      
      this.x = initialState.x ?? 0;
      this.y = initialState.y ?? 0;
      this.zoom = initialState.zoom ?? 1.0;
      this.minZoom = initialState.minZoom ?? 0.1;
      this.maxZoom = initialState.maxZoom ?? 3.0;
    }
  }
  
  /**
   * Set canvas dimensions (call on resize)
   * @param width - Canvas width in pixels
   * @param height - Canvas height in pixels
   * @throws {Error} If dimensions are invalid
   */
  setCanvasSize(width: number, height: number): void {
    if (!Number.isFinite(width) || width <= 0) {
      throw new Error(`Invalid canvas width: ${width}`);
    }
    if (!Number.isFinite(height) || height <= 0) {
      throw new Error(`Invalid canvas height: ${height}`);
    }
    
    this.canvasWidth = width;
    this.canvasHeight = height;
  }
  
  /**
   * Convert world coordinates to screen coordinates
   * Formula: ScreenX = (WorldX * Zoom) + OffsetX
   */
  toScreen(worldX: number, worldY: number): [number, number] {
    const screenX = (worldX - this.x) * this.zoom + this.canvasWidth / 2;
    const screenY = (worldY - this.y) * this.zoom + this.canvasHeight / 2;
    return [screenX, screenY];
  }
  
  /**
   * Convert screen coordinates to world coordinates
   * Formula: WorldX = (ScreenX - OffsetX) / Zoom
   */
  toWorld(screenX: number, screenY: number): [number, number] {
    const worldX = (screenX - this.canvasWidth / 2) / this.zoom + this.x;
    const worldY = (screenY - this.canvasHeight / 2) / this.zoom + this.y;
    return [worldX, worldY];
  }
  
  /**
   * Zoom towards a specific point on screen (typically cursor position)
   * This creates the "zoom into cursor" effect like Make.com
   */
  zoomToPoint(delta: number, screenX: number, screenY: number): void {
    // Calculate zoom factor (positive delta = zoom in, negative = zoom out)
    const zoomFactor = delta > 0 ? 1.1 : 0.9;
    const newZoom = this.zoom * zoomFactor;
    
    // Clamp zoom to min/max
    if (newZoom < this.minZoom || newZoom > this.maxZoom) {
      return;
    }
    
    // Get world coordinate under cursor BEFORE zoom
    const [worldX, worldY] = this.toWorld(screenX, screenY);
    
    // Apply zoom
    this.zoom = newZoom;
    
    // Get world coordinate under cursor AFTER zoom
    const [newWorldX, newWorldY] = this.toWorld(screenX, screenY);
    
    // Adjust camera position so the point under cursor stays the same
    this.x += (worldX - newWorldX);
    this.y += (worldY - newWorldY);
  }
  
  /**
   * Pan the camera by delta pixels in screen space
   */
  pan(deltaX: number, deltaY: number): void {
    // Convert screen space delta to world space delta
    this.x -= deltaX / this.zoom;
    this.y -= deltaY / this.zoom;
  }
  
  /**
   * Set camera position in world space
   */
  setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }
  
  /**
   * Set zoom level (clamped to min/max)
   */
  setZoom(zoom: number): void {
    this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoom));
  }
  
  /**
   * Center camera on a specific world point
   */
  centerOn(worldX: number, worldY: number): void {
    this.x = worldX;
    this.y = worldY;
  }
  
  /**
   * Get the visible world bounds (viewport in world space)
   */
  getViewportBounds(): { minX: number; minY: number; maxX: number; maxY: number } {
    const [minX, minY] = this.toWorld(0, 0);
    const [maxX, maxY] = this.toWorld(this.canvasWidth, this.canvasHeight);
    
    return { minX, minY, maxX, maxY };
  }
  
  /**
   * Check if a point in world space is visible on screen
   */
  isPointVisible(worldX: number, worldY: number, padding: number = 0): boolean {
    const bounds = this.getViewportBounds();
    return (
      worldX >= bounds.minX - padding &&
      worldX <= bounds.maxX + padding &&
      worldY >= bounds.minY - padding &&
      worldY <= bounds.maxY + padding
    );
  }
  
  /**
   * Check if a rectangle in world space is visible on screen
   */
  isRectVisible(x: number, y: number, width: number, height: number): boolean {
    const bounds = this.getViewportBounds();
    
    return !(
      x + width < bounds.minX ||
      x > bounds.maxX ||
      y + height < bounds.minY ||
      y > bounds.maxY
    );
  }
  
  /**
   * Smoothly animate camera to target position and zoom
   */
  animateTo(
    targetX: number,
    targetY: number,
    targetZoom: number,
    duration: number = 300
  ): Promise<void> {
    return new Promise((resolve) => {
      const startX = this.x;
      const startY = this.y;
      const startZoom = this.zoom;
      const startTime = performance.now();
      
      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function (ease-in-out)
        const eased = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        
        // Interpolate values
        this.x = startX + (targetX - startX) * eased;
        this.y = startY + (targetY - startY) * eased;
        this.zoom = startZoom + (targetZoom - startZoom) * eased;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      requestAnimationFrame(animate);
    });
  }
  
  /**
   * Fit all nodes in viewport
   */
  fitBounds(
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
    padding: number = 50
  ): void {
    const boundsWidth = maxX - minX;
    const boundsHeight = maxY - minY;
    
    // Calculate zoom to fit
    const zoomX = (this.canvasWidth - padding * 2) / boundsWidth;
    const zoomY = (this.canvasHeight - padding * 2) / boundsHeight;
    const newZoom = Math.min(zoomX, zoomY, this.maxZoom);
    
    // Center on bounds
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    
    this.zoom = newZoom;
    this.x = centerX;
    this.y = centerY;
  }
  
  /**
   * Reset camera to default state
   */
  reset(): void {
    this.x = 0;
    this.y = 0;
    this.zoom = 1.0;
  }
  
  /**
   * Get current camera state (for serialization)
   */
  getState(): CameraState {
    return {
      x: this.x,
      y: this.y,
      zoom: this.zoom,
      minZoom: this.minZoom,
      maxZoom: this.maxZoom
    };
  }
  
  /**
   * Restore camera from state
   */
  setState(state: CameraState): void {
    this.x = state.x;
    this.y = state.y;
    this.zoom = state.zoom;
    this.minZoom = state.minZoom;
    this.maxZoom = state.maxZoom;
  }
}
