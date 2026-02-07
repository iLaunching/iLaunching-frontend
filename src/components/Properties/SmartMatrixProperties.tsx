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

    // Update position to follow node during pan/zoom
    // Use layout effect to calculate initial position before paint
    useEffect(() => {
        if (!visible) return;

        const updatePosition = () => {
            const [screenX, screenY] = camera.toScreen(node.x, node.y);
            // Position at right edge: Left + Width + Gap
            // Previous code used width/2 which put it at the center!
            const panelX = screenX + (node.width * camera.zoom) + 20;
            const panelY = screenY - 250 + (node.height * camera.zoom) / 2; // Center vertically relative to node center
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

    if (!visible) return null;

    return (
        <div
            className="smart-matrix-properties-panel"
            style={{
                position: 'absolute',
                transform: position ? `translate(${position.x}px, ${position.y}px)` : undefined,
                opacity: position ? 1 : 0, // Hide until positioned
                willChange: 'transform',
                width: '600px',
                height: '500px',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                zIndex: 100,
                overflow: 'hidden',
                border: '1px solid #e5e7eb',
                pointerEvents: 'auto',
                ...style
            }}
        >
        </div>
    );
};
