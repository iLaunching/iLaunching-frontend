import React, { useState } from 'react';
import type { ContextComponentProps } from '../registry/ContextTypes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';
import { useQuery } from '@tanstack/react-query';
import api, { contextApi } from '@/lib/api';

/**
 * SetupContext Component
 *
 * Rendered in the right-side panel when context.setup === true.
 * Mirrors the navigation bar style of SmartMatrixContext.
 */
export const SetupContext: React.FC<ContextComponentProps & { contextId?: string; onSetupDisabled?: () => void }> = ({
    nodeData,
    contextId,
    onSetupDisabled,
}) => {
    const [activeTab, setActiveTab] = useState<'setup' | 'settings'>('setup');
    const [isChanging, setIsChanging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const effectiveContextId = contextId || (nodeData as any)?.context_id;

    // Fetch theme colors (same pattern as SmartMatrixContext)
    const { data: hubData } = useQuery({
        queryKey: ['current-smart-hub'],
        queryFn: async () => {
            const response = await api.get('/users/me/current-smart-hub');
            return response.data;
        }
    });

    const globalHoverColor = hubData?.theme?.global_button_hover || 'rgba(0, 0, 0, 0.05)';
    const solidColor = hubData?.theme?.solid_color || '#3b82f6';
    const textColor = hubData?.theme?.text || '#374151';
    const borderLineColor = hubData?.theme?.border_line_color_light || 'rgba(255, 255, 255, 0.2)';

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
            {/* Navigation Bar — matches SmartMatrixContext style */}
            <div style={{
                padding: '10px 10px 0px 10px',
                borderBottom: `1px solid ${borderLineColor}`,
                height: 'fit-content',
            }}>
                <div style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '8px',
                }}>
                    {/* Setup Tab */}
                    <button
                        onClick={() => setActiveTab('setup')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '0px 8px',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === 'setup' ? `2px solid ${solidColor}` : '2px solid transparent',
                            borderRadius: activeTab === 'setup' ? '0px' : '8px',
                            cursor: 'pointer',
                            fontFamily: 'Work Sans, sans-serif',
                            fontSize: '14px',
                            fontWeight: 400,
                            height: '30px',
                            color: activeTab === 'setup' ? solidColor : textColor,
                            transition: 'all 0.2s ease',
                            userSelect: 'none',
                        }}
                        onMouseEnter={(e) => {
                            if (activeTab !== 'setup') {
                                e.currentTarget.style.backgroundColor = globalHoverColor;
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        <FontAwesomeIcon icon={solidIcons.faLock} style={{ fontSize: '13px' }} />
                        <span>Setup</span>
                    </button>

                    {/* Settings Tab */}
                    <button
                        onClick={() => setActiveTab('settings')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '0px 8px',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === 'settings' ? `2px solid ${solidColor}` : '2px solid transparent',
                            borderRadius: activeTab === 'settings' ? '0px' : '8px',
                            cursor: 'pointer',
                            fontFamily: 'Work Sans, sans-serif',
                            fontSize: '14px',
                            fontWeight: 400,
                            height: '30px',
                            color: activeTab === 'settings' ? solidColor : textColor,
                            transition: 'all 0.2s ease',
                            userSelect: 'none',
                        }}
                        onMouseEnter={(e) => {
                            if (activeTab !== 'settings') {
                                e.currentTarget.style.backgroundColor = globalHoverColor;
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        <FontAwesomeIcon icon={solidIcons.faGear} style={{ fontSize: '14px' }} />
                        <span>Settings</span>
                    </button>
                </div>
            </div>

            {/* Content Container */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {/* Setup Tab Content */}
                {activeTab === 'setup' && (
                    <div style={{ padding: '18px 10px 10px 10px' }}>
                        {/* Setup tab content goes here */}
                    </div>
                )}

                {/* Settings Tab Content */}
                {activeTab === 'settings' && (
                    <div style={{ padding: '18px 10px 10px 10px' }}>
                        {/* Settings tab content goes here */}
                    </div>
                )}
            </div>

            {/* Footer: Change Protocol action — kept for redesign */}
            {error && (
                <div style={{
                    padding: '8px 12px',
                    margin: '0 10px',
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
    );
};

export default SetupContext;
