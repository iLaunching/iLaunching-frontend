import React, { useEffect, useState, useRef, Suspense, useMemo } from 'react';
import { useFloating, offset, flip, shift, autoUpdate } from '@floating-ui/react';
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

interface SmartPropertiesPanelProps {
    node: BaseNode;
    visible: boolean;
    onClose: () => void;
    camera: Camera;
    style?: React.CSSProperties;
}

/**
 * Global Properties Panel with Floating UI positioning and performance optimizations
 * - Uses @floating-ui/react for smart positioning
 * - Wrapped in React.memo to prevent re-renders during canvas panning
 * - Lazy loads context components
 * - Smooth transitions with Framer Motion
 */
export const SmartPropertiesPanel = React.memo<SmartPropertiesPanelProps>(({
    node,
    visible,
    onClose,
    camera,
    style
}) => {
    const [leftWidth, setLeftWidth] = useState(450);
    const [isResizing, setIsResizing] = useState(false);

    // Get the context component for this node type (memoized in hook)
    const ContextComponent = useContextRegistry(node.type);

    // Calculate screen position from world coordinates
    const screenPosition = useMemo(() => {
        const [screenX, screenY] = camera.toScreen(node.x, node.y);
        return {
            x: screenX,
            y: screenY,
            width: node.width * camera.zoom,
            height: node.height * camera.zoom
        };
    }, [node.x, node.y, node.width, node.height, camera]);

    // Floating UI setup
    const { refs, floatingStyles, update } = useFloating({
        placement: 'right-start',
        middleware: [
            offset(20), // 20px gap from node
            flip(), // Flip to left if no space on right
            shift({ padding: 20 }) // Keep within viewport with 20px padding
        ],
        whileElementsMounted: autoUpdate
    });

    // Set virtual element as reference for Floating UI
    useEffect(() => {
        if (visible && screenPosition) {
            refs.setReference({
                getBoundingClientRect: () => ({
                    x: screenPosition.x,
                    y: screenPosition.y,
                    width: screenPosition.width,
                    height: screenPosition.height,
                    top: screenPosition.y,
                    left: screenPosition.x,
                    right: screenPosition.x + screenPosition.width,
                    bottom: screenPosition.y + screenPosition.height
                })
            });
            update?.();
        }
    }, [visible, screenPosition, refs, update]);

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
                    ref={refs.setFloating}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    className="smart-properties-panel"
                    style={{
                        ...floatingStyles,
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
                >
                    {/* Left Section: Chat */}
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

                    {/* Right Section: Dynamic Context */}
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
