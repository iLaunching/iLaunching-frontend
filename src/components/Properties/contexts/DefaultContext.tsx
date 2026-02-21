import React from 'react';
import type { ContextComponentProps } from '../registry/ContextTypes';

/**
 * Default Context Component
 * Fallback component for unknown or unsupported node types
 */
export const DefaultContext: React.FC<ContextComponentProps> = ({ nodeData, onClose }) => {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                padding: '16px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(249, 250, 251, 0.5)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                    Node Properties
                </h3>
                {onClose && (
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
                )}
            </div>

            {/* Content */}
            <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
                {/* Info Message */}
                <div style={{
                    padding: '12px',
                    background: 'rgba(251, 191, 36, 0.1)',
                    borderRadius: '8px',
                    border: '1px solid rgba(251, 191, 36, 0.2)',
                    marginBottom: '16px'
                }}>
                    <p style={{ margin: 0, fontSize: '13px', color: '#92400e' }}>
                        ⚠️ No specific context component found for this node type.
                    </p>
                </div>

                {/* Node Type */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>
                        Node Type
                    </label>
                    <div style={{ fontSize: '14px', color: '#374151', padding: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px' }}>
                        {nodeData?.type || 'Unknown'}
                    </div>
                </div>

                {/* Node ID */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>
                        Node ID
                    </label>
                    <div style={{ fontSize: '14px', color: '#374151', fontFamily: 'monospace', padding: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px' }}>
                        {nodeData?.id || 'N/A'}
                    </div>
                </div>

                {/* Position */}
                {nodeData?.x !== undefined && nodeData?.y !== undefined && (
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>
                            Position
                        </label>
                        <div style={{ fontSize: '14px', color: '#374151', fontFamily: 'monospace', padding: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px' }}>
                            x: {Math.round(nodeData.x)}, y: {Math.round(nodeData.y)}
                        </div>
                    </div>
                )}

                {/* Raw Data (Debug) */}
                <div style={{ marginTop: '24px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>
                        Debug Data
                    </label>
                    <pre style={{
                        fontSize: '11px',
                        color: '#6b7280',
                        background: 'rgba(0,0,0,0.05)',
                        padding: '12px',
                        borderRadius: '4px',
                        overflow: 'auto',
                        maxHeight: '200px'
                    }}>
                        {JSON.stringify(nodeData, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default DefaultContext;
