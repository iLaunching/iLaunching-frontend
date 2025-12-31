# Grid System Implementation

## Overview
Complete grid system with snapping functionality and dual display modes (lines and dots).

## Features

### 1. Grid Snapping ✅
**Location:** `InteractionManager.ts`

Nodes snap to the nearest grid coordinate when dragged:
```typescript
private snapToGridCoordinate(value: number): number {
  if (!this.snapToGrid) return value;
  return Math.round(value / this.gridSize) * this.gridSize;
}
```

**Configuration:**
- `gridSize`: Grid cell size in pixels (default: 50)
- `snapToGrid`: Enable/disable snapping (default: true)

### 2. Grid Display Types ✅
**Location:** `GridRenderer.ts`

Two rendering modes:

#### Line Grid (Default)
- Stroked lines forming a grid pattern
- Original implementation
- Best for precise alignment visualization

#### Dot Grid (New)
- Filled circles at grid intersections
- Minimalist appearance
- Dot size scales with zoom: `Math.max(1, 1.5 * camera.zoom)`

### 3. Runtime Grid Type Switching ✅
**Location:** `SmartMatrix.tsx` + `CanvasEngine.ts`

UI button toggles between line and dot grids:
```typescript
// In CanvasEngine
setGridType(type: 'lines' | 'dots'): void {
  this.gridRenderer.setConfig({ type });
  this.backgroundDirty = true;
}

// In SmartMatrix
const toggleGridType = () => {
  setGridType(prev => prev === 'lines' ? 'dots' : 'lines');
};
```

## Configuration Flow

```
CanvasEngineConfig (types/index.ts)
    ↓
CanvasEngine.ts
    ↓
GridRenderer.ts
```

### CanvasEngineConfig Options
```typescript
{
  gridEnabled?: boolean;      // Show/hide grid
  gridSize?: number;          // Cell size (default: 50)
  gridType?: 'lines' | 'dots'; // Display mode
  snapToGrid?: boolean;        // Enable snapping
}
```

## User Interface

**Toolbar Button:**
- Icon changes based on mode: `⊞` (lines) or `⋯` (dots)
- Label shows current mode: "Grid: Lines" or "Grid: Dots"
- Purple background (#6366f1) to match canvas theme
- Located between "Add Smart Matrix" and "Debug" buttons

## Implementation Details

### Dotted Grid Algorithm
```typescript
private drawDottedGrid(ctx, camera, bounds, gridSize, color): void {
  const dotRadius = Math.max(1, 1.5 * camera.zoom);
  const startX = Math.floor(bounds.minX / gridSize) * gridSize;
  const startY = Math.floor(bounds.minY / gridSize) * gridSize;
  
  for (let worldX = startX; worldX <= bounds.maxX; worldX += gridSize) {
    for (let worldY = startY; worldY <= bounds.maxY; worldY += gridSize) {
      const [screenX, screenY] = camera.toScreen(worldX, worldY);
      ctx.beginPath();
      ctx.arc(screenX, screenY, dotRadius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
```

### Snapping Algorithm
Applied during node drag in `InteractionManager.updateDragging()`:
```typescript
let newX = worldX + offset.x;
let newY = worldY + offset.y;

if (this.snapToGrid) {
  newX = this.snapToGridCoordinate(newX);
  newY = this.snapToGridCoordinate(newY);
}

node.setPosition(newX, newY);
```

## Performance Notes

- Dotted grid uses nested loops but only draws visible area (viewport culling)
- Dot radius scales with zoom to maintain visual consistency
- Grid render is cached in background canvas (only redraws on pan/zoom)
- Sub-grid also supports both line and dot modes automatically

## Usage Example

```typescript
// Initialize with dot grid and snapping
const engine = new CanvasEngine({
  containerElement: document.getElementById('canvas'),
  gridEnabled: true,
  gridSize: 50,
  gridType: 'dots',    // Start with dots
  snapToGrid: true      // Enable snapping
});

// Switch to line grid at runtime
engine.setGridType('lines');

// Switch back to dots
engine.setGridType('dots');
```

## Future Enhancements (Optional)

- [ ] Save grid type preference to localStorage
- [ ] Add grid size selector (25px, 50px, 100px)
- [ ] Add grid opacity slider
- [ ] Keyboard shortcut to toggle grid type (e.g., 'G')
- [ ] Grid color customization based on theme
