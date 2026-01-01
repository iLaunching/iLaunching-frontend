/**
 * Link Class
 * Represents a connection between two nodes with Bezier curve calculations
 * 
 * Features:
 * - Bezier curve path calculation
 * - Control point generation for smooth curves
 * - Hit detection for mouse interactions
 * - Path length calculation for animations
 * - Connection validation
 * 
 * @example
 * ```typescript
 * const link = new Link(linkData, sourceNode, targetNode);
 * const path = link.getBezierPath();
 * const isHit = link.containsPoint(x, y, threshold);
 * ```
 */

import type { BaseNode } from '../nodes/BaseNode.js';
import type { LinkData, Point, BezierControlPoints } from '../types/index.js';

/**
 * Configuration constants for Link behavior
 */
const LINK_CONFIG = {
  MIN_CONTROL_OFFSET: 50,
  MAX_CONTROL_OFFSET: 200,
  CONTROL_OFFSET_FACTOR: 0.4,
  DEFAULT_HIT_THRESHOLD: 8,
  PATH_SEGMENTS_RENDER: 50,
  PATH_SEGMENTS_HIT: 30,
  PATH_SEGMENTS_ANIMATION: 100
} as const;

export class Link {
  public readonly data: LinkData;
  public readonly sourceNode: BaseNode;
  public readonly targetNode: BaseNode;
  
  // Cached curve data (invalidated when nodes move)
  private cachedPath: Point[] | null = null;
  private cachedControlPoints: BezierControlPoints | null = null;
  private cachedLength: number | null = null;
  
  constructor(data: LinkData, sourceNode: BaseNode, targetNode: BaseNode) {
    this.data = data;
    this.sourceNode = sourceNode;
    this.targetNode = targetNode;
  }
  
  /**
   * Get source and target positions for the connection
   */
  public getEndpoints(): { start: Point; end: Point } {
    try {
      const sourcePort = this.sourceNode.getPort(this.data.fromPortId);
      const targetPort = this.targetNode.getPort(this.data.toPortId);
      
      if (!sourcePort || !targetPort) {
        // Fallback to node centers if ports not found
        console.warn(`Port not found for link ${this.data.id}`);
        return this.getNodeCenterPoints();
      }
      
      // Pass target node to source port position (for dynamic circular positioning)
      const startPos = this.sourceNode.getPortPosition(this.data.fromPortId, this.targetNode);
      // Pass source node to target port position (for dynamic circular positioning)
      const endPos = this.targetNode.getPortPosition(this.data.toPortId, this.sourceNode);
      
      return {
        start: startPos || this.getNodeCenter(this.sourceNode),
        end: endPos || this.getNodeCenter(this.targetNode)
      };
    } catch (error) {
      console.error(`Error getting endpoints for link ${this.data.id}:`, error);
      return this.getNodeCenterPoints();
    }
  }
  
  /**
   * Get center point of a node
   */
  private getNodeCenter(node: BaseNode): Point {
    return { 
      x: node.x + node.width / 2, 
      y: node.y + node.height / 2 
    };
  }
  
  /**
   * Get both node center points
   */
  private getNodeCenterPoints(): { start: Point; end: Point } {
    return {
      start: this.getNodeCenter(this.sourceNode),
      end: this.getNodeCenter(this.targetNode)
    };
  }
  
  /**
   * Calculate Bezier control points for smooth curve
   * Uses horizontal tangents for natural flow
   */
  public getControlPoints(): BezierControlPoints {
    if (this.cachedControlPoints) {
      return this.cachedControlPoints;
    }
    
    const { start, end } = this.getEndpoints();
    
    // Calculate horizontal offset based on distance
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Control point offset (configurable min/max)
    const offset = Math.min(
      Math.max(
        distance * LINK_CONFIG.CONTROL_OFFSET_FACTOR, 
        LINK_CONFIG.MIN_CONTROL_OFFSET
      ), 
      LINK_CONFIG.MAX_CONTROL_OFFSET
    );
    
    // First control point: to the right of start
    const cp1: Point = {
      x: start.x + offset,
      y: start.y
    };
    
    // Second control point: to the left of end
    const cp2: Point = {
      x: end.x - offset,
      y: end.y
    };
    
    this.cachedControlPoints = { cp1, cp2 };
    return this.cachedControlPoints;
  }
  
  /**
   * Get Bezier curve path as array of points (for rendering or hit detection)
   * @param segments Number of segments (higher = smoother but slower)
   */
  public getBezierPath(segments: number = LINK_CONFIG.PATH_SEGMENTS_RENDER): Point[] {
    const { start, end } = this.getEndpoints();
    const { cp1, cp2 } = this.getControlPoints();
    
    const points: Point[] = [];
    
    for (let i = 0; i <= segments; i++) {
      const t = i / segments;
      const point = this.cubicBezier(start, cp1, cp2, end, t);
      points.push(point);
    }
    
    return points;
  }
  
