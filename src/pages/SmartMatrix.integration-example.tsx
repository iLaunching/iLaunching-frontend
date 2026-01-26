/**
 * Example: SmartMatrix Integration with Phase 3 Persistence
 * 
 * This file shows how to integrate the useCanvasPersistence hook
 * into your existing SmartMatrix component.
 */

// Add to imports at top of SmartMatrix.tsx:
import { useCanvasPersistence } from '../hooks/useCanvasPersistence';

// Inside SmartMatrixCanvas component, after engineRef and other hooks:

// Phase 3: Canvas Persistence
const {
    persistNodeCreation,
    persistConnectionCreation,
    updateNodePosition,
    deleteNode,
    deleteConnection,
    isLoaded
} = useCanvasPersistence({
    contextId: manifestData?.manifest_id, // Use manifest_id as context_id
    engine: engineRef.current,
    enabled: isEngineReady
});

// Example: Persist node when created
// Add this after creating a node (e.g., in handleAddNode or similar):
const handleNodeCreated = useCallback((node: SmartMatrixNode) => {
    // Node is already added to canvas by CanvasEngine
    // Now persist to API
    persistNodeCreation(node);
}, [persistNodeCreation]);

// Example: Persist connection when created
// Hook into ConnectionManager's onConnectionComplete event:
useEffect(() => {
    if (!engineRef.current) return;

    const connectionManager = engineRef.current.getConnectionManager?.();
    if (!connectionManager) return;

    // Listen for connection complete events
    const handleConnectionComplete = (linkData: any) => {
        console.log('🔗 Connection completed:', linkData);
        persistConnectionCreation(linkData);
    };

    // You'll need to add an event emitter to ConnectionManager
    // or call persistConnectionCreation from your existing connection logic

}, [engineRef.current, persistConnectionCreation]);

// Example: Debounced position updates on drag end
// Hook into node drag end events:
const handleNodeDragEnd = useCallback((nodeId: string, x: number, y: number) => {
    // Update position in API (debounced internally)
    if (node.backendId) {
        updateNodePosition(node.backendId, x, y);
    }
}, [updateNodePosition]);

// Example: Delete node
const handleDeleteNode = useCallback((nodeId: string) => {
    const stateManager = engineRef.current?.getStateManager();
    if (!stateManager) return;

    const node = stateManager.getNodeById(nodeId);
    if (node && node.backendId) {
        deleteNode(node.backendId);
    }

    stateManager.removeNode(nodeId);
}, [deleteNode]);

// Example: Delete connection
const handleDeleteConnection = useCallback((connectionId: string) => {
    const stateManager = engineRef.current?.getStateManager();
    if (!stateManager) return;

    const link = stateManager.getLinkById(connectionId);
    if (link && link.id) {
        deleteConnection(link.id);
    }

    stateManager.removeLink(connectionId);
}, [deleteConnection]);

/**
 * INTEGRATION STEPS:
 * 
 * 1. Add useCanvasPersistence hook to SmartMatrix component
 * 2. Call persistNodeCreation when nodes are created
 * 3. Call persistConnectionCreation when connections are created
 * 4. Call updateNodePosition on drag end (debounced)
 * 5. Call deleteNode/deleteConnection when removing items
 * 
 * The hook will automatically:
 * - Load canvas state when context and engine are ready
 * - Prevent duplicate API calls
 * - Handle errors gracefully
 * - Log all operations to console
 */

/**
 * TESTING:
 * 
 * 1. Open browser console
 * 2. Create a node on canvas
 * 3. Check console for: "✅ Node persisted: <uuid>"
 * 4. Refresh page
 * 5. Node should be restored from API
 * 
 * 6. Create a connection
 * 7. Check console for: "✅ Connection persisted: <uuid>"
 * 8. Refresh page
 * 9. Connection should be restored
 */
