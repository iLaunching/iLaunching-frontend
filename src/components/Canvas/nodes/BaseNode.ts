/**
 * BaseNode Abstract Class
 * Foundation for all node types in the Smart Matrix automation builder
 * 
 * Features:
 * - Input/output port management
 * - Position and size tracking
 * - Hit detection for mouse interactions
 * - Serialization for save/load
 * - Execution lifecycle hooks
 * - Validation logic
 * 
 * @abstract
 * @example
 * ```typescript
 * class MyNode extends BaseNode {
 *   constructor(id: string, x: number, y: number) {
 *     super(id, 'MyNode', x, y, 200, 150);
 *     this.addInputPort('input', 'string');
 *     this.addOutputPort('output', 'string');
 *   }
 *   
 *   async execute(inputs: Record<string, any>): Promise<Record<string, any>> {
 *     return { output: inputs.input };
 *   }
 * }
 * ```
 */

import type { NodeData, NodePort, NodeStatus, NodeType, PortType, DataType, UUID, ExecutionContext, ExecutionResult } from '../types/index.js';

export abstract class BaseNode {
  // Identity
  public readonly id: UUID;
  public readonly type: NodeType;
  
  // Visual properties
  public x: number;
  public y: number;
  public width: number;
  public height: number;
  public color: string = '#3b82f6'; // Default blue
  
  // Label
  public label: string;
  
  // Ports
  protected inputPorts: Map<string, NodePort> = new Map();
  protected outputPorts: Map<string, NodePort> = new Map();
  
  // State
  public status: NodeStatus = 'idle';
  public isSelected: boolean = false;
  public isHovered: boolean = false;
  public errorMessage?: string;
  
  // Execution
  protected executionCount: number = 0;
  protected lastExecutionTime?: number;
  
  // Metadata
  public readonly createdAt: number;
  public updatedAt: number;
  public metadata: Record<string, any> = {};
  
  constructor(
    id: UUID,
    type: NodeType,
    x: number,
    y: number,
    width: number = 200,
    height: number = 150,
    label?: string
  ) {
    this.id = id;
    this.type = type;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.label = label || type;
    this.createdAt = Date.now();
    this.updatedAt = Date.now();
  }
  
  // ============================================================================
  // PORT MANAGEMENT
  // ============================================================================
  
  /**
   * Add an input port to the node
   */
  protected addInputPort(
    id: string,
    dataType: DataType,
    label?: string,
    required: boolean = false
  ): void {
    this.inputPorts.set(id, {
      id,
      type: 'input',
      dataType,
      label: label || id,
      position: { x: 0, y: 0 }, // Will be calculated by NodeRenderer
      connected: false,
      required
    });
    this.updatedAt = Date.now();
  }
  
  /**
   * Add an output port to the node
   */
  protected addOutputPort(
    id: string,
    dataType: DataType,
    label?: string
  ): void {
    this.outputPorts.set(id, {
      id,
      type: 'output',
      dataType,
      label: label || id,
      position: { x: 0, y: 0 }, // Will be calculated by NodeRenderer
      connected: false,
      required: false
    });
    this.updatedAt = Date.now();
  }
  
  /**
   * Get all input ports
   */
  public getInputPorts(): NodePort[] {
    return Array.from(this.inputPorts.values());
  }
  
  /**
   * Get all output ports
   */
  public getOutputPorts(): NodePort[] {
    return Array.from(this.outputPorts.values());
  }
  
  /**
   * Get all ports (inputs + outputs)
   */
  public getAllPorts(): NodePort[] {
    return [...this.getInputPorts(), ...this.getOutputPorts()];
  }
  
  /**
   * Get a specific port by ID
   */
  public getPort(portId: string): NodePort | undefined {
    return this.inputPorts.get(portId) || this.outputPorts.get(portId);
  }
  
  /**
   * Update port connection status
   */
  public setPortConnected(portId: string, connected: boolean): void {
    const port = this.getPort(portId);
    if (port) {
      port.connected = connected;
      this.updatedAt = Date.now();
    }
  }
  
  // ============================================================================
  // HIT DETECTION
  // ============================================================================
  
  /**
   * Check if a point (in world coordinates) is inside this node
   */
  public containsPoint(worldX: number, worldY: number): boolean {
    return (
      worldX >= this.x &&
      worldX <= this.x + this.width &&
      worldY >= this.y &&
      worldY <= this.y + this.height
    );
  }
  
  /**
   * Check if a point is over a specific port
   * Returns the port ID if hit, undefined otherwise
   */
  public getPortAtPoint(worldX: number, worldY: number): NodePort | undefined {
    const portRadius = 8; // Port visual radius
    const portPadding = 20; // Spacing between ports
    
    // Check input ports (left side)
    const inputPorts = this.getInputPorts();
    const inputSpacing = this.height / (inputPorts.length + 1);
    inputPorts.forEach((port, index) => {
      const portX = this.x;
      const portY = this.y + inputSpacing * (index + 1);
      const distance = Math.sqrt(
        Math.pow(worldX - portX, 2) + Math.pow(worldY - portY, 2)
      );
      if (distance <= portRadius) {
        return port;
      }
    });
    
    // Check output ports (right side)
    const outputPorts = this.getOutputPorts();
    const outputSpacing = this.height / (outputPorts.length + 1);
    outputPorts.forEach((port, index) => {
      const portX = this.x + this.width;
      const portY = this.y + outputSpacing * (index + 1);
      const distance = Math.sqrt(
        Math.pow(worldX - portX, 2) + Math.pow(worldY - portY, 2)
      );
      if (distance <= portRadius) {
        return port;
      }
    });
    
    return undefined;
  }
  
