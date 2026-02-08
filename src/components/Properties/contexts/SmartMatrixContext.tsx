import React from 'react';
import type { ContextComponentProps } from '../registry/ContextTypes';

/**
 * Smart Matrix Context Component
 * Displays settings and configuration for Smart Matrix nodes
 */
export const SmartMatrixContext: React.FC<ContextComponentProps> = ({ nodeData, onClose }) => {
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
                    Smart Matrix Settings
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
                {/* Node Info */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>
                        Node ID
                    </label>
                    <div style={{ fontSize: '14px', color: '#374151', fontFamily: 'monospace', padding: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px' }}>
                        {nodeData?.id || 'N/A'}
                    </div>
                </div>

                {/* Name Field */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>
                        Name
                    </label>
                    <input
                        type="text"
                        defaultValue={nodeData?.name || 'Smart Matrix'}
                        style={{
                            width: '100%',
                            padding: '8px',
                            fontSize: '14px',
                            border: '1px solid rgba(0,0,0,0.1)',
                            borderRadius: '4px',
                            background: 'rgba(255,255,255,0.8)'
                        }}
                    />
                </div>

                {/* Description */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>
                        Description
                    </label>
                    <textarea
                        defaultValue={nodeData?.description || ''}
                        placeholder="Enter description..."
                        rows={3}
                        style={{
                            width: '100%',
                            padding: '8px',
                            fontSize: '14px',
                            border: '1px solid rgba(0,0,0,0.1)',
                            borderRadius: '4px',
                            background: 'rgba(255,255,255,0.8)',
                            resize: 'vertical'
                        }}
                    />
                </div>

                {/* Mode Selector */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>
                        Mode
                    </label>
                    <select
                        defaultValue={nodeData?.mode || 'standard'}
                        style={{
                            width: '100%',
                            padding: '8px',
                            fontSize: '14px',
                            border: '1px solid rgba(0,0,0,0.1)',
                            borderRadius: '4px',
                            background: 'rgba(255,255,255,0.8)'
                        }}
                    >
                        <option value="standard">Standard</option>
                        <option value="advanced">Advanced</option>
                        <option value="debug">Debug</option>
                    </select>
                </div>

                {/* Status Badge */}
                <div style={{ marginTop: '24px', padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                        <span style={{ fontSize: '12px', color: '#059669', fontWeight: 600 }}>Active</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmartMatrixContext;
