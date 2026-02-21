import React, { useState, useRef, useEffect } from 'react';
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
    const [activeTab, setActiveTab] = useState<'setup' | 'input' | 'output' | 'settings'>('setup');
    const [isChanging, setIsChanging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [showLeftScroll, setShowLeftScroll] = useState(false);
    const [showRightScroll, setShowRightScroll] = useState(true);

    const effectiveContextId = contextId || (nodeData as any)?.context_id;

    // Fetch theme colors (same pattern as SmartMatrixContext)
    const { data: hubData } = useQuery({
        queryKey: ['current-smart-hub'],
        queryFn: async () => {
            const response = await api.get('/users/me/current-smart-hub');
            return response.data;
        }
    });

    // Extract theme colors from hub data (same pattern as SmartMatrixContext)
    const globalHoverColor = hubData?.theme?.global_button_hover || 'rgba(0, 0, 0, 0.05)';
    const solidColor = hubData?.theme?.solid_color || '#3b82f6';
    const textColor = hubData?.theme?.text || '#374151';
    const borderLineColor = hubData?.theme?.border_line_color_light || 'rgba(255, 255, 255, 0.2)';

    // Danger theme colors (same variables as General.tsx danger section)
    const dangerToneBk = hubData?.theme?.danger_tone_bk || 'rgba(239, 68, 68, 0.06)';
    const dangerToneBorder = hubData?.theme?.danger_tone_border || '#ef4444';
    const dangerToneText = hubData?.theme?.danger_tone_text || '#dc2626';
    const dangerBkLight = hubData?.theme?.danger_bk_light_color || 'rgba(239, 68, 68, 0.08)';
    const dangerBkSolid = hubData?.theme?.danger_bk_solid_color || '#ef4444';

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

    // Faded edges mask effect
    const maskStyle = {
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)',
        maskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)',
    };

    const checkScrollButtons = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setShowLeftScroll(scrollLeft > 0);
            // Add a 1px tolerance for floating point rounding differences
            setShowRightScroll(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
        }
    };

    useEffect(() => {
        // Initial check once container mounts
        checkScrollButtons();
        // Also check if window resizes affecting the container
        window.addEventListener('resize', checkScrollButtons);
        return () => window.removeEventListener('resize', checkScrollButtons);
    }, []);

    const handleScroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = 150; // Amount to scroll per click
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
            // checkScrollButtons will fire via the onScroll event handler
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
                position: 'relative',
                padding: '10px 10px 0px 10px',
                borderBottom: `1px solid ${borderLineColor}`,
                height: 'fit-content',
                display: 'flex',
                alignItems: 'center',
            }}>
                {showLeftScroll && (
                    <button
                        onClick={() => handleScroll('left')}
                        style={{
                            position: 'absolute',
                            left: '4px',
                            zIndex: 10,
                            background: 'transparent',
                            border: 'none',
                            color: textColor,
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0.7,
                            transition: 'opacity 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
                    >
                        <FontAwesomeIcon icon={solidIcons.faChevronLeft} style={{ fontSize: '12px' }} />
                    </button>
                )}

                <div
                    ref={scrollContainerRef}
                    onScroll={checkScrollButtons}
                    className="no-scrollbar"
                    style={{
                        ...maskStyle,
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '2px', // Reduced from 8px to bring buttons closer
                        overflowX: 'auto',
                        width: '100%',
                        padding: '0 10px', // Reduced from 24px to match left alignment better
                        scrollBehavior: 'smooth',
                        msOverflowStyle: 'none',  // IE and Edge
                        scrollbarWidth: 'none',  // Firefox
                    }}
                >
                    <style>
                        {`
                        .no-scrollbar::-webkit-scrollbar {
                            display: none;
                        }
                        `}
                    </style>
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
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
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

                    {/* Input Nodes Tab */}
                    <button
                        onClick={() => setActiveTab('input')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '0px 8px',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === 'input' ? `2px solid ${solidColor}` : '2px solid transparent',
                            borderRadius: activeTab === 'input' ? '0px' : '8px',
                            cursor: 'pointer',
                            fontFamily: 'Work Sans, sans-serif',
                            fontSize: '14px',
                            fontWeight: 400,
                            height: '30px',
                            color: activeTab === 'input' ? solidColor : textColor,
                            transition: 'all 0.2s ease',
                            userSelect: 'none',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                        }}
                        onMouseEnter={(e) => {
                            if (activeTab !== 'input') {
                                e.currentTarget.style.backgroundColor = globalHoverColor;
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        <FontAwesomeIcon icon={solidIcons.faArrowRightToBracket} style={{ fontSize: '14px' }} />
                        <span>Input Nodes</span>
                    </button>

                    {/* Output Nodes Tab */}
                    <button
                        onClick={() => setActiveTab('output')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '0px 8px',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === 'output' ? `2px solid ${solidColor}` : '2px solid transparent',
                            borderRadius: activeTab === 'output' ? '0px' : '8px',
                            cursor: 'pointer',
                            fontFamily: 'Work Sans, sans-serif',
                            fontSize: '14px',
                            fontWeight: 400,
                            height: '30px',
                            color: activeTab === 'output' ? solidColor : textColor,
                            transition: 'all 0.2s ease',
                            userSelect: 'none',
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
                        }}
                        onMouseEnter={(e) => {
                            if (activeTab !== 'output') {
                                e.currentTarget.style.backgroundColor = globalHoverColor;
                            }
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        <FontAwesomeIcon icon={solidIcons.faArrowRightFromBracket} style={{ fontSize: '14px' }} />
                        <span>Output Nodes</span>
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
                            whiteSpace: 'nowrap',
                            flexShrink: 0,
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

                {showRightScroll && (
                    <button
                        onClick={() => handleScroll('right')}
                        style={{
                            position: 'absolute',
                            right: '4px',
                            zIndex: 10,
                            background: 'transparent',
                            border: 'none',
                            color: textColor,
                            cursor: 'pointer',
                            padding: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0.7,
                            transition: 'opacity 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
                    >
                        <FontAwesomeIcon icon={solidIcons.faChevronRight} style={{ fontSize: '12px' }} />
                    </button>
                )}
            </div>

            {/* Content Container */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {/* Setup Tab Content */}
                {activeTab === 'setup' && (
                    <div style={{ padding: '18px 10px 10px 10px' }}>
                        {/* Setup tab content goes here */}
                    </div>
                )}

                {/* Input Nodes Tab Content */}
                {activeTab === 'input' && (
                    <div style={{ padding: '18px 10px 10px 10px' }}>
                        <h3 style={{
                            fontSize: '15px',
                            fontWeight: 500,
                            fontFamily: 'Work Sans, sans-serif',
                            color: textColor,
                            margin: 0
                        }}>
                            Input Nodes Configuration
                        </h3>
                    </div>
                )}

                {/* Output Nodes Tab Content */}
                {activeTab === 'output' && (
                    <div style={{ padding: '18px 10px 10px 10px' }}>
                        <h3 style={{
                            fontSize: '15px',
                            fontWeight: 500,
                            fontFamily: 'Work Sans, sans-serif',
                            color: textColor,
                            margin: 0
                        }}>
                            Output Nodes Configuration
                        </h3>
                    </div>
                )}

                {/* Settings Tab Content */}
                {activeTab === 'settings' && (
                    <div style={{ padding: '18px 10px 10px 10px' }}>

                        {/* Reset Section — matches SmartHub General settings style */}
                        <div style={{
                            marginBottom: '16px',
                            fontFamily: 'Work Sans, sans-serif',
                            border: `1px solid ${borderLineColor}`,
                            borderRadius: '10px',
                        }}>

                            {/* header section  */}

                            <div style={{
                                fontFamily: 'Work Sans, sans-serif',
                                borderBottom: `1px solid ${borderLineColor}`,
                                padding: '10px',
                                height: 'fit-content',
                                backgroundColor: globalHoverColor,
                                borderTopLeftRadius: '9px',
                                borderTopRightRadius: '9px',
                            }}>
                                <h2 style={{
                                    fontSize: '13px',
                                    fontWeight: 500,
                                    fontFamily: 'Work Sans, sans-serif',
                                    userSelect: 'none',
                                    color: textColor,
                                    margin: 0,
                                }}>
                                    Reset
                                </h2>
                            </div>
                            <div style={{
                                padding: '16px',
                                fontFamily: 'Work Sans, sans-serif',
                                minHeight: '100px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                                userSelect: "none"
                            }}>
                                {/* Custom section content will go here */}
                            </div>
                        </div>

                        {/* Danger Section — matches SmartHub General settings style */}
                        <div style={{
                            marginBottom: '16px',
                            fontFamily: 'Work Sans, sans-serif',
                            border: `1px solid ${dangerToneBorder}`,
                            borderRadius: '10px',
                        }}>
                            {/* Danger Header */}
                            <div style={{
                                fontFamily: 'Work Sans, sans-serif',
                                borderBottom: `1px solid ${dangerToneBorder}`,
                                backgroundColor: dangerToneBk,
                                height: 'fit-content',
                                padding: '10px',
                                borderTopLeftRadius: '9px',
                                borderTopRightRadius: '9px',
                                userSelect: "none"
                            }}>
                                <h2 style={{
                                    fontSize: '14px',
                                    fontWeight: 500,
                                    marginBottom: '0px',
                                    fontFamily: 'Work Sans, sans-serif',
                                    color: dangerToneText,
                                }}>
                                    Danger
                                </h2>
                            </div>

                            {/* Change Protocol Row */}
                            <div style={{
                                padding: '10px',
                                fontFamily: 'Work Sans, sans-serif',
                                fontWeight: 400,
                                minHeight: '50px',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                                userSelect: "none"
                            }}>
                                <span style={{
                                    fontSize: '12px',
                                    fontFamily: 'Work Sans, sans-serif',
                                    color: textColor,
                                }}>
                                    Change the active protocol
                                </span>

                                <button
                                    onClick={handleChangeProtocol}
                                    disabled={isChanging}
                                    style={{
                                        marginTop: '10px',
                                        paddingLeft: '5px',
                                        paddingRight: '5px',
                                        paddingTop: '3px',
                                        paddingBottom: '3px',
                                        alignSelf: 'flex-end',
                                        backgroundColor: 'transparent',
                                        color: dangerToneText,
                                        border: `1px solid ${dangerToneBorder}`,
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        fontWeight: 400,
                                        fontFamily: 'Work Sans, sans-serif',
                                        cursor: isChanging ? 'not-allowed' : 'pointer',
                                        transition: 'all 0.2s ease',
                                        height: '33px',
                                        userSelect: 'none',
                                        opacity: isChanging ? 0.6 : 1,
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isChanging) {
                                            e.currentTarget.style.backgroundColor = dangerBkSolid;
                                            e.currentTarget.style.color = '#ffffff';
                                            e.currentTarget.style.border = `1px solid ${dangerBkSolid}`;
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                        e.currentTarget.style.color = dangerToneText;
                                        e.currentTarget.style.border = `1px solid ${dangerToneBorder}`;
                                    }}
                                >
                                    {isChanging ? 'Updating...' : 'Change protocol'}
                                </button>
                            </div>
                        </div>

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
