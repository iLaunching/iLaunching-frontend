/**
 * Smart Router Node - Dynamic routing with multiple outputs
 * Circular node with AI indicator and dynamic input/output ports
 */

import { BaseNode } from './BaseNode.js';
import type { UUID, ExecutionContext, ExecutionResult } from '../types/index.js';

export class SmartRouterNode extends BaseNode {
    public backgroundColor: string = '#ffffff'; // Default white, will be set from appearance
    public textColor: string = '#1f2937'; // Default dark gray, will be set from appearance
    public solidColor: string = '#f59e0b'; // Orange color for router
    public matrixName: string = 'Smart Router'; // Display name from database

    public isPortHovered: boolean = false; // Legacy support
    public hoveredPortId: string | null = null; // Track specific port hover

    constructor(id: UUID, x: number, y: number, backgroundColor?: string, textColor?: string, solidColor?: string, routerName?: string) {
        super(id, 'smart-router', x, y, 250, 250, routerName || 'Smart Router');

        // Add input port
        this.addInputPort('input', 'any', 'Input');

        // Add multiple output ports (from template: route-a, route-b, route-c, fallback)
        this.addOutputPort('route-a', 'any', 'Route A');
        this.addOutputPort('route-b', 'any', 'Route B');
        this.addOutputPort('route-c', 'any', 'Route C');
        this.addOutputPort('fallback', 'any', 'Fallback');

        // Set color (orange for router)
        this.color = '#f59e0b';

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

        // Set router name from database
        if (routerName) {
            this.matrixName = routerName;
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
     * Ports rotate around circle to point toward target
     */
    public getPortPosition(portId: string, targetNode?: BaseNode): { x: number; y: number } | undefined {
        const port = this.getPort(portId);
        if (!port) return undefined;

        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        const maskRadius = 104; // Must match renderer

        // Calculate angle based on port type
        let angle = 0;

        if (port.type === 'input') {
            // Input port on left (Math.PI)
            angle = Math.PI;
        } else if (targetNode) {
            // Output ports point toward target
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

        // 1. Check Input Port (Left Center: PI rad)
        const inPortX = centerX - maskRadius; // cos(PI) = -1
        const inPortY = centerY; // sin(PI) = 0

        if (Math.hypot(worldX - inPortX, worldY - inPortY) <= hitRadius) {
            return 'input';
        }

        // 2. Check Output Ports (dynamically positioned)
        // For now, check default right position for any output
        const outPortX = centerX + maskRadius;
        const outPortY = centerY;

        if (Math.hypot(worldX - outPortX, worldY - outPortY) <= hitRadius) {
            // Return first output port ID (could be refined to check all 4)
            return 'route-a';
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

        // Router logic would go here
        // For now, just pass input to route-a
        outputs.set('route-a', inputs.input);

        return {
            success: true,
            outputs,
            duration: 0
        };
    }
}
