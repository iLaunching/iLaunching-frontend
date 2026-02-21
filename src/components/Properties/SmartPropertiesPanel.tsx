import React, { useEffect, useState, useRef, Suspense, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Camera } from '../Canvas/core/Camera';
import { useContextRegistry } from './registry/ContextRegistry';
import { InAppChatInterface } from '../InAppChatInterface';
import { useChatHistory } from '../../hooks/useChatPrefetch';
import { nodeApi } from '../../lib/api';
import { SetupContext } from './contexts/SetupContext';

// Generic node interface - works with any node type
interface BaseNode {
    id: string;
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    [key: string]: any; // Allow additional properties
}

// Assuming SmartMatrixNode is a specific type of BaseNode, or defined elsewhere
// For now, I'll assume it's a placeholder for a more specific node type.
// If SmartMatrixNode is not defined, this would cause a type error.
// For the purpose of this edit, I will just replace BaseNode with SmartMatrixNode as requested.
interface SmartMatrixNode extends BaseNode { }


interface SmartPropertiesPanelProps {
    node: SmartMatrixNode;
    visible: boolean;
    onClose: () => void;
    camera: Camera;
    canvasContainerRef?: React.RefObject<HTMLDivElement>;
    style?: React.CSSProperties;
}

/**
 * Global Properties Panel with canvas-based positioning
 * - Renders directly in canvas (no Portal)
 * - Simple absolute positioning with transform
 * - RAF loop tracks camera movements
 * - React.memo prevents re-renders during panning
 * - Lazy loads context components
 */
