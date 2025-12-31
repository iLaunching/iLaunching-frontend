# Hover Animation Continuous Rendering Fix

## Problem
The hover animation for SmartMatrixNode wasn't working correctly because:
1. Animation state was updating (expand/contract logic working)
2. Canvas wasn't re-rendering during animation progress
3. CanvasEngine uses dirty-flag optimization - only renders when `isDirty` is true
4. No mechanism to keep canvas rendering during hover transitions

**User Report:** "the hover is not working as it should because the canvas is not updating. you need to allow the updating when mouse enter and stop on mouse leave of the node"

## Root Cause
The render loop only executes when something marks the canvas as dirty. While the hover animation state was being tracked correctly in `SmartMatrixNodeRenderer`, there was no mechanism to:
1. Detect when animations are in progress (0 < progress < 1)
2. Keep the render loop active during animation transitions
3. Trigger initial render when hover state changes

## Solution Architecture

### 1. Animation State Tracking (SmartMatrixNodeRenderer)
```typescript
// Track if continuous rendering needed
private needsAnimationFrame: boolean = false;

// Expose to NodeRenderer
public hasActiveAnimations(): boolean {
  return this.needsAnimationFrame;
}

// Check after each render
render() {
  // ... render node ...
  
  // Set flag if any animation is mid-transition
  this.needsAnimationFrame = false;
  for (const [, animState] of this.hoverAnimations) {
    if (animState.progress > 0 && animState.progress < 1) {
      this.needsAnimationFrame = true;
      break;
    }
  }
}
```

### 2. Propagate to NodeRenderer
```typescript
// Forward query to specialized renderer
public hasActiveAnimations(): boolean {
  return this.smartMatrixRenderer.hasActiveAnimations();
}
```

### 3. Continuous Rendering in CanvasEngine
```typescript
private render(deltaTime: number): void {
  // ... render all layers ...
  
  // Check if animations are still active and need next frame
  if (this.nodeRenderer.hasActiveAnimations()) {
    this.markDirty(); // Force next render
  }
}
```

### 4. Trigger on Hover State Change (InteractionManager)
```typescript
// Add callback to constructor
constructor(camera: Camera, markDirtyCallback?: () => void) {
  this.camera = camera;
  this.markDirtyCallback = markDirtyCallback;
}

// Call when hover state changes
private updateHover(worldX: number, worldY: number): void {
  // ... update isHovered property ...
  
  // Mark canvas as dirty to trigger re-render
  if (this.markDirtyCallback) {
    this.markDirtyCallback();
  }
}
```

## Implementation Flow

```
User Mouse Move
    ↓
InteractionManager.handleMouseMove()
    ↓
InteractionManager.updateHover()
    ↓ (sets node.isHovered)
    ↓
markDirtyCallback() → CanvasEngine.markDirty()
    ↓
CanvasEngine.render() → SmartMatrixNodeRenderer.render()
    ↓ (updates animation progress 0 → 1)
    ↓
SmartMatrixNodeRenderer checks: 0 < progress < 1?
    ↓ YES
    ↓
Sets needsAnimationFrame = true
    ↓
CanvasEngine checks nodeRenderer.hasActiveAnimations()
    ↓ TRUE
    ↓
CanvasEngine.markDirty() → render next frame
    ↓
LOOP continues until progress reaches 1.0
```

## Files Modified

### 1. SmartMatrixNodeRenderer.ts
- Added: `needsAnimationFrame` flag
- Added: `hasActiveAnimations()` public method
- Modified: `render()` to check animation progress after rendering

### 2. NodeRenderer.ts
- Added: `hasActiveAnimations()` method forwarding to SmartMatrixRenderer

### 3. CanvasEngine.ts
- Modified: `render()` to check for active animations and mark dirty
- Modified: Instantiation to pass markDirty callback to InteractionManager

### 4. InteractionManager.ts
- Added: `markDirtyCallback` property
- Modified: Constructor to accept optional callback
- Modified: `updateHover()` to call callback when hover state changes

## Animation Details

