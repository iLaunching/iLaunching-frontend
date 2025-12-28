/**
 * Smart Matrix Node - Stage 1: Visual Design
 * Circular node with AI indicator and single output port
 */

import { BaseNode } from './BaseNode.js';
import type { UUID, ExecutionContext, ExecutionResult } from '../types/index.js';

export class SmartMatrixNode extends BaseNode {
  public backgroundColor: string = '#ffffff'; // Default white, will be set from appearance
  
  constructor(id: UUID, x: number, y: number, backgroundColor?: string) {
    super(id, 'smart-matrix', x, y, 250, 250, 'Smart Matrix');
    
    // Single output port on right center for now
    this.addOutputPort('output', 'any', 'Output');
    
    // Set color (will be dynamic later)
    this.color = '#8b5cf6'; // Purple default
    
    // Set background color from user appearance
    if (backgroundColor) {
      this.backgroundColor = backgroundColor;
    }
  }
  
  /**
   * Override containsPoint for circular hit detection
   */
  public containsPoint(worldX: number, worldY: number): boolean {
    // Calculate center of the circular node
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    const radius = 110; // Outer radius (220px / 2)
    
    // Distance from center
    const dx = worldX - centerX;
    const dy = worldY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Point is inside if distance is less than radius
    return distance <= radius;
  }
  
  /**
   * Execute - placeholder for now
   */
  async execute(
    inputs: Record<string, any>,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    const outputs = new Map<string, any>();
    outputs.set('output', 'Smart Matrix Output');
    
    return {
      success: true,
      outputs,
      duration: 0
    };
  }
}