  /**
   * Get the world position of a port's center
   * @param portId - The ID of the port
   * @param targetNode - Optional target node for dynamic positioning (used by circular nodes)
   */
  public getPortPosition(portId: string, targetNode?: BaseNode): { x: number; y: number } | undefined {
    const port = this.getPort(portId);
    if (!port) return undefined;
    
    const ports = port.type === 'input' ? this.getInputPorts() : this.getOutputPorts();
    const index = ports.findIndex(p => p.id === portId);
    if (index === -1) return undefined;
    
    const spacing = this.height / (ports.length + 1);
    const x = port.type === 'input' ? this.x : this.x + this.width;
    const y = this.y + spacing * (index + 1);
    
    return { x, y };
  }
  
  // ============================================================================
  // POSITION & BOUNDS
  // ============================================================================
  
  /**
   * Move the node to a new position
   */
  public setPosition(x: number, y: number): void {
    this.x = x;
    this.y = y;
    this.updatedAt = Date.now();
  }
  
  /**
   * Get the bounding box of the node
   */
  public getBounds(): { x: number; y: number; width: number; height: number } {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height
    };
  }
  
  /**
   * Get the center position of the node
   */
  public getCenter(): { x: number; y: number } {
    return {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2
    };
  }
  
  // ============================================================================
  // EXECUTION LIFECYCLE (Abstract)
  // ============================================================================
  
  /**
   * Execute the node's logic
   * Must be implemented by subclasses
   * 
   * @param inputs - Input data from connected nodes
   * @param context - Execution context (user info, settings, etc.)
   * @returns Output data to pass to connected nodes
   */
  abstract execute(
    inputs: Record<string, any>,
    context: ExecutionContext
  ): Promise<ExecutionResult>;
  
  /**
   * Validate the node's configuration and connections
   * Override to implement custom validation
   * 
   * @returns Array of error messages (empty if valid)
   */
  public validate(): string[] {
    const errors: string[] = [];
    
    // Check required input ports are connected
    this.getInputPorts().forEach(port => {
      if (port.required && !port.connected) {
        errors.push(`Required input port "${port.label}" is not connected`);
      }
    });
    
    return errors;
  }
  
  /**
   * Called before execution
   * Override to implement pre-execution logic
   */
  protected async onBeforeExecute(): Promise<void> {
    this.status = 'running';
    this.errorMessage = undefined;
  }
  
  /**
   * Called after successful execution
   * Override to implement post-execution logic
   */
  protected async onAfterExecute(result: ExecutionResult): Promise<void> {
    this.status = 'success';
    this.executionCount++;
    this.lastExecutionTime = Date.now();
  }
  
  /**
   * Called when execution fails
   * Override to implement error handling logic
   */
  protected async onExecutionError(error: Error): Promise<void> {
    this.status = 'error';
    this.errorMessage = error.message;
    console.error(`Node ${this.id} execution error:`, error);
  }
  
  /**
   * Execute with lifecycle hooks
   * Wraps the abstract execute() with before/after/error hooks
   */
  public async executeWithHooks(
    inputs: Record<string, any>,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    try {
      await this.onBeforeExecute();
      const result = await this.execute(inputs, context);
      await this.onAfterExecute(result);
      return result;
    } catch (error) {
      await this.onExecutionError(error as Error);
      throw error;
    }
  }
  
  // ============================================================================
  // SERIALIZATION
  // ============================================================================
  
  /**
   * Serialize node to JSON
   * Override to include custom data
   */
  public toJSON(): NodeData {
    return {
      id: this.id,
      type: this.type,
      label: this.label,
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      icon: '📦',
      color: this.color,
      status: this.status,
      config: this.metadata,
      inputPorts: this.getInputPorts(),
      outputPorts: this.getOutputPorts(),
      metadata: {
        createdAt: this.createdAt,
        updatedAt: this.updatedAt,
        executionCount: this.executionCount,
        lastExecutionTime: this.lastExecutionTime,
        error: this.errorMessage
      }
    };
  }
  
  /**
   * Restore node from JSON
   * Override to restore custom data
   */
  public static fromJSON(data: NodeData): BaseNode {
    throw new Error('fromJSON must be implemented by subclass');
  }
  
  // ============================================================================
  // UTILITY
  // ============================================================================
  
  /**
   * Clone this node (with new ID)
   */
  public clone(newId?: UUID): BaseNode {
    throw new Error('clone must be implemented by subclass');
  }
  
  /**
   * Get a description of what this node does
   * Override to provide custom descriptions
   */
  public getDescription(): string {
    return `${this.type} node`;
  }
  
  /**
   * Get execution statistics
   */
  public getStats(): {
    executionCount: number;
    lastExecutionTime?: number;
    status: NodeStatus;
  } {
    return {
      executionCount: this.executionCount,
      lastExecutionTime: this.lastExecutionTime,
      status: this.status
    };
  }
}
