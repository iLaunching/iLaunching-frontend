import React, { useState, useEffect } from 'react';
import type { ContextComponentProps } from '../registry/ContextTypes';
import { protocolApi } from '@/lib/api';

interface MatrixProtocol {
    protocol_id: string;
    protocol_key: string;
    initial_instructions: string;
    context_framework: any;
    success_criteria: any;
    is_active: boolean;
}

/**
 * Smart Matrix Context Component
 * Displays settings and configuration for Smart Matrix nodes
 * Includes protocol selection from tbl_matrix_protocols
 */
export const SmartMatrixContext: React.FC<ContextComponentProps> = ({ nodeData, onClose }) => {
    const [protocols, setProtocols] = useState<MatrixProtocol[]>([]);
    const [selectedProtocol, setSelectedProtocol] = useState<string>('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch protocols on mount
    useEffect(() => {
        const fetchProtocols = async () => {
            try {
                setLoading(true);
                const response = await protocolApi.getProtocols();
                setProtocols(response.protocols);

                // Set default to GENESIS if available
                if (response.protocols.length > 0) {
                    const genesisProtocol = response.protocols.find(p => p.protocol_key === 'GENESIS');
                    setSelectedProtocol(genesisProtocol?.protocol_id || response.protocols[0].protocol_id);
                }
                setError(null);
            } catch (err) {
                console.error('Failed to fetch protocols:', err);
                setError('Failed to load protocols');
            } finally {
                setLoading(false);
            }
        };

        fetchProtocols();
    }, []);

    const currentProtocol = protocols.find(p => p.protocol_id === selectedProtocol);

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

                {/* Protocol Selector */}
                <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '4px' }}>
                        Matrix Protocol
                    </label>
                    {loading ? (
                        <div style={{ padding: '8px', fontSize: '14px', color: '#6b7280' }}>
                            Loading protocols...
                        </div>
                    ) : error ? (
                        <div style={{ padding: '8px', fontSize: '14px', color: '#ef4444' }}>
                            {error}
                        </div>
                    ) : (
                        <select
                            value={selectedProtocol}
                            onChange={(e) => setSelectedProtocol(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '8px',
                                fontSize: '14px',
                                border: '1px solid rgba(0,0,0,0.1)',
                                borderRadius: '4px',
                                background: 'rgba(255,255,255,0.8)'
                            }}
                        >
                            {protocols.map(protocol => (
                                <option key={protocol.protocol_id} value={protocol.protocol_id}>
                                    {protocol.protocol_key}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Protocol Details */}
                {currentProtocol && (
                    <div style={{ marginBottom: '16px' }}>
                        <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#6b7280', marginBottom: '8px' }}>
                            Protocol Details
                        </label>
                        <div style={{
                            padding: '12px',
                            background: 'rgba(249, 250, 251, 0.8)',
                            borderRadius: '8px',
                            border: '1px solid rgba(0,0,0,0.1)'
                        }}>
                            {/* Phase Badge */}
                            <div style={{ marginBottom: '12px' }}>
                                <span style={{
                                    display: 'inline-block',
                                    padding: '4px 12px',
                                    fontSize: '11px',
                                    fontWeight: 600,
                                    borderRadius: '12px',
                                    background: currentProtocol.protocol_key === 'GENESIS'
                                        ? 'rgba(251, 191, 36, 0.2)'
                                        : currentProtocol.protocol_key === 'CAMPAIGN'
                                            ? 'rgba(239, 68, 68, 0.2)'
                                            : 'rgba(59, 130, 246, 0.2)',
                                    color: currentProtocol.protocol_key === 'GENESIS'
                                        ? '#d97706'
                                        : currentProtocol.protocol_key === 'CAMPAIGN'
                                            ? '#dc2626'
                                            : '#2563eb'
                                }}>
                                    {currentProtocol.protocol_key}
                                </span>
                            </div>

                            {/* Focus Areas */}
                            {currentProtocol.context_framework?.focus_areas && (
                                <div style={{ marginBottom: '12px' }}>
                                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', marginBottom: '6px' }}>
                                        Focus Areas:
                                    </div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                        {currentProtocol.context_framework.focus_areas.map((area: string, idx: number) => (
                                            <span key={idx} style={{
                                                fontSize: '10px',
                                                padding: '3px 8px',
                                                background: 'rgba(255,255,255,0.8)',
                                                borderRadius: '4px',
                                                color: '#374151'
                                            }}>
                                                {area.replace(/_/g, ' ')}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Recommended Nodes */}
                            {currentProtocol.context_framework?.recommended_nodes && (
                                <div>
                                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#6b7280', marginBottom: '6px' }}>
                                        Recommended Nodes:
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#374151', lineHeight: 1.5 }}>
                                        {currentProtocol.context_framework.recommended_nodes.join(', ')}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

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
