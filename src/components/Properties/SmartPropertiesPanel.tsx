
import React, { useEffect, useState, useRef } from 'react';
import { useCameraStore } from '../../store/useCameraStore';
import { getContextDefinition } from './registry/ContextRegistry';

interface SmartPropertiesPanelProps {
    nodeId: string | null;
    nodeType: string | null;
    isOpen: boolean;
    onClose: () => void;
    // We pass the node object itself for positioning
    anchorNode: any | null;
}

const SmartPropertiesPanel: React.FC<SmartPropertiesPanelProps> = ({
    nodeId,
    nodeType,
    isOpen,
    onClose,
    anchorNode
}) => {
    const { camera, zoom } = useCameraStore();
    const [position, setPosition] = useState<{ x: number, y: number } | null>(null);
    const animationFrameRef = useRef<number>();
    const [leftWidth, setLeftWidth] = useState(450); // Initial width for left section
    const [isResizing, setIsResizing] = useState(false);

    // Get the definition from registry based on node type
    const contextDefinition = nodeType ? getContextDefinition(nodeType) : null;
    const ContextComponent = contextDefinition?.Component;

    // Update position to follow node during pan/zoom
    useEffect(() => {
        if (!isOpen || !anchorNode) return;

        const updatePosition = () => {
            const width = 700; // Panel Width
            const height = 600; // Panel Height
            const gap = 20;

            // Calculate screen position of the node
            // Assuming anchorNode has x, y (from SmartMatrix logic)
            const nodeX = anchorNode.position?.x ?? anchorNode.x ?? 0;
            const nodeY = anchorNode.position?.y ?? anchorNode.y ?? 0;
            const nodeWidth = anchorNode.width ?? 300; // Fallback width

            const screenX = (nodeX + camera.x) * camera.zoom;
            const screenY = (nodeY + camera.y) * camera.zoom;
            const scaledNodeWidth = nodeWidth * camera.zoom;


            // Initial position: Right side of the node
            let panelX = screenX + scaledNodeWidth + gap;

            // Align tops but clamp to viewport
            let panelY = screenY;

            // Check right overflow
            if (panelX + width > window.innerWidth) {
                // Try left side
                const leftPanelX = screenX - width - gap;
                if (leftPanelX > 0) {
                    panelX = leftPanelX;
                }
            }

            // Clamp vertical position
            const minPanelY = 20;
            const maxPanelY = window.innerHeight - height - 20;
            panelY = Math.max(minPanelY, Math.min(panelY, maxPanelY));

            setPosition({ x: panelX, y: panelY });

            animationFrameRef.current = requestAnimationFrame(updatePosition);
        };

        updatePosition();

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [isOpen, anchorNode, camera, zoom]);

    // Handle resizing (Chat Section)
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;

            setLeftWidth(prev => {
                const newWidth = prev + e.movementX;
                return Math.max(200, Math.min(newWidth, 500)); // Clamp between 200 and 500
            });
        };

        const handleMouseUp = () => setIsResizing(false);

        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    if (!isOpen || !anchorNode) return null;

    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                transform: position ? `translate(${position.x}px, ${position.y}px)` : undefined,
                opacity: position ? 1 : 0,
                willChange: 'transform',
                width: '700px',
                height: '600px',
                backgroundColor: 'rgba(255, 255, 255, 0.15)', // Glass
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                borderRadius: '16px',
                boxShadow: 'none',
                border: '1px solid rgba(255, 255, 255, 0.18)',
                display: 'flex',
                zIndex: 100,
                overflow: 'hidden',
                pointerEvents: 'auto'
            }}
        >
            {/* Left Section: Chat (Persistent) */}
            <div style={{
                width: leftWidth,
                minWidth: 200,
                display: 'flex',
                flexDirection: 'column',
                borderRight: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
                {/* Chat Interface Placeholder */}
                <div style={{ padding: '16px', color: 'rgba(0,0,0,0.4)', fontSize: '13px', textAlign: 'center', marginTop: '40px' }}>
                    Chat Interface
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
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.3)'}
                onMouseOut={(e) => !isResizing && (e.currentTarget.style.backgroundColor = 'transparent')}
            />

            {/* Right Section: Dynamic Context Options */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 200 }}>
                {/* Generic Header */}
                <div style={{
                    padding: '16px',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(255,255,255,0.05)'
                }}>
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                        {contextDefinition?.title || 'Properties'}
                    </h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            fontSize: '18px',
                            cursor: 'pointer',
                            color: '#6b7280',
                            lineHeight: 1
                        }}
                    >
                        ×
                    </button>
                </div>

                {/* Dynamic Content */}
                <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
                    {ContextComponent && nodeId ? (
                        <ContextComponent nodeId={nodeId} />
                    ) : (
                        <div style={{ color: '#9ca3af', fontSize: '13px', textAlign: 'center', marginTop: '20px' }}>
                            Select a node to view properties
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SmartPropertiesPanel;
