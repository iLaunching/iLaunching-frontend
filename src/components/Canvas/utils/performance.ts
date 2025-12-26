/**
 * Performance Monitoring Utilities
 * Production-ready performance tracking and optimization helpers
 */

/**
 * Performance metrics tracker
 */
export class PerformanceTracker {
  private samples: number[] = [];
  private maxSamples: number;
  private startTime: number = 0;

  constructor(maxSamples: number = 60) {
    this.maxSamples = maxSamples;
  }

  /**
   * Start timing a frame
   */
  start(): void {
    this.startTime = performance.now();
  }

  /**
   * End timing and record the frame time
   */
  end(): void {
    const endTime = performance.now();
    const frameTime = endTime - this.startTime;
    
    this.samples.push(frameTime);
    
    // Keep only the most recent samples
    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }
  }

  /**
   * Get average frame time
   */
  getAverage(): number {
    if (this.samples.length === 0) return 0;
    const sum = this.samples.reduce((a, b) => a + b, 0);
    return sum / this.samples.length;
  }

  /**
   * Get minimum frame time
   */
  getMin(): number {
    if (this.samples.length === 0) return 0;
    return Math.min(...this.samples);
  }

  /**
   * Get maximum frame time
   */
  getMax(): number {
    if (this.samples.length === 0) return 0;
    return Math.max(...this.samples);
  }

  /**
   * Get FPS from average frame time
   */
  getFPS(): number {
    const avg = this.getAverage();
    return avg > 0 ? 1000 / avg : 0;
  }

  /**
   * Reset all samples
   */
  reset(): void {
    this.samples = [];
  }

  /**
   * Get all samples
   */
  getSamples(): readonly number[] {
    return this.samples;
  }
}

/**
 * Debounce function for event handlers
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout !== null) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function for event handlers
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false;
  let lastResult: ReturnType<T>;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      inThrottle = true;
      lastResult = func(...args);
      
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
    
    return lastResult;
  };
}

/**
 * Request idle callback with fallback
 */
export const requestIdleCallback =
  typeof window !== 'undefined' && 'requestIdleCallback' in window
    ? window.requestIdleCallback
    : (callback: IdleRequestCallback): number => {
        const start = Date.now();
        return setTimeout(() => {
          callback({
            didTimeout: false,
            timeRemaining: () => Math.max(0, 50 - (Date.now() - start))
          });
        }, 1) as unknown as number;
      };

/**
 * Cancel idle callback with fallback
 */
export const cancelIdleCallback =
  typeof window !== 'undefined' && 'cancelIdleCallback' in window
    ? window.cancelIdleCallback
    : (id: number): void => {
        clearTimeout(id);
      };
