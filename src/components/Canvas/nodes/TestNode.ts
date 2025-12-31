/**
 * Test Node
 * Simple node for testing Phase 2 functionality
 * 
 * This is a basic node that demonstrates:
 * - Input/output ports
 * - Basic execution
 * - Visual representation
 */

import { BaseNode } from './BaseNode.js';
import type { ExecutionContext, ExecutionResult, UUID } from '../types/index.js';

export class TestNode extends BaseNode {
  constructor(id: UUID, x: number, y: number) {
    super(id, 'test', x, y, 200, 150, 'Test Node');
    
    // Add ports
    this.addInputPort('input1', 'string', 'Input 1', false);
    this.addInputPort('input2', 'number', 'Input 2', false);
    this.addOutputPort('output', 'string', 'Output');
    
    // Set color
    this.color = '#3b82f6'; // Blue
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
