/**
 * Test Node with circular design
 * Similar to SmartMatrix but with input connector for testing connections
 */

import { BaseNode } from './BaseNode.js';
import type { ExecutionContext, ExecutionResult, UUID } from '../types/index.js';

export class TestNode extends BaseNode {
  public isPortHovered: boolean = false;
  public backgroundColor: string = '#1e293b'; // Dark slate background

  constructor(id: UUID, x: number, y: number) {
    // Circular node: 220x220 (same as SmartMatrix)
    super(id, 'test', x, y, 220, 220, 'Test Node');
    
    // Add single input port (left side, like SmartHub)
    this.addInputPort('input', 'any', 'Input');
    
    // Add output port (right side, for testing connections)
    this.addOutputPort('output', 'any', 'Output');
    
    // Set color for UI elements
    this.color = '#10b981'; // Green to distinguish from SmartMatrix
  }

  /**
   * Override containsPoint for circular hit detection
   * Allows dragging the circular node
   */
  public containsPoint(worldX: number, worldY: number): boolean {
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    const radius = 85; // Main circle radius (maskRadius)
    
    const dx = worldX - centerX;
    const dy = worldY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    return distance <= radius;
  }

  /**
   * Get port position for circular node
   * Ports rotate around circle to point toward target
   */
  public getPortPosition(portId: string, targetNode?: BaseNode): { x: number; y: number } | undefined {
    const port = this.getPort(portId);
    if (!port) return undefined;
    
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    const maskRadius = 85; // Must match renderer
    
    // Calculate angle to target node
    let angle: number;
    if (targetNode) {
      const targetCenterX = targetNode.x + targetNode.width / 2;
      const targetCenterY = targetNode.y + targetNode.height / 2;
      angle = Math.atan2(targetCenterY - centerY, targetCenterX - centerX);
    } else {
      // Default angles when no target
      angle = port.type === 'input' ? Math.PI : 0; // Left for input, right for output
    }
    
    // Position port at calculated angle on circle edge
    return {
      x: centerX + maskRadius * Math.cos(angle),
      y: centerY + maskRadius * Math.sin(angle)
    };
  }
  
  /**
   * Check if a point is within the port area (circular ring)
   */
  public containsPortPoint(worldX: number, worldY: number): boolean {
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.height / 2;
    const maskRadius = 85;
    
    const dx = worldX - centerX;
    const dy = worldY - centerY;
    const distanceFromCenter = Math.sqrt(dx * dx + dy * dy);
    
    const portSize = 40;
    const innerRadius = maskRadius - portSize / 2;
    const outerRadius = maskRadius + portSize / 2;
    
    return distanceFromCenter >= innerRadius && distanceFromCenter <= outerRadius;
  }
  
  /**
   * Execute the node logic
   */
  async execute(
    inputs: Record<string, any>,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    
    // Simple test logic: concatenate inputs
    const input1 = inputs.input1 || '';
    const input2 = inputs.input2 || 0;
    
    const output = `${input1} ${input2}`;
    
    const outputs = new Map<string, any>();
    outputs.set('output', output);
    
    return {
      success: true,
      outputs,
      duration: Date.now() - startTime
    };
  }
  
  /**
   * Clone this node
   */
  clone(newId?: UUID): TestNode {
    const id = newId || `test-${Date.now()}` as UUID;
    return new TestNode(id, this.x + 50, this.y + 50);
  }
  
  /**
   * Get description
   */
  getDescription(): string {
    return 'A test node for Phase 2 development';
  }
}
