/**
 * Smart Matrix Node - Stage 1: Visual Design
 * Circular node with AI indicator and single output port
 */

import { BaseNode } from './BaseNode.js';
import type { UUID, ExecutionContext, ExecutionResult } from '../types/index.js';

export class SmartMatrixNode extends BaseNode {
  public backgroundColor: string = '#ffffff'; // Default white, will be set from appearance
  public textColor: string = '#1f2937'; // Default dark gray, will be set from appearance
  public solidColor: string = '#7F77F1'; // Default solid color from itheme
  public isPortHovered: boolean = false; // Track port hover state
  public matrixName: string = 'Smart Matrix'; // Display name from database
  
  constructor(id: UUID, x: number, y: number, backgroundColor?: string, textColor?: string, solidColor?: string, matrixName?: string) {
    super(id, 'smart-matrix', x, y, 250, 250, matrixName || 'Smart Matrix');
    
    // Single output port on right center for now
    this.addOutputPort('output', 'any', 'Output');
    
    // Set color (will be dynamic later)
    this.color = '#8b5cf6'; // Purple default
    
    // Set background color from user appearance
    if (backgroundColor) {
      this.backgroundColor = backgroundColor;
    }
    
    // Set text color from user appearance
    if (textColor) {
      this.textColor = textColor;
    }
    
    // Set solid color from user itheme
    if (solidColor) {
      this.solidColor = solidColor;
    }
    
    // Set matrix name from database
    if (matrixName) {
      this.matrixName = matrixName;
    }
  }
  
  /**
   * Override containsPoint for circular hit detection
   * Only triggers on Layer 4 (main gradient circle)
   */
  public containsPoint(worldX: number, worldY: number): boolean {
    // Calculate center of the circular node
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    const radius = 75; // Layer 4 radius (aiRadius - 150px diameter / 2)
    
    // Distance from center
    const dx = worldX - centerX;
    const dy = worldY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Point is inside if distance is less than radius
    return distance <= radius;
  }
  
  /**
   * Check if a world coordinate point is over the output port
   */
  public containsPortPoint(worldX: number, worldY: number): boolean {
    // Calculate center of the circular node
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    const maskRadius = 85; // Must match renderer
    
    // Port position (right center, at mask edge)
    const portX = centerX + maskRadius;
    const portY = centerY;
    const portSize = 40; // Must match renderer
    const hitRadius = (portSize / 2) * 1.5; // Slightly larger hit area
    
    // Distance from port center
    const dx = worldX - portX;
    const dy = worldY - portY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance <= hitRadius;
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
