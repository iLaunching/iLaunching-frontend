import React, { useEffect, useState, useRef, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Camera } from '../Canvas/core/Camera';
import { useContextRegistry } from './registry/ContextRegistry';

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
export const SmartPropertiesPanel = React.memo<SmartPropertiesPanelProps>(({
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
    const rafRef = useRef<number>();

    // Get the context component for this node type (memoized in hook)
    const ContextComponent = useContextRegistry(node.type);

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

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="smart-properties-panel"
                    style={{
                        position: 'absolute', // Changed from 'fixed' - now relative to canvas container!
                        left: `${position?.x ?? 0}px`,
                        top: `${position?.y ?? 0}px`,
                        opacity: position ? 1 : 0,
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
                        <div style={{ padding: '16px', borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
                            <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                                Chat
                            </h3>
                        </div>
                        <div style={{ flex: 1, padding: '16px', color: '#6b7280', fontSize: '13px' }}>
                            Chat interface coming soon...
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
                            <ContextComponent nodeData={node} onClose={onClose} />
                        </Suspense>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}, (prevProps, nextProps) => {
    // Custom comparison: only re-render if node ID, visibility, or camera zoom changes significantly
    // This prevents re-renders during canvas panning
    return (
        prevProps.node.id === nextProps.node.id &&
        prevProps.visible === nextProps.visible &&
        Math.abs(prevProps.camera.zoom - nextProps.camera.zoom) < 0.01
    );
});

SmartPropertiesPanel.displayName = 'SmartPropertiesPanel';

export default SmartPropertiesPanel;