export const SmartPropertiesPanel = React.memo<SmartPropertiesPanelProps>((({
    node,
    visible,
    onClose,
    camera,
    canvasContainerRef,
    style
}) => {
    const [leftWidth, setLeftWidth] = useState(450);
    const [isResizing, setIsResizing] = useState(false);
    const [position, setPosition] = useState<{ x: number, y: number } | null>(null);
    const rafRef = useRef<number | null>(null);

    // --- Setup flag state ---
    // Fetched from backend: determines if SetupContext or ContextComponent is shown
    const [isSetupMode, setIsSetupMode] = useState(false);
    const [contextId, setContextId] = useState<string | undefined>(undefined);
    const [setupLoading, setSetupLoading] = useState(true);
    const [resolvedNodeId, setResolvedNodeId] = useState<string | null>(null);

    const { data: chatHistory } = useChatHistory(node.id);

    // Get the context component for this node type (memoized in hook)
    const ContextComponent = useContextRegistry(node.type);

    // Fetch context data for this node to check the setup flag
    // context_id is stored on the node by useCanvasPersistence at load time
    useEffect(() => {
        if (!visible || !node.id) return;

        let isMounted = true;
        setSetupLoading(true);

        const fetchContextData = async () => {
            try {
                const apiClient = (await import('../../lib/api')).default;

                // context_id is set on the node at load time by useCanvasPersistence
                // Fall back to GET /node/{id} if for some reason it's missing
                let ctxId = (node as any).context_id as string | undefined;

                if (!ctxId) {
                    console.log(`📡 context_id missing on node ${node.id}, fetching from API...`);
                    const nodeResp = await apiClient.get(`/node/${node.id}`);
                    ctxId = nodeResp.data?.context_id;
                }

                if (!ctxId) {
                    console.warn(`⚠️ No context_id for node ${node.id}`);
                    if (isMounted) {
                        setResolvedNodeId(node.id);
                        setSetupLoading(false);
                    }
                    return;
                }

                if (isMounted) setContextId(ctxId);
                const ctxResp = await apiClient.get(`/context/${ctxId}`);
                const ctx = ctxResp.data;

                if (isMounted) {
                    setIsSetupMode(ctx?.setup === true);
                    console.log(`📋 Node ${node.id} → context ${ctxId} → setup:`, ctx?.setup);
                    setResolvedNodeId(node.id);
                }

            } catch (err) {
                console.warn('Could not fetch context for setup flag:', err);
                if (isMounted) {
                    setIsSetupMode(false);
                    setResolvedNodeId(node.id);
                }
            } finally {
                if (isMounted) setSetupLoading(false);
            }
        };

        fetchContextData();
        return () => { isMounted = false; };
    }, [visible, node.id, node.context_id]);

    // When user clicks "Change Protocol" in SetupContext, reset setup mode
    const handleSetupDisabled = useCallback(() => {
        setIsSetupMode(false);
        console.log('🔓 Setup mode disabled — showing node context');
    }, []);

    // Called by ContextComponent when a protocol is applied — immediately switches panel
    const handleSetupEnabled = useCallback(() => {
        setIsSetupMode(true);
        console.log('🔒 Setup mode enabled — switching to SetupContext');
    }, []);

    // Update position to follow node during pan/zoom
    useEffect(() => {
        if (!visible) return;

        const updatePosition = () => {
            // Panel dimensions
            const PANEL_WIDTH = 700;
            const PANEL_HEIGHT = 600;
            const GAP = 20;
            const PADDING = 20;

            // Get node's screen position (canvas-relative coordinates)
            const [nodeScreenX, nodeScreenY] = camera.toScreen(node.x, node.y);
            const nodeScreenWidth = node.width * camera.zoom;
            const nodeScreenHeight = node.height * camera.zoom;

            // Get canvas dimensions
            const canvasRect = canvasContainerRef?.current?.getBoundingClientRect();
            const canvasWidth = canvasRect?.width ?? window.innerWidth;
            const canvasHeight = canvasRect?.height ?? window.innerHeight;

            // HORIZONTAL POSITIONING
            // Try left side first (preferred)
            let panelX = nodeScreenX - PANEL_WIDTH - GAP;

            // If doesn't fit on left, try right side
            if (panelX < PADDING) {
                panelX = nodeScreenX + nodeScreenWidth + GAP;
            }

            // Clamp to canvas bounds
            panelX = Math.max(PADDING, Math.min(panelX, canvasWidth - PANEL_WIDTH - PADDING));

            // VERTICAL POSITIONING
            // Center panel on node's visual center
            const nodeCenterY = nodeScreenY + (nodeScreenHeight / 2);
            let panelY = nodeCenterY - (PANEL_HEIGHT / 2);

            // Clamp to canvas bounds
            panelY = Math.max(PADDING, Math.min(panelY, canvasHeight - PANEL_HEIGHT - PADDING));

            setPosition({ x: panelX, y: panelY });


            // Continue loop
            rafRef.current = requestAnimationFrame(updatePosition);
        };

        // Start the loop
        rafRef.current = requestAnimationFrame(updatePosition);

        return () => {
            if (rafRef.current) {
                cancelAnimationFrame(rafRef.current);
            }
        };
    }, [visible, node.x, node.y, node.width, node.height, camera]);

    // Handle resizing
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;
            setLeftWidth(prev => {
                const newWidth = prev + e.movementX;
                return Math.max(200, Math.min(newWidth, 500));
            });
        };

        const handleMouseUp = () => {
            setIsResizing(false);
        };

        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    if (!visible) return null;

    // Don't render until position is calculated to prevent flash in top-left
    if (!position) return null;

    return (
        <>
            {/* Properties Panel */}
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="smart-properties-panel"
                    style={{
                        position: 'absolute', // Changed from 'fixed' - now relative to canvas container!
                        left: `${position.x}px`,
                        top: `${position.y}px`,
                        width: '700px',
                        height: '600px',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(12px)',
                        WebkitBackdropFilter: 'blur(12px)',
                        borderRadius: '12px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        display: 'flex',
                        zIndex: 1000,
                        overflow: 'hidden',
                        border: '1px solid rgba(255, 255, 255, 0.18)',
                        pointerEvents: 'auto',
                        ...style
                    }}
                > {/* Left Section: Chat */}
                    <div style={{
                        width: leftWidth,
                        minWidth: 200,
                        display: 'flex',
                        flexDirection: 'column',
                        borderRight: '1px solid rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                            <InAppChatInterface
                                maxWidth="full"
                                placeholder="Ask about this node..."
                                className="h-full"
                                style={{ minHeight: '100%' }}
                                initialContent={chatHistory?.document_json} // Pass fetched history
                                onSaveChat={async (content) => {
                                    try {
                                        await nodeApi.saveChatHistory(node.id, content);
                                        console.log('✅ Chat history saved successfully');
                                    } catch (error) {
                                        console.error('❌ Failed to save chat history:', error);
                                    }
                                }}
                            />
                        </div>
                    </div>

                    {/* Resizer Handle */}
                    <div
                        onMouseDown={() => setIsResizing(true)}
                        style={{
                            width: '4px',
                            cursor: 'col-resize',
                            backgroundColor: isResizing ? '#7F77F1' : 'transparent',
                            transition: 'background-color 0.2s',
                            zIndex: 10
                        }}
                        onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#E5E7EB'}
                        onMouseOut={(e) => !isResizing && (e.currentTarget.style.backgroundColor = 'transparent')}
                    />

                    {/* Right Section: Context or Setup */}
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 200, overflow: 'hidden' }}>
                        <Suspense fallback={
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                height: '100%',
                                color: '#6b7280',
                                fontSize: '14px'
                            }}>
                                Loading context...
                            </div>
                        }>
                            {(setupLoading || node.id !== resolvedNodeId) ? (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                    color: '#6b7280',
                                    fontSize: '14px'
                                }}>
                                    Checking configuration...
                                </div>
                            ) : isSetupMode ? (
                                /* Setup mode: show the locked protocol view */
                                <SetupContext
                                    nodeData={node}
                                    onClose={onClose}
                                    contextId={contextId}
                                    onSetupDisabled={handleSetupDisabled}
                                />
                            ) : (
                                /* Normal mode: show the node-specific context */
                                <ContextComponent
                                    nodeData={node}
                                    onClose={onClose}
                                    onSetupEnabled={handleSetupEnabled}
                                />
                            )}
                        </Suspense>
                    </div>
                </motion.div>
            </AnimatePresence >
        </>
    );
}) as React.NamedExoticComponent<SmartPropertiesPanelProps>);

SmartPropertiesPanel.displayName = 'SmartPropertiesPanel';

export default SmartPropertiesPanel;

