import React, { useEffect, useState, useRef } from 'react';
import { SmartMatrixNode } from '../Canvas/nodes/SmartMatrixNode';
import type { Camera } from '../Canvas/core/Camera';

interface SmartMatrixPropertiesProps {
    node: SmartMatrixNode;
    visible: boolean;
    onClose: () => void;
    camera: Camera;
    style?: React.CSSProperties;
}

export const SmartMatrixProperties: React.FC<SmartMatrixPropertiesProps> = ({
    node,
    visible,
    onClose,
    camera,
    style
}) => {
    const [activeTab, setActiveTab] = useState('settings');
    const [position, setPosition] = useState<{ x: number, y: number } | null>(null);
    const animationFrameRef = useRef<number>();
    const [leftWidth, setLeftWidth] = useState(300); // Initial width for left section
    const [isResizing, setIsResizing] = useState(false);

    // Update position to follow node during pan/zoom
    // Use layout effect to calculate initial position before paint
    useEffect(() => {
        if (!visible) return;

        const updatePosition = () => {
            const width = 700; // Updated width
            const height = 600; // Updated height for split view
            const gap = 20;

            const [screenX, screenY] = camera.toScreen(node.x, node.y);

            // Default: Position at right edge
            let panelX = screenX + (node.width * camera.zoom) + gap;

            // Check if panel goes off the right edge of the viewport
            if (panelX + width > window.innerWidth) {
                // Try positioning at left edge
                const leftPanelX = screenX - width - gap;

                // If left side fits (or has more space than right), use left
                if (leftPanelX > 0) {
                    panelX = leftPanelX;
                }
                // If neither fits perfectly, logic usually stays on the side with more space or clamps
                // For now, strict flip to left if right overflows
            }

            // Vertical positioning: Center relative to node
            let panelY = screenY - height / 2 + (node.height * camera.zoom) / 2;

            // Clamp vertical position to viewport edges with some padding
            const verticalPadding = 20;
            const maxPanelY = window.innerHeight - height - verticalPadding;
            const minPanelY = verticalPadding;

            panelY = Math.max(minPanelY, Math.min(panelY, maxPanelY));

            setPosition({ x: panelX, y: panelY });

            // Continue updating on next frame
            animationFrameRef.current = requestAnimationFrame(updatePosition);
        };

        updatePosition();

        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [visible, node.x, node.y, node.width, camera]);

    // Handle resizing
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;

            // Calculate new width relative to panel left edge
            // We need to know panel static position or just use movementX
            // Simplest is to track movement delta if we don't have ref to panel rect easily
            // But better to use clientX if we can get panel offset

            // Since panel moves with camera, using movementX is safer for relative resizing
            // but might drift.
            // Better: update width based on delta
            setLeftWidth(prev => {
                const newWidth = prev + e.movementX;
                return Math.max(200, Math.min(newWidth, 500)); // Clamp between 200 and 500
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
        <div
            className="smart-matrix-properties-panel"
            style={{
                position: 'absolute',
                transform: position ? `translate(${position.x}px, ${position.y}px)` : undefined,
                opacity: position ? 1 : 0,
                willChange: 'transform',
                width: '700px', // Reduced width
                height: '600px', // Increased height
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                display: 'flex',
                zIndex: 100,
                overflow: 'hidden',
                border: '1px solid #e5e7eb',
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
                borderRight: '1px solid #e5e7eb'
            }}>
                <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb', background: '#f9fafb' }}>
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#374151' }}>Chat Section</h3>
                </div>
                <div style={{ flex: 1, padding: '16px' }}>
                    {/* Chat content placeholder */}
                    <div style={{ color: '#9ca3af', fontSize: '14px', textAlign: 'center', marginTop: '40px' }}>
                        Chat interface coming soon
                    </div>
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

            {/* Right Section: Main Context Options */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 200 }}>
                <div style={{
                    padding: '16px',
                    borderBottom: '1px solid #e5e7eb',
                    background: '#f9fafb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#374151' }}>Main Context Options</h3>
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
                <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
                    {/* Main Options content can go here */}
                    <p style={{ color: '#6b7280', fontSize: '14px' }}>
                        Context and node settings will appear here.
                    </p>
                </div>
            </div>
        </div>
    );
};
