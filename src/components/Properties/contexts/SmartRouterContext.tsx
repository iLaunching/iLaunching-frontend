import React from 'react';
import type { ContextComponentProps } from '../registry/ContextTypes';

/**
 * Smart Router Context Component
 * Displays port configuration and routing rules for Smart Router nodes
 */
export const SmartRouterContext: React.FC<ContextComponentProps> = ({ nodeData, onClose }) => {
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
                    Smart Router Configuration
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
                        Router ID
                    </label>
                    <div style={{ fontSize: '14px', color: '#374151', fontFamily: 'monospace', padding: '8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px' }}>
                        {nodeData?.id || 'N/A'}
                    </div>
                </div>

                {/* Input Ports */}
                <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase' }}>
                        Input Ports
                    </h4>
                    <div style={{ padding: '12px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '14px', color: '#1e40af', fontWeight: 500 }}>Primary Input</span>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }} />
                        </div>
                    </div>
                </div>

                {/* Output Ports */}
                <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '8px', textTransform: 'uppercase' }}>
                        Output Ports
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {[1, 2, 3].map((port) => (
                            <div key={port} style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '14px', color: '#059669', fontWeight: 500 }}>Output {port}</span>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Routing Mode */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>
                        Routing Mode
                    </label>
                    <select
                        defaultValue="round-robin"
                        style={{
                            width: '100%',
                            padding: '8px',
                            fontSize: '14px',
                            border: '1px solid rgba(0,0,0,0.1)',
                            borderRadius: '4px',
                            background: 'rgba(255,255,255,0.8)'
                        }}
                    >
                        <option value="round-robin">Round Robin</option>
                        <option value="priority">Priority</option>
                        <option value="conditional">Conditional</option>
                    </select>
                </div>

                {/* Add Port Button */}
                <button
                    style={{
                        width: '100%',
                        padding: '10px',
                        marginTop: '16px',
                        background: 'rgba(99, 102, 241, 0.1)',
                        border: '1px dashed rgba(99, 102, 241, 0.3)',
                        borderRadius: '6px',
                        color: '#6366f1',
                        fontSize: '14px',
                        fontWeight: 500,
                        cursor: 'pointer'
                    }}
                >
                    + Add Output Port
                </button>
            </div>
        </div>
    );
};

export default SmartRouterContext;
