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
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const animationFrameRef = useRef<number>();

    // Update position to follow node during pan/zoom
    useEffect(() => {
        if (!visible) return;

        const updatePosition = () => {
            const [screenX, screenY] = camera.toScreen(node.x, node.y);
            // Node radius is 92px, add that + 20px gap to position panel to the right
            const nodeRadius = 92 * camera.zoom;
            const panelX = screenX + nodeRadius + 20;
            const panelY = screenY - 250; // Center vertically relative to node
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
                transform: `translate(${position.x}px, ${position.y}px)`,
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
            {/* Header */}
            <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#f9fafb'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        backgroundColor: node.solidColor || '#7F77F1',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: 'bold'
                    }}>
                        i
                    </div>
                    <h2 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: '#111827' }}>
                        {node.matrixName || 'Smart Matrix'}
                    </h2>
                </div>
                <button
                    onClick={onClose}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        fontSize: '20px',
                        cursor: 'pointer',
                        color: '#6b7280',
                        padding: '4px',
                        borderRadius: '4px',
                        lineHeight: 1
                    }}
                >
                    ×
                </button>
            </div>

            {/* Tabs */}
            <div style={{
                display: 'flex',
                borderBottom: '1px solid #e5e7eb',
                padding: '0 20px'
            }}>
                <button
                    onClick={() => setActiveTab('settings')}
                    style={{
                        padding: '12px 16px',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: activeTab === 'settings' ? '2px solid #7F77F1' : '2px solid transparent',
                        color: activeTab === 'settings' ? '#7F77F1' : '#6b7280',
                        fontWeight: 500,
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    Settings
                </button>
                <button
                    onClick={() => setActiveTab('data')}
                    style={{
                        padding: '12px 16px',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: activeTab === 'data' ? '2px solid #7F77F1' : '2px solid transparent',
                        color: activeTab === 'data' ? '#7F77F1' : '#6b7280',
                        fontWeight: 500,
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    Data Sources
                </button>
                <button
                    onClick={() => setActiveTab('output')}
                    style={{
                        padding: '12px 16px',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: activeTab === 'output' ? '2px solid #7F77F1' : '2px solid transparent',
                        color: activeTab === 'output' ? '#7F77F1' : '#6b7280',
                        fontWeight: 500,
                        cursor: 'pointer',
                        fontSize: '14px'
                    }}
                >
                    Output
                </button>
            </div>

            {/* Content */}
            <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
                {activeTab === 'settings' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div>
                            <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '11px', fontWeight: 600, color: '#6b7280', marginBottom: '6px' }}>
                                Node Name
                            </label>
                            <input
                                type="text"
                                defaultValue={node.matrixName}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    border: '1px solid #d1d5db',
                                    fontSize: '14px',
                                    color: '#1f2937'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '11px', fontWeight: 600, color: '#6b7280', marginBottom: '6px' }}>
                                Description
                            </label>
                            <textarea
                                rows={3}
                                placeholder="Enter a description for this matrix..."
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    border: '1px solid #d1d5db',
                                    fontSize: '14px',
                                    color: '#1f2937',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '11px', fontWeight: 600, color: '#6b7280', marginBottom: '6px' }}>
                                Execution Mode
                            </label>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
                                    <input type="radio" name="mode" defaultChecked /> Real-time
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
                                    <input type="radio" name="mode" /> Scheduled
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px' }}>
                                    <input type="radio" name="mode" /> Manual
                                </label>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'data' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>
                        <p>Data Source configuration coming soon</p>
                    </div>
                )}

                {activeTab === 'output' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#9ca3af' }}>
                        <p>Output configuration coming soon</p>
                    </div>
                )}
            </div>
        </div>
    );
};
