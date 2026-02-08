
import React from 'react';
import { ContextComponentProps } from '../registry/ContextTypes';

export const SmartRouterContext: React.FC<ContextComponentProps> = ({ nodeId }) => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ padding: '12px', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '8px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                <p style={{ margin: 0, fontSize: '13px', color: '#4338ca', fontWeight: 500 }}>
                    Router Configuration
                </p>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6366f1' }}>
                    Manage input/output ports and routing logic here.
                </p>
            </div>

            {/* Input Ports Placeholder */}
            <div>
                <label style={{ display: 'block', textTransform: 'uppercase', fontSize: '11px', fontWeight: 600, color: '#6b7280', marginBottom: '6px' }}>
                    Input Ports
                </label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <div style={{ padding: '4px 8px', background: 'rgba(0,0,0,0.05)', borderRadius: '4px', fontSize: '12px' }}>Default Input</div>
                    <button style={{ padding: '4px 8px', background: '#f3f4f6', borderRadius: '4px', fontSize: '12px', border: 'none', cursor: 'pointer' }}>+ Add Input</button>
                </div>
            </div>
        </div>
    );
};
