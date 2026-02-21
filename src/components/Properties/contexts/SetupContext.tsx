import React, { useState } from 'react';
import type { ContextComponentProps } from '../registry/ContextTypes';
import { contextApi } from '@/lib/api';

/**
 * SetupContext Component
 * 
 * Rendered in the right-side panel when context.setup === true.
 * This "locks" the node's protocol. The user must explicitly choose
 * to change the protocol, which resets setup to false.
 */
export const SetupContext: React.FC<ContextComponentProps & { contextId?: string; onSetupDisabled?: () => void }> = ({
    nodeData,
    onClose,
    contextId,
    onSetupDisabled,
}) => {
    const [isChanging, setIsChanging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Get current protocol info from nodeData
    const protocolName = nodeData?.context_type || nodeData?.protocol_name || 'Active Protocol';
    const nodeName = nodeData?.node_name || nodeData?.name || 'This Node';
    const effectiveContextId = contextId || nodeData?.context_id;

    const handleChangeProtocol = async () => {
        if (!effectiveContextId) {
            setError('No context ID found. Cannot change setup mode.');
            return;
        }
        setIsChanging(true);
        setError(null);
        try {
            await contextApi.updateContextSetup(effectiveContextId, false);
            console.log('✅ Setup mode disabled for context:', effectiveContextId);
            onSetupDisabled?.();
        } catch (err: any) {
            console.error('❌ Failed to disable setup mode:', err);
            setError('Failed to update. Please try again.');
        } finally {
            setIsChanging(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
            fontFamily: "'Work Sans', sans-serif",
        }}>
            {/* Header */}
            <div style={{
                padding: '16px',
                borderBottom: '1px solid rgba(0,0,0,0.08)',
                background: 'rgba(249, 250, 251, 0.7)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Lock icon */}
                    <span style={{ fontSize: '16px' }}>🔒</span>
                    <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                        Setup Mode
                    </h3>
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            fontSize: '18px',
                            cursor: 'pointer',
                            color: '#6b7280',
                            lineHeight: 1,
                        }}
                    >
                        ×
                    </button>
                )}
            </div>

            {/* Content */}
            <div style={{ flex: 1, padding: '24px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>

                {/* Status Badge */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '14px 16px',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)',
                    borderRadius: '10px',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                }}>
                    <div style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        background: '#6366f1',
                        boxShadow: '0 0 6px rgba(99, 102, 241, 0.6)',
                        flexShrink: 0,
                    }} />
                    <div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#4338ca' }}>
                            Protocol Active
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                            {protocolName}
                        </div>
                    </div>
                </div>

                {/* Explanation */}
                <div style={{ fontSize: '13px', color: '#4b5563', lineHeight: 1.6 }}>
                    <strong style={{ color: '#374151' }}>{nodeName}</strong> is running in setup mode.
                    The current protocol is active and locked. All canvas nodes are configured based on this setup.
                </div>

                <div style={{
                    padding: '12px 14px',
                    background: 'rgba(251, 191, 36, 0.08)',
                    borderRadius: '8px',
                    border: '1px solid rgba(251, 191, 36, 0.2)',
                    fontSize: '12px',
                    color: '#92400e',
                    lineHeight: 1.5,
                }}>
                    ⚠️ Changing the protocol will <strong>remove the current canvas setup</strong> and require reconfiguration.
                </div>

                {/* Error */}
                {error && (
                    <div style={{
                        padding: '10px 14px',
                        background: 'rgba(239, 68, 68, 0.08)',
                        borderRadius: '8px',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        fontSize: '12px',
                        color: '#b91c1c',
                    }}>
                        ❌ {error}
                    </div>
                )}
            </div>

            {/* Footer: Change Protocol Action */}
            <div style={{
                padding: '16px 20px',
                borderTop: '1px solid rgba(0,0,0,0.08)',
                background: 'rgba(249, 250, 251, 0.7)',
            }}>
                <button
                    onClick={handleChangeProtocol}
                    disabled={isChanging}
                    style={{
                        width: '100%',
                        padding: '10px 16px',
                        background: isChanging
                            ? 'rgba(107,114,128,0.3)'
                            : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        color: isChanging ? '#9ca3af' : '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: isChanging ? 'not-allowed' : 'pointer',
                        fontFamily: "'Work Sans', sans-serif",
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '6px',
                    }}
                >
                    {isChanging ? (
                        <>⏳ Updating...</>
                    ) : (
                        <>🔓 Change Protocol</>
                    )}
                </button>
                <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#9ca3af', textAlign: 'center' }}>
                    This will unlock the node and open the protocol selection.
                </p>
            </div>
        </div>
    );
};

export default SetupContext;
