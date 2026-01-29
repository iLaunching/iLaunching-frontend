/**
 * useCanvasPersistence Hook
 * Handles loading and saving canvas state (nodes and connections) to Phase 3 API
 */

import { useCallback, useEffect, useRef } from 'react';
import { canvasApi, type NodeCreateData, type ConnectionCreateData } from '../services/canvasApi';
import type { CanvasEngine } from '../components/Canvas/CanvasEngine';
import { SmartMatrixNode } from '../components/Canvas/nodes/SmartMatrixNode';
import type { LinkData } from '../components/Canvas/types';

interface UseCanvasPersistenceOptions {
    contextId: string | undefined;
    engine: CanvasEngine | null;
    enabled?: boolean;
}

export const useCanvasPersistence = ({
    contextId,
    engine,
    enabled = true
}: UseCanvasPersistenceOptions) => {
    const hasLoadedRef = useRef(false);
    const pendingNodeCreations = useRef<Set<string>>(new Set());
    const pendingConnectionCreations = useRef<Set<string>>(new Set());

    /**
     * Load canvas state from API
     */
    const loadCanvasState = useCallback(async () => {
        if (!contextId || !engine || !enabled) {
            console.log('⏸️ Skipping canvas load:', { contextId, engine: !!engine, enabled });
            return;
        }

        if (hasLoadedRef.current) {
            console.log('⏸️ Canvas already loaded');
            return;
        }

        console.log('📥 Loading canvas state for context:', contextId);

        try {
            // Load nodes and connections in parallel
            const [nodes, connections] = await Promise.all([
                canvasApi.getContextNodes(contextId),
                canvasApi.getContextConnections(contextId)
            ]);

            console.log(`✅ Loaded ${nodes.length} nodes and ${connections.length} connections`);

            const stateManager = engine.getStateManager();

            // TODO: Clear existing nodes when clearNodes() method is implemented
            // stateManager.clearNodes();

            // Recreate nodes from API data
            // Recreate nodes from API data
            nodes.forEach((nodeData: any) => {
                if (nodeData.node_type === 'smart-matrix') {
                    // Extract colors from metadata if available
                    const bgColor = nodeData.node_metadata?.theme_background;
                    const textColor = nodeData.node_metadata?.theme_text;
                    const solidColor = nodeData.node_metadata?.theme_solid;

                    const node = new SmartMatrixNode(
                        nodeData.node_id,
                        nodeData.pos_x,
                        nodeData.pos_y,
                        bgColor,
                        textColor,
                        solidColor,
                        nodeData.node_name
                    );

                    stateManager.addNode(node);
                    console.log('✅ Restored SmartMatrixNode:', nodeData.node_id);
                } else {
                    console.log('⚠️ Unknown node type, skipping:', nodeData.node_type);
                }
            });

            // Recreate connections
            connections.forEach((connData: any) => {
                const linkData: LinkData = {
                    id: connData.connection_id,
                    fromNodeId: connData.source_node_id,
                    fromPortId: connData.source_port_id,
                    toNodeId: connData.target_node_id,
                    toPortId: connData.target_port_id,
                    color: connData.color || '#3b82f6',
                    animated: connData.animated ?? true,
                    pulseSpeed: connData.pulse_speed || 200,
                    status: connData.status || 'idle'
                };

                stateManager.addLink(linkData);
            });

            hasLoadedRef.current = true;
            console.log('✅ Canvas state loaded successfully');

        } catch (error) {
            console.error('❌ Failed to load canvas state:', error);
        }
    }, [contextId, engine, enabled]);

    /**
     * Persist node creation to API
     */
    const persistNodeCreation = useCallback(async (node: any) => {
        if (!contextId || !enabled) return;

        // Prevent duplicate API calls
        if (pendingNodeCreations.current.has(node.id)) {
            return;
        }

        pendingNodeCreations.current.add(node.id);

        try {
            const nodeData: NodeCreateData = {
                context_id: contextId,
                node_type: node.type || 'smart-matrix',
                node_name: node.name || 'Unnamed Node',
                pos_x: node.x,
                pos_y: node.y,
                width: node.width || 250,
                height: node.height || 250,
                color: node.color || '#8b5cf6',
                port_config: {
                    inputs: node.getInputPorts?.() || [],
                    outputs: node.getOutputPorts?.() || []
                },
                metadata: {
                    frontend_id: node.id // Store frontend ID for reference
                }
            };

            const response = await canvasApi.createNode(nodeData);
            console.log('✅ Node persisted:', response.node_id);

            // Update node with backend ID
            node.backendId = response.node_id;

        } catch (error) {
            console.error('❌ Failed to persist node:', error);
        } finally {
            pendingNodeCreations.current.delete(node.id);
        }
    }, [contextId, enabled]);

    /**
     * Persist connection creation to API
     */
    const persistConnectionCreation = useCallback(async (linkData: LinkData) => {
        if (!contextId || !enabled) return;

        const connectionKey = `${linkData.fromNodeId}-${linkData.toNodeId}`;

        // Prevent duplicate API calls
        if (pendingConnectionCreations.current.has(connectionKey)) {
            return;
        }

        pendingConnectionCreations.current.add(connectionKey);

        try {
            const connectionData: ConnectionCreateData = {
                source_node_id: linkData.fromNodeId,
                source_port_id: linkData.fromPortId,
                target_node_id: linkData.toNodeId,
                target_port_id: linkData.toPortId,
                color: linkData.color || '#3b82f6',
                animated: linkData.animated ?? true,
                pulse_speed: linkData.pulseSpeed || 200
            };

            const response = await canvasApi.createConnection(connectionData);
            console.log('✅ Connection persisted:', response.connection_id);

            // Update link with backend ID
            linkData.id = response.connection_id;

        } catch (error: any) {
            console.error('❌ Failed to persist connection:', error);

            // If validation failed, show user-friendly message
            if (error.message) {
                console.warn('⚠️ Connection validation failed:', error.message);
            }
        } finally {
            pendingConnectionCreations.current.delete(connectionKey);
        }
    }, [contextId, enabled]);

    /**
     * Debounced position update
     */
    const updateNodePosition = useCallback(
        async (nodeId: string, x: number, y: number) => {
            if (!enabled) return;

            try {
                await canvasApi.updateNodePosition(nodeId, x, y);
                console.log('✅ Node position updated');
            } catch (error) {
                console.error('❌ Failed to update node position:', error);
            }
        },
        [enabled]
    );

    /**
     * Delete node
     */
    const deleteNode = useCallback(async (nodeId: string) => {
        if (!enabled) return;

        try {
            await canvasApi.deleteNode(nodeId);
            console.log('✅ Node deleted');
        } catch (error) {
            console.error('❌ Failed to delete node:', error);
        }
    }, [enabled]);

    /**
     * Delete connection
     */
    const deleteConnection = useCallback(async (connectionId: string) => {
        if (!enabled) return;

        try {
            await canvasApi.deleteConnection(connectionId);
            console.log('✅ Connection deleted');
        } catch (error) {
            console.error('❌ Failed to delete connection:', error);
        }
    }, [enabled]);

    // Changing strategy: expose the API call wrapper
    const saveCameraPosition = useCallback(async (matrixId: string, x: number, y: number, zoom: number) => {
        if (!enabled) return;
        try {
            await canvasApi.updateCameraPosition(matrixId, x, y, zoom);
            console.log('✅ Camera position saved');
        } catch (error) {
            console.error('❌ Failed to save camera:', error);
        }
    }, [enabled]);

    // Load canvas state when context and engine are ready
    useEffect(() => {
        if (contextId && engine && enabled && !hasLoadedRef.current) {
            loadCanvasState();
        }
    }, [contextId, engine, enabled, loadCanvasState]);

    return {
        loadCanvasState,
        persistNodeCreation,
        persistConnectionCreation,
        updateNodePosition,
        deleteNode,
        deleteConnection,
        saveCameraPosition,
        isLoaded: hasLoadedRef.current
    };
};
