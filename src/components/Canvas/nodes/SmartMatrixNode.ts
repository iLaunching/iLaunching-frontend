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
    const radius = 92; // Layer 4 radius (aiRadius - 184px diameter / 2)

    // Distance from center
    const dx = worldX - centerX;
    const dy = worldY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Point is inside if distance is less than radius
    return distance <= radius;
  }

  /**
   * Get port position for circular node
   * Output port rotates around circle to point toward target
   */
  public getPortPosition(portId: string, targetNode?: BaseNode): { x: number; y: number } | undefined {
    const port = this.getPort(portId);
    if (!port) return undefined;

    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    const maskRadius = 104; // Must match renderer

    // Calculate angle to target node
    let angle = 0; // Default: right (0 radians)
    if (targetNode) {
      const targetCenterX = targetNode.x + targetNode.width / 2;
      const targetCenterY = targetNode.y + targetNode.height / 2;
      angle = Math.atan2(targetCenterY - centerY, targetCenterX - centerX);
    }

    // Position port at calculated angle on circle edge
    return {
      x: centerX + maskRadius * Math.cos(angle),
      y: centerY + maskRadius * Math.sin(angle)
    };
  }

  public isPortHovered: boolean = false; // Legacy support
  public hoveredPortId: string | null = null; // Track specific port hover

  /**
   * Check if a world coordinate point is over a specific port
   * Returns the port ID if hit, null otherwise
   */
  public getHoveredPortId(worldX: number, worldY: number): string | null {
    // Calculate center of the circular node
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    const maskRadius = 104; // Must match renderer
    const portSize = 50; // Must match renderer (updated size)
    const hitRadius = (portSize / 2) * 1.2; // Hit area

    // 1. Check Output Port (Right Center: 0 rad)
    const outPortX = centerX + maskRadius;
    const outPortY = centerY;

    if (Math.hypot(worldX - outPortX, worldY - outPortY) <= hitRadius) {
      return 'output';
    }

    // 2. Check Input Port (Left Center: PI rad)
    const inPortX = centerX - maskRadius; // cos(PI) = -1
    const inPortY = centerY; // sin(PI) = 0

    if (Math.hypot(worldX - inPortX, worldY - inPortY) <= hitRadius) {
      return 'input';
    }

    return null;
  }

  /**
   * Check if a world coordinate point is over any port
   * (Kept for backward compatibility if needed)
   */
  public containsPortPoint(worldX: number, worldY: number): boolean {
    return this.getHoveredPortId(worldX, worldY) !== null;
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
