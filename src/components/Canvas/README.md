# Canvas Engine - Phase 1 Documentation

## Overview

Production-ready canvas engine for the Smart Matrix node-based automation builder. Built with performance, reliability, and maintainability as core principles.

## Architecture

### 3-Layer Canvas System

The engine uses a layered architecture for optimal performance:

1. **Background Layer** (Static)
   - Infinite adaptive grid
   - Only re-renders on camera movement
   - Uses `alpha: false` for better performance

2. **Connections Layer** (60fps)
   - Animated connection lines between nodes
   - Bezier curves with flowing data visualization
   - Uses `alpha: true` for transparency

3. **Nodes Layer** (Interactive)
   - Node rendering and interaction
   - Mouse events and hit detection
   - Drag-and-drop functionality

## Features

### Performance Optimizations

- ✅ **Dirty Flag Rendering**: Only renders when something changes
- ✅ **Tab Visibility Detection**: Pauses rendering when tab is hidden
- ✅ **ResizeObserver**: Better performance than window resize events
- ✅ **Throttled Pan**: requestAnimationFrame throttling for smooth panning
- ✅ **Passive Event Listeners**: Improves scroll performance
- ✅ **Canvas Context Options**: Optimized alpha channels per layer

### Production-Ready Features

- ✅ **Error Boundaries**: Graceful error handling with recovery UI
- ✅ **Input Validation**: Type guards and runtime validation
- ✅ **Memory Management**: Proper cleanup on unmount
- ✅ **Accessibility**: ARIA labels and keyboard support ready
- ✅ **Performance Tracking**: Built-in FPS and frame time monitoring
- ✅ **TypeScript**: Full type safety with strict mode

### Camera System

- ✅ **Zoom-to-Cursor**: Natural zooming at mouse position
- ✅ **Smooth Panning**: Middle mouse button or space+drag
- ✅ **Zoom Constraints**: Configurable min/max zoom levels
- ✅ **World ↔ Screen Conversion**: Accurate coordinate transformations

### Grid System

- ✅ **Infinite Grid**: Seamless panning in all directions
- ✅ **Adaptive Detail**: Grid subdivisions based on zoom level
- ✅ **Snap-to-Grid**: Optional alignment for node placement

## Usage

### Basic Setup

```typescript
import { CanvasEngine } from './components/Canvas/CanvasEngine.js';

const engine = new CanvasEngine({
  containerElement: document.getElementById('canvas-container')!,
  gridEnabled: true,
  gridSize: 50,
  snapToGrid: false,
  enableDebug: false,
  initialCamera: {
    x: 0,
    y: 0,
    zoom: 1.0,
    minZoom: 0.1,
    maxZoom: 3.0
  }
});

// Start rendering
engine.start();

// Clean up on unmount
engine.stop();
engine.destroy();
```

### With Error Boundary (Recommended)

```typescript
import { CanvasErrorBoundary } from './components/Canvas/ErrorBoundary.js';

function MyComponent() {
  return (
    <CanvasErrorBoundary onError={(error) => console.error(error)}>
      <SmartMatrix />
    </CanvasErrorBoundary>
  );
}
```

## API Reference

### CanvasEngine

#### Constructor Options

```typescript
interface CanvasEngineConfig {
  containerElement: HTMLElement;  // Required: DOM element to render into
  gridEnabled?: boolean;          // Default: true
  gridSize?: number;              // Default: 50 (pixels)
  snapToGrid?: boolean;           // Default: false
  enableDebug?: boolean;          // Default: false
  initialCamera?: Partial<CameraState>;
}
```

#### Methods

- `start(): void` - Start the render loop
- `stop(): void` - Stop the render loop
- `destroy(): void` - Clean up all resources
- `getCamera(): Camera` - Get camera instance
- `markDirty(): void` - Trigger re-render
- `updateBackground(): void` - Re-render background layer
- `getPerformanceMetrics(): PerformanceMetrics` - Get FPS and timing data

### Camera

#### Methods

- `toScreen(worldX, worldY): [screenX, screenY]` - Convert world to screen coordinates
- `toWorld(screenX, screenY): [worldX, worldY]` - Convert screen to world coordinates
- `zoomToPoint(delta, screenX, screenY): void` - Zoom at specific screen position
- `pan(deltaX, deltaY): void` - Pan the camera
- `setCanvasSize(width, height): void` - Update canvas dimensions

