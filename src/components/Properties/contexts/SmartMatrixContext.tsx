
import React from 'react';
import { ContextComponentProps } from '../registry/ContextTypes';
import { useSmartMatrix } from '../../../hooks/useSmartMatrix';

export const SmartMatrixContext: React.FC<ContextComponentProps> = ({ nodeId }) => {
    // In the future, we'll fetch data using useSmartMatrix(nodeId)
    // For now, placeholders

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Settings Section */}
            <div>
                <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '11px', fontWeight: 600, color: '#6b7280', marginBottom: '6px' }}>
                    Matrix Name (Coming Soon)
                </label>
                <input
                    type="text"
                    placeholder="Matrix Name"
                    disabled
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid rgba(0,0,0,0.1)',
                        background: 'rgba(255,255,255,0.5)',
                        fontSize: '14px',
                        color: '#1f2937'
                    }}
                />
            </div>

            <div>
                <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '11px', fontWeight: 600, color: '#6b7280', marginBottom: '6px' }}>
                    Description (Coming Soon)
                </label>
                <textarea
                    rows={3}
                    placeholder="Description..."
                    disabled
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: '1px solid rgba(0,0,0,0.1)',
                        background: 'rgba(255,255,255,0.5)',
                        fontSize: '14px',
                        color: '#1f2937',
                        resize: 'vertical'
                    }}
                />
            </div>
        </div>
    );
};