  /**
   * Calculate point on cubic Bezier curve
   * B(t) = (1-t)³P₀ + 3(1-t)²tP₁ + 3(1-t)t²P₂ + t³P₃
   */
  private cubicBezier(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
    const t2 = t * t;
    const t3 = t2 * t;
    const mt = 1 - t;
    const mt2 = mt * mt;
    const mt3 = mt2 * mt;
    
    return {
      x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
      y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y
    };
  }
  
  /**
   * Check if a point is near the link (for mouse hit detection)
   * @param x World X coordinate
   * @param y World Y coordinate
   * @param threshold Distance threshold in pixels
   */
  public containsPoint(
    x: number, 
    y: number, 
    threshold: number = LINK_CONFIG.DEFAULT_HIT_THRESHOLD
  ): boolean {
    try {
      const path = this.getBezierPath(LINK_CONFIG.PATH_SEGMENTS_HIT); // Optimized segment count
    
      // Safety check for empty or insufficient path
      if (!path || path.length < 2) {
        return false;
      }
    
      // Check distance to each line segment
      for (let i = 0; i < path.length - 1; i++) {
        const p1 = path[i];
        const p2 = path[i + 1];
        
        const distance = this.pointToSegmentDistance(x, y, p1.x, p1.y, p2.x, p2.y);
        
        if (distance <= threshold) {
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error(`Error in containsPoint for link ${this.data.id}:`, error);
      return false;
    }
  }
  
  /**
   * Calculate distance from point to line segment
   */
  private pointToSegmentDistance(
    px: number, py: number,
    x1: number, y1: number,
    x2: number, y2: number
  ): number {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const lengthSquared = dx * dx + dy * dy;
    
    if (lengthSquared === 0) {
      // Segment is a point
      const dpx = px - x1;
      const dpy = py - y1;
      return Math.sqrt(dpx * dpx + dpy * dpy);
    }
    
    // Project point onto line segment
    let t = ((px - x1) * dx + (py - y1) * dy) / lengthSquared;
    t = Math.max(0, Math.min(1, t));
    
    const projX = x1 + t * dx;
    const projY = y1 + t * dy;
    
    const dpx = px - projX;
    const dpy = py - projY;
    
    return Math.sqrt(dpx * dpx + dpy * dpy);
  }
  
  /**
   * Calculate approximate path length (for animation timing)
   */
  public getPathLength(): number {
    if (this.cachedLength !== null) {
      return this.cachedLength;
    }
    
    const path = this.getBezierPath(50);
    
    // Safety check for empty or single-point path
    if (!path || path.length < 2) {
      this.cachedLength = 0;
      return 0;
    }
    
    let length = 0;
    
    for (let i = 1; i < path.length; i++) {
      const dx = path[i].x - path[i - 1].x;
      const dy = path[i].y - path[i - 1].y;
      length += Math.sqrt(dx * dx + dy * dy);
    }
    
    this.cachedLength = length;
    return length;
  }
  
  /**
   * Get point at specific distance along path (for animations)
   * @param distance Distance along path (0 to getPathLength())
   */
  public getPointAtDistance(distance: number): Point | null {
    try {
      const path = this.getBezierPath(LINK_CONFIG.PATH_SEGMENTS_ANIMATION);
      
      // Safety check for empty path
      if (!path || path.length === 0) {
        return null;
      }
      
      // If only one point, return it
      if (path.length === 1) {
        return path[0];
      }
      
      let accumulated = 0;
      
      for (let i = 1; i < path.length; i++) {
        const dx = path[i].x - path[i - 1].x;
        const dy = path[i].y - path[i - 1].y;
        const segmentLength = Math.sqrt(dx * dx + dy * dy);
        
        if (accumulated + segmentLength >= distance) {
          // Interpolate along this segment
          const t = (distance - accumulated) / segmentLength;
          return {
            x: path[i - 1].x + t * dx,
            y: path[i - 1].y + t * dy
          };
        }
        
        accumulated += segmentLength;
      }
      
      // Return end point if distance exceeds path length
      return path[path.length - 1];
    } catch (error) {
      console.error(`Error in getPointAtDistance for link ${this.data.id}:`, error);
      return null;
    }
  }
  
  /**
   * Invalidate cached values (call when nodes move)
   */
  public invalidateCache(): void {
    this.cachedPath = null;
    this.cachedControlPoints = null;
    this.cachedLength = null;
  }
  
  /**
   * Update source node reference
   */
  public setSourceNode(node: BaseNode): void {
    this.sourceNode = node;
    this.invalidateCache();
  }
  
  /**
   * Update target node reference
   */
  public setTargetNode(node: BaseNode): void {
    this.targetNode = node;
    this.invalidateCache();
  }
  
  /**
   * Get source node
   */
  public getSourceNode(): BaseNode {
    return this.sourceNode;
  }
  
  /**
   * Get target node
   */
  public getTargetNode(): BaseNode {
    return this.targetNode;
  }
  
  /**
   * Check if link is valid (nodes and ports exist)
   */
  public isValid(): boolean {
    const sourcePort = this.sourceNode.getPort(this.data.fromPortId);
    const targetPort = this.targetNode.getPort(this.data.toPortId);
    return sourcePort !== undefined && targetPort !== undefined;
  }
}