### Hover Animation Configuration
- **Expand:** 75px base radius → 85px (10px growth)
- **Contract:** 85px → 75px
- **Easing:** Ease-out cubic
- **Speed:** 0.08 per frame
- **Progress:** 0.0 (start) → 1.0 (complete)
- **Color:** `rgba(150, 100, 216, ${opacity})` (#9664D8 @ 0.2 opacity)

### Animation Progress Loop
```typescript
// Each frame during 0 < progress < 1:
if (animState.isExpanding) {
  animState.progress += 0.08; // Speed
  if (animState.progress >= 1) {
    animState.progress = 1;
    animState.isExpanding = false; // Lock expanded
  }
} else {
  animState.progress -= 0.08;
  if (animState.progress <= 0) {
    animState.progress = 0;
    // Animation complete, remove from map
  }
}

// Apply easing
const t = animState.progress;
const easedProgress = 1 - Math.pow(1 - t, 3); // Ease-out cubic

// Calculate current radius
const baseRadius = 75;
const expandedRadius = 85;
const currentRadius = baseRadius + (expandedRadius - baseRadius) * easedProgress;
```

## Testing Verification

### Test Scenarios
1. **Mouse enter node** → Should smoothly expand from 75px to 85px with purple glow
2. **Mouse leave node** → Should smoothly contract from 85px to 75px
3. **Rapid hover** → Animation should handle state changes mid-transition
4. **Multiple nodes** → Each node tracks its own animation independently

### Expected Behavior
- Smooth expansion/contraction over ~12 frames (at 60fps = ~200ms)
- Continuous rendering only during animation (0 < progress < 1)
- Idle state uses dirty-flag optimization (no unnecessary renders)
- Purple glow (#9664D8) fades in/out with radius change

### Debug Checks
```typescript
// In browser console:
// 1. Check animation state tracking
console.log(engine.nodeRenderer.hasActiveAnimations());

// 2. Monitor frame rendering
// Open DevTools > Performance
// Record while hovering nodes
// Verify continuous frames during hover, idle when not

// 3. Visual verification
// Hover node → should see smooth 75→85px growth
// Leave node → should see smooth 85→75px shrink
```

## Performance Impact

### Before Fix
- Hover animation state updated but not visible
- Canvas rendered only on mouse move (throttled to 60fps)
- Animation appeared broken/instant

### After Fix
- **During Animation:** Continuous rendering (~60fps for 200ms)
- **Idle State:** Dirty-flag optimization (no renders unless needed)
- **Cost:** ~12 extra frames per hover transition
- **Benefit:** Smooth, professional animation feedback

### Optimization Strategy
The `needsAnimationFrame` flag ensures we only force continuous rendering when absolutely necessary:
- **Active (0 < progress < 1):** markDirty() called every frame
- **Idle (progress = 0 or 1):** No markDirty(), rely on dirty-flag optimization
- **Multiple animations:** Single flag covers all active nodes

## Related Systems

### Retina-Grade DPI Rendering
The hover animation works seamlessly with the DPR system:
- Gradient overlays scale correctly at all DPR levels (1x/2x/3x)
- Purple glow renders crisp on Retina displays
- Animation radius calculations are DPR-independent (logical pixels)

### Text Rendering
NodeTextCache system unaffected by continuous rendering:
- Text cached once at 2x-4x resolution
- No re-rendering of text during animation
- Only node body and hover indicator re-rendered

### Connection System
Future connection animations can use same pattern:
- Add animation state tracking to LinkRenderer
- Check `linkRenderer.hasActiveAnimations()` in CanvasEngine
- Maintain continuous rendering during connection animations

## Future Enhancements

### Potential Improvements
1. **Animation Timing Control:** Configurable speed/easing per node
2. **Stagger Effect:** Delay animations when multiple nodes hover
3. **Physics-Based:** Spring/momentum-based easing for more natural feel
4. **Performance Metrics:** Track animation frame times for optimization
5. **Animation Queue:** Sequence multiple animations (hover → click → execute)

### Integration Points
- **Port Animations:** Same pattern for port hover/connection states
- **Selection Pulse:** Animate selected node border using same system
- **AI Execution:** Pulsing glow during model execution
- **Status Indicators:** Animate error/success states

## Conclusion

The hover animation fix establishes a robust pattern for managing continuous animations in a dirty-flag optimized render system:

1. **State Tracking:** Each renderer tracks its own animation states
2. **Flag Propagation:** Expose boolean flag via `hasActiveAnimations()`
3. **Conditional Rendering:** Engine checks flag and marks dirty as needed
4. **Trigger Events:** InteractionManager calls markDirty on state changes

This pattern can be extended to any future animation needs (connections, ports, status indicators, etc.) while maintaining optimal performance through dirty-flag optimization during idle states.
