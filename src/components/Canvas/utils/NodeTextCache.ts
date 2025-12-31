/**
 * Node Text Cache System
 * Pre-renders node text at high resolution (2x-3x DPR) to offscreen canvases
 * Then stamps these "high-res stickers" onto the main canvas for crisp text
 * 
 * Benefits:
 * - Ultra-crisp text on all displays (Retina, 4K, etc.)
 * - No DOM overlay jitter during zoom/pan
 * - GPU-accelerated blitting via ctx.drawImage()
 * - Cached for performance (only re-render when text/style changes)
 * 
 * @example
 * ```typescript
 * const cache = new NodeTextCache();
 * const canvas = cache.getOrCreateTextCanvas('Smart Matrix', '16px Work Sans', 200);
 * ctx.drawImage(canvas, x - canvas.width / 2, y);
 * ```
 */

interface TextCacheKey {
  text: string;
  font: string;
  maxWidth: number;
  color: string;
  dpr: number;
}

interface CachedTextCanvas {
  canvas: OffscreenCanvas;
  width: number;
  height: number;
  lastUsed: number;
}

export class NodeTextCache {
  private cache: Map<string, CachedTextCanvas> = new Map();
  private maxCacheSize: number = 100;
  private textScale: number = 2; // Render text at 2x resolution for crispness
  
  constructor(maxCacheSize: number = 100, textScale: number = 2) {
    this.maxCacheSize = maxCacheSize;
    this.textScale = textScale;
  }
  
  /**
   * Generate cache key from text parameters
   */
  private getCacheKey(params: TextCacheKey): string {
    return `${params.text}|${params.font}|${params.maxWidth}|${params.color}|${params.dpr}`;
  }
  
  /**
   * Get or create high-resolution text canvas
   * Text is rendered at textScale * DPR for maximum crispness
   */
  public getOrCreateTextCanvas(
    text: string,
    font: string,
    maxWidth: number,
    color: string = '#1f2937',
    dpr: number = 1
  ): HTMLCanvasElement {
    const cacheKey = this.getCacheKey({ text, font, maxWidth, color, dpr });
    
    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached) {
      cached.lastUsed = Date.now();
      // Convert OffscreenCanvas to HTMLCanvasElement for compatibility
      return this.offscreenToCanvas(cached.canvas);
    }
    
    // Create new high-resolution text canvas
    const textCanvas = this.createHighResTextCanvas(text, font, maxWidth, color, dpr);
    
    // Store in cache
    this.cache.set(cacheKey, {
      canvas: textCanvas.offscreen,
      width: textCanvas.width,
      height: textCanvas.height,
      lastUsed: Date.now()
    });
    
    // Prune cache if needed
    this.pruneCache();
    
    return textCanvas.canvas;
  }
  
  /**
   * Create high-resolution text canvas at 2x-3x resolution
   * This is the SECRET to ultra-crisp text rendering
   * Uses SYNCHRONOUS rendering to avoid timing issues
   */
  private createHighResTextCanvas(
    text: string,
    font: string,
    maxWidth: number,
    color: string,
    dpr: number
  ): { canvas: HTMLCanvasElement; offscreen: OffscreenCanvas; width: number; height: number } {
    // Render at textScale * DPR resolution (e.g., 2x * 2x = 4x on Retina)
    const renderScale = this.textScale * dpr;
    
    // Create temporary context to measure text
    const measureCanvas = document.createElement('canvas');
    const measureCtx = measureCanvas.getContext('2d')!;
    measureCtx.font = font;
    const metrics = measureCtx.measureText(text);
    
    // Calculate dimensions (add padding for quality)
    const textWidth = Math.ceil(metrics.width);
    const textHeight = Math.ceil(
      metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent + 4
    );
    
    // Create high-res regular canvas (not offscreen for immediate availability)
    const canvas = document.createElement('canvas');
    canvas.width = Math.ceil(textWidth * renderScale);
    canvas.height = Math.ceil(textHeight * renderScale);
    
    const ctx = canvas.getContext('2d', {
      alpha: true,
      desynchronized: false  // Synchronous for immediate rendering
    })!;
    
    // Scale context to high resolution
    ctx.scale(renderScale, renderScale);
    
    // Configure for maximum text quality
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.font = font;
    ctx.fillStyle = color;
    
    // Enable high-quality text rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Render text at high resolution SYNCHRONOUSLY
    ctx.fillText(text, 0, 0, maxWidth);
    
    // Create offscreen version for cache storage
    const offscreen = new OffscreenCanvas(canvas.width, canvas.height);
    const offscreenCtx = offscreen.getContext('2d')!;
    offscreenCtx.drawImage(canvas, 0, 0);
    
    return {
      canvas,
      offscreen,
      width: textWidth,
      height: textHeight
    };
  }
  
  /**
   * Convert OffscreenCanvas to HTMLCanvasElement
   * Required for compatibility with main canvas ctx.drawImage()
   */
  private offscreenToCanvas(offscreen: OffscreenCanvas): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.width = offscreen.width;
    canvas.height = offscreen.height;
    
    const ctx = canvas.getContext('2d')!;
    
    // Use synchronous transfer for immediate availability
    const imageData = offscreen.getContext('2d')!.getImageData(
      0, 0, offscreen.width, offscreen.height
    );
    ctx.putImageData(imageData, 0, 0);
    
    return canvas;
  }
  
  /**
   * Prune cache to prevent memory bloat
   * Removes least recently used entries
   */
  private pruneCache(): void {
    if (this.cache.size <= this.maxCacheSize) {
      return;
    }
    
    // Sort by last used time
    const entries = Array.from(this.cache.entries())
      .sort((a, b) => a[1].lastUsed - b[1].lastUsed);
    
    // Remove oldest entries
    const toRemove = entries.slice(0, entries.length - this.maxCacheSize);
    toRemove.forEach(([key]) => this.cache.delete(key));
    
    console.log(`🧹 Text cache pruned: removed ${toRemove.length} entries`);
  }
  
  /**
   * Clear entire cache (useful for theme changes, etc.)
   */
  public clearCache(): void {
    this.cache.clear();
    console.log('🗑️ Text cache cleared');
  }
  
  /**
   * Get cache statistics for monitoring
   */
  public getCacheStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      hitRate: 0 // TODO: Track hits/misses if needed
    };
  }
}
