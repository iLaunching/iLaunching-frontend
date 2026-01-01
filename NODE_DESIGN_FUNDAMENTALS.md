# NODE DESIGN FUNDAMENTALS

**Production-Ready Node System Architecture**  
*Last Updated: January 1, 2026*

## Table of Contents
1. [System Overview](#system-overview)
2. [Architecture Principles](#architecture-principles)
3. [Node Class Structure](#node-class-structure)
4. [Dynamic Port Positioning](#dynamic-port-positioning)
5. [Renderer Implementation](#renderer-implementation)
6. [Performance Optimization](#performance-optimization)
7. [Animation System](#animation-system)
8. [Hit Detection](#hit-detection)
9. [Integration Checklist](#integration-checklist)
10. [Examples](#examples)

---

## System Overview

The canvas node system is optimized for **hundreds of nodes** with **dynamic circular port rotation**. Ports automatically rotate around node perimeters to maintain straight connection lines, with visual elements (diamonds, icons) swiveling to align with connection angles.

### Key Features
- ✅ **O(n) Performance**: Connection map built once per frame (not O(n*m))
- ✅ **Dynamic Port Rotation**: 360° rotation using Math.atan2 trigonometry
- ✅ **Straight Lines**: Direct connections without bezier curves
- ✅ **Memory Management**: Auto-cleanup of stale animation states
- ✅ **Viewport Culling**: Only renders visible nodes
- ✅ **Smooth Animations**: Eased hover effects along connection angles

---

## Architecture Principles

### 1. Separation of Concerns
```
BaseNode (data/logic) → NodeRenderer (factory) → SpecializedRenderer (visual)
```

- **Node Class**: Handles position, ports, hit detection, port positioning logic
- **Renderer**: Handles canvas drawing, animations, visual effects
- **Connection Map**: Pre-computed per frame for O(1) lookups

### 2. Performance First
```typescript
// ❌ BAD: O(n*m) - Array search for every node
links.find(l => l.data.fromNodeId === nodeId)

// ✅ GOOD: O(1) - Pre-computed map lookup
nodeConnectionMap.get(nodeId)?.targetNodes[0]
```

### 3. Memory Consciousness
- Animation states cleaned every 300 frames (~5 seconds)
- Hard limit of 200 animation states per Map
- No memory leaks from deleted nodes

### 4. Immutable Data Flow
- Nodes don't modify global state
- Renderers receive read-only data
- Connection calculations happen in getEndpoints()

---

## Node Class Structure

### Base Template
```typescript
import { BaseNode } from './BaseNode';
import type { UUID } from '../types';

export class YourNode extends BaseNode {
  // Optional: Custom properties
  public isPortHovered: boolean = false;
  public backgroundColor: string = '#1e293b';
  
  constructor(id: UUID, x: number, y: number) {
    super(id, 'your-type', x, y, width, height, 'Your Node');
    
    // Add ports
    this.addInputPort('input', 'any', 'Input');
    this.addOutputPort('output', 'any', 'Output');
    
    // Set node color
    this.color = '#10b981';
  }
  
  // REQUIRED: Hit detection for node shape
  public containsPoint(worldX: number, worldY: number): boolean {
    // Implement based on node shape (see examples below)
  }
  
  // REQUIRED: Dynamic port positioning
  public getPortPosition(
    portId: string, 
    targetNode?: BaseNode
  ): { x: number; y: number } | undefined {
    // Implement based on node shape (see examples below)
  }
}
```

### Circular Node Pattern

**Use Case**: Nodes with radial symmetry (SmartMatrix, TestNode)

```typescript
public containsPoint(worldX: number, worldY: number): boolean {
  const centerX = this.x + this.width / 2;
  const centerY = this.y + this.height / 2;
  const radius = 85; // Adjust to your node size
  const dx = worldX - centerX;
  const dy = worldY - centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  return distance <= radius;
}

public getPortPosition(
  portId: string, 
  targetNode?: BaseNode
): { x: number; y: number } | undefined {
  const port = this.getPort(portId);
  if (!port) return undefined;
  
  const centerX = this.x + this.width / 2;
  const centerY = this.y + this.height / 2;
  const maskRadius = 85; // Port distance from center
  
  let angle: number;
  if (targetNode) {
    // Calculate angle toward target node
    const targetCenterX = targetNode.x + targetNode.width / 2;
    const targetCenterY = targetNode.y + targetNode.height / 2;
    angle = Math.atan2(
      targetCenterY - centerY, 
      targetCenterX - centerX
    );
  } else {
    // Default angle based on port type
    angle = port.type === 'input' ? Math.PI : 0; // Left or right
  }
  
  return {
    x: centerX + maskRadius * Math.cos(angle),
    y: centerY + maskRadius * Math.sin(angle)
  };
}
```

### Rectangular Node Pattern

**Use Case**: Standard box-shaped nodes

```typescript
public containsPoint(worldX: number, worldY: number): boolean {
  return (
    worldX >= this.x &&
    worldX <= this.x + this.width &&
    worldY >= this.y &&
    worldY <= this.y + this.height
  );
}

public getPortPosition(
  portId: string, 
  targetNode?: BaseNode
): { x: number; y: number } | undefined {
  const port = this.getPort(portId);
  if (!port) return undefined;
  
  // For rectangular nodes, ports typically stay on sides
  // But can be made dynamic if needed
  if (port.type === 'input') {
    return { x: this.x, y: this.y + this.height / 2 };
  } else {
    return { x: this.x + this.width, y: this.y + this.height / 2 };
  }
}
```

### Polygonal Node Pattern

**Use Case**: Hexagons, diamonds, custom shapes

```typescript
public containsPoint(worldX: number, worldY: number): boolean {
  // Point-in-polygon algorithm
  const vertices = this.getVertices(); // Your method to get points
  let inside = false;
  for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
    const xi = vertices[i].x, yi = vertices[i].y;
    const xj = vertices[j].x, yj = vertices[j].y;
    const intersect = ((yi > worldY) !== (yj > worldY)) &&
      (worldX < (xj - xi) * (worldY - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

public getPortPosition(
  portId: string, 
  targetNode?: BaseNode
): { x: number; y: number } | undefined {
  const port = this.getPort(portId);
  if (!port) return undefined;
  
  const centerX = this.x + this.width / 2;
  const centerY = this.y + this.height / 2;
  
  if (targetNode) {
    const targetCenterX = targetNode.x + targetNode.width / 2;
    const targetCenterY = targetNode.y + targetNode.height / 2;
    const angle = Math.atan2(
      targetCenterY - centerY, 
      targetCenterX - centerX
    );
    
    // Find intersection with polygon edge
    return this.getEdgeIntersection(centerX, centerY, angle);
  }
  
  // Default position
  return { x: this.x + this.width, y: centerY };
}
```

---

## Dynamic Port Positioning

### Core Principle
**Ports calculate their position dynamically based on the connected node's location.**

### Math.atan2 Trigonometry
```typescript
// Calculate angle from source to target
const angle = Math.atan2(
  targetCenterY - sourceCenterY,  // Δy
  targetCenterX - sourceCenterX   // Δx
);

// Position on circle perimeter
const portX = centerX + radius * Math.cos(angle);
const portY = centerY + radius * Math.sin(angle);
```

### Angle Ranges (Radians)
- **0**: Right (→)
- **π/2**: Down (↓)
- **π** or **-π**: Left (←)
- **-π/2**: Up (↑)

### Default Angles
When no target node exists, use sensible defaults:
```typescript
if (!targetNode) {
  // Input ports default to left, output ports to right
  angle = port.type === 'input' ? Math.PI : 0;
}
```

### Multiple Connections
For nodes with multiple connections from one port:
```typescript
// Option 1: Use first connection (simple, performant)
const targetNode = connections.targetNodes[0];

// Option 2: Average angles (more complex, but centered)
const avgAngle = connections.targetNodes.reduce((sum, node) => {
  const angle = Math.atan2(
    node.y + node.height / 2 - centerY,
    node.x + node.width / 2 - centerX
  );
  return sum + angle;
}, 0) / connections.targetNodes.length;
```

---

## Renderer Implementation

### Renderer Template
```typescript
export class YourNodeRenderer {
  private portHoverAnimations: Map<string, { 
    progress: number; 
    isExpanding: boolean 
  }> = new Map();
  private lastCleanupFrame = 0;
  private frameCount = 0;
  
  /**
   * Main render method
   */
  public render(
    ctx: CanvasRenderingContext2D,
    node: YourNode,
    camera: Camera,
    nodeConnectionMap: Map<string, { 
      sourceNodes: any[], 
      targetNodes: any[] 
    }>
  ): void {
    // Cleanup every 300 frames
    this.frameCount++;
    if (this.frameCount - this.lastCleanupFrame > 300) {
      this.cleanupStaleAnimations();
      this.lastCleanupFrame = this.frameCount;
    }
    
    ctx.save();
    
    // Convert world coordinates to screen coordinates
    const [screenX, screenY] = camera.toScreen(node.x, node.y);
    const zoom = camera.getZoom();
    const dpr = window.devicePixelRatio || 1;
    
    // Calculate scaled dimensions
    const width = node.width * zoom;
    const height = node.height * zoom;
    const centerX = screenX + width / 2;
    const centerY = screenY + height / 2;
    
    // Draw node shape
    this.renderNodeShape(ctx, centerX, centerY, zoom);
    
    // Draw ports with dynamic positioning
    this.renderPorts(ctx, node, centerX, centerY, zoom, nodeConnectionMap);
    
    ctx.restore();
  }
  
  /**
   * Render individual port
   */
  private renderPort(
    ctx: CanvasRenderingContext2D,
    node: YourNode,
    centerX: number,
    centerY: number,
    zoom: number,
    portType: 'input' | 'output',
    nodeConnectionMap: Map<string, { sourceNodes: any[], targetNodes: any[] }>
  ): void {
    // Get connections for this node
    const connections = nodeConnectionMap.get(node.id);
    
    // Calculate angle based on connection
    let angle = portType === 'input' ? Math.PI : 0; // Default
    if (connections) {
      const connectedNodes = portType === 'input' 
        ? connections.sourceNodes 
        : connections.targetNodes;
      
      if (connectedNodes.length > 0) {
        const targetNode = connectedNodes[0];
        const targetCenterX = targetNode.x + targetNode.width / 2;
        const targetCenterY = targetNode.y + targetNode.height / 2;
        const nodeCenterX = node.x + node.width / 2;
        const nodeCenterY = node.y + node.height / 2;
        angle = Math.atan2(
          targetCenterY - nodeCenterY,
          targetCenterX - nodeCenterX
        );
      }
    }
    
    // Calculate port position (in world coords)
    const maskRadius = 85;
    const basePortX = centerX + maskRadius * Math.cos(angle);
    const basePortY = centerY + maskRadius * Math.sin(angle);
    
    // Animation offset along angle
    const animProgress = this.getAnimationProgress(node.id, portType);
    const moveDistance = 20 * zoom;
    const portX = basePortX + Math.cos(angle) * (moveDistance * animProgress);
    const portY = basePortY + Math.sin(angle) * (moveDistance * animProgress);
    
    // Draw diamond connector rotated by angle
    ctx.save();
    ctx.translate(portX, portY);
    ctx.rotate(angle + Math.PI / 4); // Align apex with connection
    
    const diamondSize = 12 * zoom;
    ctx.roundRect(
      -diamondSize / 2, 
      -diamondSize / 2, 
      diamondSize, 
      diamondSize, 
      2 * zoom
    );
    ctx.fillStyle = '#8b5cf6';
    ctx.fill();
    
    ctx.restore();
    
    // Draw icon positioned along angle
    const iconDistance = maskRadius + (moveDistance * animProgress) / 2;
    const iconX = centerX + Math.cos(angle) * iconDistance;
    const iconY = centerY + Math.sin(angle) * iconDistance;
    
    ctx.fillStyle = '#ffffff';
    ctx.font = `${16 * zoom}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(portType === 'input' ? '−' : '+', iconX, iconY);
  }
  
  /**
   * Clean up stale animations (prevent memory leaks)
   */
  private cleanupStaleAnimations(): void {
    for (const [key, state] of this.portHoverAnimations) {
      if (state.progress === 0 && !state.isExpanding) {
        this.portHoverAnimations.delete(key);
      }
    }
    
    // Hard limit: keep only last 200 animations
    if (this.portHoverAnimations.size > 200) {
      const toDelete = this.portHoverAnimations.size - 200;
      let deleted = 0;
      for (const key of this.portHoverAnimations.keys()) {
        if (deleted >= toDelete) break;
        this.portHoverAnimations.delete(key);
        deleted++;
      }
    }
  }
}
```

### Camera Transformation
**CRITICAL**: Always convert world coordinates to screen coordinates:
```typescript
// World coordinates (node position in infinite canvas)
const worldX = node.x;
const worldY = node.y;

// Screen coordinates (pixel position on viewport)
const [screenX, screenY] = camera.toScreen(worldX, worldY);

// Scale factor
const zoom = camera.getZoom();
const scaledWidth = node.width * zoom;
```

---

## Performance Optimization

### Connection Map Architecture

**Built once per frame in CanvasEngine:**
```typescript
// CanvasEngine.renderNodes()
const nodeConnectionMap = new Map<string, { 
  sourceNodes: any[], 
  targetNodes: any[] 
}>();

for (const link of linksMap.values()) {
  // Track output connections
  if (!nodeConnectionMap.has(link.data.fromNodeId)) {
    nodeConnectionMap.set(link.data.fromNodeId, { 
      sourceNodes: [], 
      targetNodes: [] 
    });
  }
  nodeConnectionMap.get(link.data.fromNodeId)!.targetNodes.push(link.targetNode);
  
  // Track input connections
  if (!nodeConnectionMap.has(link.data.toNodeId)) {
    nodeConnectionMap.set(link.data.toNodeId, { 
      sourceNodes: [], 
      targetNodes: [] 
    });
  }
  nodeConnectionMap.get(link.data.toNodeId)!.sourceNodes.push(link.sourceNode);
}
```

**Used in renderers with O(1) lookup:**
```typescript
const connections = nodeConnectionMap.get(nodeId);
if (connections && connections.targetNodes.length > 0) {
  const targetNode = connections.targetNodes[0]; // O(1) array access
  // Calculate angle...
}
```

### Performance Metrics
| Operation | Complexity | Notes |
|-----------|-----------|-------|
| Build connection map | O(n) | n = number of links |
| Lookup connections | O(1) | Map.get() |
| Calculate angle | O(1) | Math.atan2() |
| Render visible nodes | O(m) | m = visible nodes (culled) |
| Animation cleanup | O(a) | a = animation states (max 200) |

### Optimization Checklist
- ✅ Use connection map, not array.find()
- ✅ Implement viewport culling in node class
- ✅ Clean up animations every 300 frames
- ✅ Hard limit of 200 animation states
- ✅ Cache calculations when possible
- ✅ Use ctx.save()/restore() for transforms
- ✅ Batch similar draw operations

---

## Animation System

### Animation State Structure
```typescript
private portHoverAnimations: Map<string, { 
  progress: number;      // 0 to 1
  isExpanding: boolean;  // Direction
}> = new Map();
```

### Smooth Easing
```typescript
// Linear progress (0 to 1)
const animSpeed = 0.25;
if (isHovering) {
  progress = Math.min(1, progress + animSpeed);
} else {
  progress = Math.max(0, progress - animSpeed);
}

// Apply easing function
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
const easedProgress = easeOut(progress);

// Use in calculations
const distance = baseDistance * easedProgress;
const opacity = maxOpacity * progress;
```

### Animation Along Angle
```typescript
// Instead of fixed X/Y offset:
const offsetX = 20 * animProgress; // ❌ Always moves right

// Offset along connection angle:
const offsetX = Math.cos(angle) * (20 * animProgress); // ✅ Follows connection
const offsetY = Math.sin(angle) * (20 * animProgress);
```

### Cleanup Strategy
```typescript
private cleanupStaleAnimations(): void {
  // Remove completed animations
  for (const [key, state] of this.animations) {
    if (state.progress === 0 && !state.isExpanding) {
      this.animations.delete(key);
    }
  }
  
  // Enforce hard limit (prevent unbounded growth)
  if (this.animations.size > 200) {
    const toDelete = this.animations.size - 200;
    let deleted = 0;
    for (const key of this.animations.keys()) {
      if (deleted >= toDelete) break;
      this.animations.delete(key);
      deleted++;
    }
  }
}
```

---

## Hit Detection

### Port Click Detection

**Circular nodes:**
```typescript
public containsPortPoint(worldX: number, worldY: number): boolean {
  const centerX = this.x + this.width / 2;
  const centerY = this.y + this.height / 2;
  const portRadius = 85;
  const threshold = 30; // Click area size
  
  const dx = worldX - centerX;
  const dy = worldY - centerY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  // Check if click is within port ring area
  return Math.abs(distance - portRadius) < threshold;
}
```

**Rectangular nodes:**
```typescript
public containsPortPoint(worldX: number, worldY: number): boolean {
  const portSize = 20;
  const threshold = 10;
  
  // Check each port
  for (const port of this.getPortsArray()) {
    const pos = this.getPortPosition(port.id);
    if (!pos) continue;
    
    const dx = Math.abs(worldX - pos.x);
    const dy = Math.abs(worldY - pos.y);
    
    if (dx < portSize + threshold && dy < portSize + threshold) {
      return true;
    }
  }
  
  return false;
}
```

### Node Selection Priority
```typescript
// In Canvas.tsx click handler:
// 1. Check port clicks first (smaller area)
if (node.containsPortPoint(worldX, worldY)) {
  handlePortClick(node);
  return;
}

// 2. Then check node body
if (node.containsPoint(worldX, worldY)) {
  handleNodeClick(node);
  return;
}
```

---

## Integration Checklist

### 1. Create Node Class
- [ ] Extend BaseNode
- [ ] Implement containsPoint() for shape
- [ ] Implement getPortPosition() with dynamic angle calculation
- [ ] Add input/output ports in constructor
- [ ] Set node color and properties

### 2. Create Renderer
- [ ] Accept nodeConnectionMap parameter
- [ ] Use camera.toScreen() for coordinates
- [ ] Calculate angles using Math.atan2
- [ ] Rotate visual elements by angle + π/4
- [ ] Position icons using Math.cos/sin along angle
- [ ] Implement animation cleanup (every 300 frames)
- [ ] Hard limit of 200 animation states

### 3. Register in Factory
```typescript
// In NodeRenderer.ts
import { YourNode } from '../nodes/YourNode';
import { YourNodeRenderer } from './YourNodeRenderer';

export class NodeRenderer {
  private yourNodeRenderer: YourNodeRenderer;
  
  constructor() {
    this.yourNodeRenderer = new YourNodeRenderer();
  }
  
  render(ctx, node, camera, nodeConnectionMap): void {
    if (node instanceof YourNode) {
      this.yourNodeRenderer.render(ctx, node, camera, nodeConnectionMap);
      return;
    }
    // ... other nodes
  }
}
```

### 4. Update Canvas Component
```typescript
// In Canvas.tsx, add to node creation logic
case 'your-type':
  return new YourNode(id, x, y);
```

### 5. Testing
- [ ] Create node and verify rendering
- [ ] Test hit detection (click, drag)
- [ ] Connect to another node
- [ ] Move nodes and verify ports rotate
- [ ] Check lines stay straight
- [ ] Verify animations smooth
- [ ] Test with 100+ nodes for performance
- [ ] Check memory doesn't leak over time

---

## Examples

### Example 1: Simple Circular Node

**MyCircleNode.ts:**
```typescript
import { BaseNode } from './BaseNode';
import type { UUID } from '../types';

export class MyCircleNode extends BaseNode {
  public isPortHovered: boolean = false;
  
  constructor(id: UUID, x: number, y: number) {
    super(id, 'circle', x, y, 200, 200, 'Circle Node');
    this.addInputPort('in', 'any', 'Input');
    this.addOutputPort('out', 'any', 'Output');
    this.color = '#3b82f6';
  }
  
  public containsPoint(worldX: number, worldY: number): boolean {
    const centerX = this.x + 100;
    const centerY = this.y + 100;
    const dx = worldX - centerX;
    const dy = worldY - centerY;
    return Math.sqrt(dx * dx + dy * dy) <= 80;
  }
  
  public getPortPosition(
    portId: string,
    targetNode?: BaseNode
  ): { x: number; y: number } | undefined {
    const port = this.getPort(portId);
    if (!port) return undefined;
    
    const centerX = this.x + 100;
    const centerY = this.y + 100;
    const radius = 80;
    
    let angle = port.type === 'input' ? Math.PI : 0;
    if (targetNode) {
      const tx = targetNode.x + targetNode.width / 2;
      const ty = targetNode.y + targetNode.height / 2;
      angle = Math.atan2(ty - centerY, tx - centerX);
    }
    
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle)
    };
  }
}
```

**MyCircleNodeRenderer.ts:**
```typescript
import type { MyCircleNode } from '../nodes/MyCircleNode';
import type { Camera } from '../Camera';

export class MyCircleNodeRenderer {
  private animations = new Map();
  private frameCount = 0;
  private lastCleanup = 0;
  
  public render(
    ctx: CanvasRenderingContext2D,
    node: MyCircleNode,
    camera: Camera,
    nodeConnectionMap: Map<string, any>
  ): void {
    this.frameCount++;
    if (this.frameCount - this.lastCleanup > 300) {
      this.cleanup();
      this.lastCleanup = this.frameCount;
    }
    
    const [sx, sy] = camera.toScreen(node.x, node.y);
    const zoom = camera.getZoom();
    const centerX = sx + 100 * zoom;
    const centerY = sy + 100 * zoom;
    const radius = 80 * zoom;
    
    // Draw circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fillStyle = node.color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2 * zoom;
    ctx.stroke();
    
    // Draw ports
    this.renderPort(ctx, node, centerX, centerY, zoom, 'input', nodeConnectionMap);
    this.renderPort(ctx, node, centerX, centerY, zoom, 'output', nodeConnectionMap);
  }
  
  private renderPort(
    ctx: CanvasRenderingContext2D,
    node: MyCircleNode,
    centerX: number,
    centerY: number,
    zoom: number,
    type: 'input' | 'output',
    map: Map<string, any>
  ): void {
    const conn = map.get(node.id);
    let angle = type === 'input' ? Math.PI : 0;
    
    if (conn) {
      const nodes = type === 'input' ? conn.sourceNodes : conn.targetNodes;
      if (nodes.length > 0) {
        const target = nodes[0];
        const tx = target.x + target.width / 2;
        const ty = target.y + target.height / 2;
        const nx = node.x + 100;
        const ny = node.y + 100;
        angle = Math.atan2(ty - ny, tx - nx);
      }
    }
    
    const radius = 80;
    const px = centerX + radius * Math.cos(angle) * zoom;
    const py = centerY + radius * Math.sin(angle) * zoom;
    
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(angle + Math.PI / 4);
    ctx.fillStyle = '#8b5cf6';
    ctx.fillRect(-6 * zoom, -6 * zoom, 12 * zoom, 12 * zoom);
    ctx.restore();
  }
  
  private cleanup(): void {
    if (this.animations.size > 200) {
      const del = this.animations.size - 200;
      let i = 0;
      for (const key of this.animations.keys()) {
        if (i++ >= del) break;
        this.animations.delete(key);
      }
    }
  }
}
```

### Example 2: Rectangular Node with Fixed Ports

**MyBoxNode.ts:**
```typescript
export class MyBoxNode extends BaseNode {
  constructor(id: UUID, x: number, y: number) {
    super(id, 'box', x, y, 150, 100, 'Box Node');
    this.addInputPort('in', 'any', 'Input');
    this.addOutputPort('out', 'any', 'Output');
    this.color = '#ec4899';
  }
  
  public containsPoint(worldX: number, worldY: number): boolean {
    return (
      worldX >= this.x && worldX <= this.x + this.width &&
      worldY >= this.y && worldY <= this.y + this.height
    );
  }
  
  public getPortPosition(
    portId: string,
    targetNode?: BaseNode
  ): { x: number; y: number } | undefined {
    const port = this.getPort(portId);
    if (!port) return undefined;
    
    const centerY = this.y + this.height / 2;
    
    if (port.type === 'input') {
      return { x: this.x, y: centerY };
    } else {
      return { x: this.x + this.width, y: centerY };
    }
  }
}
```

---

## Best Practices

### ✅ DO
- Use connection map for O(1) lookups
- Clean up animations regularly
- Convert world coords to screen coords
- Calculate angles with Math.atan2
- Rotate diamonds by angle + π/4
- Position icons using Math.cos/sin
- Implement viewport culling
- Use ctx.save()/restore() for transforms
- Test with 100+ nodes

### ❌ DON'T
- Use array.find() in render loops
- Forget to clean up animation states
- Mix world and screen coordinates
- Hardcode port positions when dynamic
- Rotate diamonds by fixed angles
- Position icons with fixed offsets
- Render all nodes (use culling)
- Transform without save/restore
- Skip performance testing

---

## Performance Targets

### Development
- 60 FPS with 100 nodes, 50 connections
- 60 FPS with 500 nodes, 200 connections (culled)
- Memory stable over 10 minutes

### Production
- 60 FPS with 1000 nodes, 500 connections (culled)
- <100 MB memory growth per hour
- <16ms frame time (60 FPS)

### Monitoring
```typescript
// Add to CanvasEngine for dev builds
console.log('Rendered nodes:', renderedCount);
console.log('Animation states:', animations.size);
console.log('Frame time:', performance.now() - frameStart);
```

---

## Troubleshooting

### Ports Not Rotating
- ❌ Not passing nodeConnectionMap to renderer
- ❌ Using array.find() instead of map.get()
- ❌ Forgot to calculate angle with Math.atan2
- ❌ getPortPosition() not accepting targetNode param

### Diamonds Not Aligned
- ❌ Rotating by fixed π/4 instead of angle + π/4
- ❌ Using world coords instead of screen coords
- ❌ Missing ctx.translate() before rotate

### Icons Not Following
- ❌ Using fixed x/y instead of Math.cos/sin
- ❌ Not multiplying by angle-based direction
- ❌ Forgetting to add animation offset

### Memory Leaks
- ❌ Not cleaning up animation states
- ❌ Missing hard limit (200 states)
- ❌ Cleanup not running every 300 frames

### Performance Issues
- ❌ Using array.find() in hot path
- ❌ Not implementing viewport culling
- ❌ Rendering all nodes instead of visible only
- ❌ Creating new objects in render loop

---

## Summary

This system is **production-ready** for hundreds of nodes with dynamic circular port rotation. The key principles are:

1. **Performance**: O(n) connection map, viewport culling, animation cleanup
2. **Dynamic Ports**: Math.atan2 angle calculation, trigonometric positioning
3. **Visual Alignment**: Rotate diamonds by angle + π/4, position icons with Math.cos/sin
4. **Memory Safety**: Auto-cleanup every 300 frames, hard limit of 200 states
5. **Separation**: Node handles logic, renderer handles visuals

Follow this guide for all future nodes to ensure consistency, performance, and maintainability.

---

**Questions?** Reference existing implementations:
- **SmartMatrixNode** (circular with dynamic output)
- **TestNode** (circular with dynamic input/output)
- **CanvasEngine** (connection map architecture)