## Performance Metrics

### Expected Performance

- **Idle CPU**: ~0% (dirty flag optimization)
- **Active CPU**: ~2-5% (during pan/zoom)
- **Frame Rate**: 60fps maintained during interactions
- **Memory**: ~5-10MB for canvas layers

### Monitoring

```typescript
const metrics = engine.getPerformanceMetrics();
console.log({
  fps: metrics.fps,
  avgFrameTime: metrics.avgFrameTime,
  maxFrameTime: metrics.maxFrameTime,
  frameCount: metrics.frameCount
});
```

## Error Handling

### Common Errors

1. **"Canvas engine requires a containerElement"**
   - Solution: Pass a valid HTML element to the constructor

2. **"Failed to create canvas rendering contexts"**
   - Solution: Check browser WebGL support and canvas limits

3. **"Invalid canvas dimensions"**
   - Solution: Ensure container has valid width/height

### Error Recovery

The Error Boundary component provides automatic recovery:
- Catches rendering errors
- Displays user-friendly error message
- Allows restart without page reload
- Logs errors for debugging

## Best Practices

### 1. Always Use Error Boundaries

```typescript
// ✅ Good
<CanvasErrorBoundary>
  <SmartMatrix />
</CanvasErrorBoundary>

// ❌ Bad
<SmartMatrix />
```

### 2. Clean Up on Unmount

```typescript
// ✅ Good
useEffect(() => {
  const engine = new CanvasEngine(config);
  engine.start();
  
  return () => {
    engine.stop();
    engine.destroy();
  };
}, []);
```

### 3. Validate Configuration

```typescript
// ✅ Good
try {
  const engine = new CanvasEngine(config);
} catch (error) {
  console.error('Invalid config:', error);
}
```

### 4. Use Performance Monitoring

```typescript
// ✅ Good - Monitor FPS in production
useEffect(() => {
  const interval = setInterval(() => {
    const metrics = engine.getPerformanceMetrics();
    if (metrics.fps < 30) {
      console.warn('Low FPS detected:', metrics);
    }
  }, 5000);
  
  return () => clearInterval(interval);
}, []);
```

## Browser Support

- **Chrome**: ✅ 90+
- **Firefox**: ✅ 88+
- **Safari**: ✅ 14+
- **Edge**: ✅ 90+

### Required Features

- Canvas 2D API
- ResizeObserver (with fallback)
- requestAnimationFrame
- ES6+ (via transpilation)

## Testing

### Manual Testing Checklist

- [ ] Zoom in/out with mouse wheel
- [ ] Pan with middle mouse button
- [ ] Grid renders correctly at all zoom levels
- [ ] No performance issues on page load
- [ ] FPS stays at 60 during interaction
- [ ] CPU drops to 0% when idle
- [ ] Canvas pauses when tab hidden
- [ ] Resize container works correctly
- [ ] Error boundary catches errors
- [ ] No memory leaks after unmount

## Troubleshooting

### Canvas Not Rendering

1. Check console for errors
2. Verify container element exists
3. Ensure container has dimensions
4. Check browser developer tools for failed context creation

### Poor Performance

1. Check FPS counter (enable debug mode)
2. Verify dirty flags are working (canvas should not update when idle)
3. Check browser performance profiler
4. Ensure no other heavy operations running

### Memory Leaks

1. Verify `destroy()` is called on unmount
2. Check for orphaned event listeners
3. Use browser memory profiler
4. Ensure animation frames are cancelled

## Next Steps (Phase 2)

- [ ] BaseNode abstract class
- [ ] NodeRenderer with offscreen caching
- [ ] InteractionManager for mouse handling
- [ ] StateManager for node/link storage
- [ ] Node selection and dragging
- [ ] Box selection (multi-select)

## Contributing

When adding features to the canvas engine:

1. Maintain type safety (strict TypeScript)
2. Add validation for user inputs
3. Include error handling
4. Document with JSDoc comments
5. Consider performance impact
6. Write production-ready code

## License

Part of the iLaunching platform. Internal use only.
