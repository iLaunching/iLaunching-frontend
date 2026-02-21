import React, { useState, useRef, useEffect } from 'react';
import type { ContextComponentProps } from '../registry/ContextTypes';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import * as solidIcons from '@fortawesome/free-solid-svg-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { protocolApi, contextApi, nodeApi } from '@/lib/api';
import { DataDisplayEditor } from '@/components/DataDisplayEditor';

interface MatrixProtocol {
    protocol_id: string;
    protocol_key: string;
    initial_instructions: string;
    context_framework: any;
    success_criteria: any;
    is_active: boolean;
    background_color?: string;
    border_color?: string;
    display_name?: string;
    display_description?: string;
    short_description?: string;
    ui_theme?: any;
    ui_assets?: any;
    icon?: string;
    created_at: string;
    updated_at: string;
}

/**
 * Smart Matrix Context Component
 * Displays settings and configuration for Smart Matrix nodes
 */
export const SmartMatrixContext: React.FC<ContextComponentProps> = ({ nodeData, onClose, onSetupEnabled }) => {
    const [activeTab, setActiveTab] = useState<'options' | 'custom'>('options');
    const [selectedProtocol, setSelectedProtocol] = useState<string | null>(null);
    const [view, setView] = useState<'list' | 'detail'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
    const categoryScrollRef = useRef<HTMLDivElement>(null);
    const [showLeftCatScroll, setShowLeftCatScroll] = useState(false);
    const [showRightCatScroll, setShowRightCatScroll] = useState(true);
    const queryClient = useQueryClient();

    // Mutation for using a protocol
    const useProtocolMutation = useMutation({
        mutationFn: async (protocol: MatrixProtocol) => {
            // Determine context ID from nodeData
            // Use node_id as per refined plan
            const nodeId = nodeData?.id;

            if (!nodeId) {
                console.error("No node ID found in nodeData", nodeData);
                throw new Error("No node ID found");
            }

            // 1. Set the protocol on the node
            // NodeResponse includes context_id — use it to set the setup flag
            const result = await nodeApi.updateProtocol(nodeId, protocol.protocol_id, protocol.protocol_key);

            // 2. Set setup=true on the context to lock the protocol in the panel
            // Prefer the context_id from the API response; fall back to nodeData
            const contextId = result?.context_id || nodeData?.context_id;
            if (contextId) {
                await contextApi.updateContextSetup(contextId, true);
                console.log('🔒 Setup mode enabled for context:', contextId);
                // Notify the parent panel to switch immediately — no need for another fetch
                onSetupEnabled?.();
            } else {
                console.warn('⚠️ No context_id found after updateProtocol — setup flag not set', result, nodeData);
            }

            return result;
        },
        onSuccess: () => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: ['matrix-protocols'] });
        }
    });

    const handleUseProtocol = () => {
        if (!selectedProtocol) return;
        const protocol = protocols.find(p => p.protocol_id === selectedProtocol);
        if (protocol) {
            useProtocolMutation.mutate(protocol);
        }
    };

    // Fetch current smart hub data to get theme colors (same as SmartHub page)
    const { data: hubData } = useQuery({
        queryKey: ['current-smart-hub'],
        queryFn: async () => {
            const response = await api.get('/users/me/current-smart-hub');
            return response.data;
        }
    });

    // Fetch matrix protocols
    const { data: protocolsData, isLoading: protocolsLoading } = useQuery({
        queryKey: ['matrix-protocols'],
        queryFn: async () => {
            const response = await protocolApi.getProtocols();
            return response;
        }
    });

    // Fetch protocol categories
    const { data: categories = [] } = useQuery({
        queryKey: ['protocol-categories'],
        queryFn: () => protocolApi.getCategories(),
        staleTime: 5 * 60 * 1000, // categories rarely change
    });

    // Extract theme colors from hub data (same pattern as SmartHub page)
    const globalHoverColor = hubData?.theme?.global_button_hover || 'rgba(0, 0, 0, 0.05)';
    const solidColor = hubData?.theme?.solid_color || '#3b82f6';
    const titleColor = hubData?.theme?.title_menu_color_light || '#374151';
    const textColor = hubData?.theme?.text || '#374151';
    const borderLineColor = hubData?.theme?.border_line_color_light || 'rgba(255, 255, 255, 0.2)';

    // Smart scroll button checks for the category chip bar
    const checkCatScroll = () => {
        if (categoryScrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = categoryScrollRef.current;
            setShowLeftCatScroll(scrollLeft > 0);
            setShowRightCatScroll(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
        }
    };

    useEffect(() => {
        checkCatScroll();
        window.addEventListener('resize', checkCatScroll);
        return () => window.removeEventListener('resize', checkCatScroll);
    }, [categories]);

    const protocols = protocolsData?.protocols || [];

    // Filter protocols based on search query and selected category
    const filteredProtocols = protocols.filter((protocol: MatrixProtocol) => {
        const query = searchQuery.toLowerCase();
        const name = (protocol.display_name || protocol.protocol_key).toLowerCase();
        const description = (protocol.short_description || '').toLowerCase();
        const matchesSearch = name.includes(query) || description.includes(query);
        const matchesCategory = selectedCategoryId === null || (protocol as any).category_id === selectedCategoryId;
        return matchesSearch && matchesCategory;
    });

    // Get protocol badge color
    const getProtocolColor = (protocolKey: string) => {
        switch (protocolKey) {
            case 'GENESIS':
                return { bg: 'rgba(251, 191, 36, 0.1)', border: '#f59e0b', text: '#d97706' };
            case 'CAMPAIGN':
                return { bg: 'rgba(239, 68, 68, 0.1)', border: '#ef4444', text: '#dc2626' };
            case 'VALIDATION':
                return { bg: 'rgba(59, 130, 246, 0.1)', border: '#3b82f6', text: '#2563eb' };
            default:
                return { bg: 'rgba(107, 114, 128, 0.1)', border: '#6b7280', text: '#4b5563' };
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden'
        }}>
            {/* Header */}
            {view === 'list' && (
                <div style={{
                    padding: '10px 10px 0px 10px',
                    /*  borderBottom: `1px solid ${borderLineColor}`, */
                    height: 'fit-content'
                }}>


                    {/* Navigation Bar */}
                    <div style={{
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '8px'
                    }}>
                        {/* Options Button */}
                        <button
                            onClick={() => setActiveTab('options')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '0px 8px',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: activeTab === 'options' ? `2px solid ${solidColor}` : '2px solid transparent',
                                borderRadius: activeTab === 'options' ? '0px' : '8px',
                                cursor: 'pointer',
                                fontFamily: 'Work Sans, sans-serif',
                                fontSize: '14px',
                                fontWeight: 400,
                                height: '30px',
                                color: activeTab === 'options' ? solidColor : textColor,
                                transition: 'all 0.2s ease',
                                userSelect: 'none'
                            }}
                            onMouseEnter={(e) => {
                                if (activeTab !== 'options') {
                                    e.currentTarget.style.backgroundColor = globalHoverColor;
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            <FontAwesomeIcon icon={solidIcons.faSliders} style={{ fontSize: '14px' }} />
                            <span>Options</span>
                        </button>

                        {/* Custom Button */}
                        <button
                            onClick={() => setActiveTab('custom')}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '0px 8px',
                                background: 'transparent',
                                border: 'none',
                                borderBottom: activeTab === 'custom' ? `2px solid ${solidColor}` : '2px solid transparent',
                                borderRadius: activeTab === 'custom' ? '0px' : '8px',
                                cursor: 'pointer',
                                fontFamily: 'Work Sans, sans-serif',
                                fontSize: '14px',
                                fontWeight: 400,
                                height: '30px',
                                color: activeTab === 'custom' ? solidColor : textColor,
                                transition: 'all 0.2s ease',
                                userSelect: 'none',
                                marginBottom: '10px'
                            }}
                            onMouseEnter={(e) => {
                                if (activeTab !== 'custom') {
                                    e.currentTarget.style.backgroundColor = globalHoverColor;
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                        >
                            <FontAwesomeIcon icon={solidIcons.faUser} style={{ fontSize: '14px' }} />
                            <span>Custom</span>
                        </button>
                    </div>

                    {/* Category Filter Chips — only visible on Options tab */}
                    {activeTab === 'options' && categories.length > 0 && (
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            {/* Left scroll button */}
                            {showLeftCatScroll && (
                                <button
                                    onClick={() => categoryScrollRef.current?.scrollBy({ left: -150, behavior: 'smooth' })}
                                    style={{
                                        position: 'absolute',
                                        left: 0,
                                        zIndex: 10,
                                        background: 'transparent',
                                        border: 'none',
                                        color: textColor,
                                        cursor: 'pointer',
                                        padding: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        opacity: 0.7,
                                        transition: 'opacity 0.2s',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
                                >
                                    <FontAwesomeIcon icon={solidIcons.faChevronLeft} style={{ fontSize: '11px' }} />
                                </button>
                            )}

                            <div
                                ref={categoryScrollRef}
                                onScroll={checkCatScroll}
                                className="no-scrollbar"
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    gap: '6px',
                                    overflowX: 'auto',
                                    paddingBottom: '8px',
                                    paddingTop: '8px',
                                    paddingLeft: showLeftCatScroll ? '20px' : '0px',
                                    paddingRight: showRightCatScroll ? '20px' : '0px',
                                    scrollbarWidth: 'none',
                                    msOverflowStyle: 'none',
                                    width: '100%',
                                    WebkitMaskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)',
                                    maskImage: 'linear-gradient(to right, transparent, black 16px, black calc(100% - 16px), transparent)',
                                }}
                            >
                                {/* All / reset chip */}
                                <button
                                    onClick={() => setSelectedCategoryId(null)}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '5px',
                                        padding: '3px 10px',
                                        borderRadius: '20px',
                                        border: `1px solid ${selectedCategoryId === null ? solidColor : borderLineColor}`,
                                        backgroundColor: selectedCategoryId === null ? solidColor : 'transparent',
                                        color: selectedCategoryId === null ? '#fff' : textColor,
                                        cursor: 'pointer',
                                        fontFamily: 'Work Sans, sans-serif',
                                        fontSize: '12px',
                                        fontWeight: 400,
                                        whiteSpace: 'nowrap',
                                        flexShrink: 0,
                                        transition: 'all 0.2s ease',
                                        userSelect: 'none',
                                    }}
                                >
                                    All
                                </button>

                                {categories.map((cat) => {
                                    const isActive = selectedCategoryId === cat.id;
                                    return (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategoryId(isActive ? null : cat.id)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px',
                                                padding: '3px 10px',
                                                borderRadius: '20px',
                                                border: `1px solid ${isActive ? (cat.color || solidColor) : borderLineColor}`,
                                                backgroundColor: isActive ? (cat.color || solidColor) : 'transparent',
                                                color: isActive ? '#fff' : textColor,
                                                cursor: 'pointer',
                                                fontFamily: 'Work Sans, sans-serif',
                                                fontSize: '12px',
                                                fontWeight: 400,
                                                whiteSpace: 'nowrap',
                                                flexShrink: 0,
                                                transition: 'all 0.2s ease',
                                                userSelect: 'none',
                                            }}
                                            onMouseEnter={(e) => {
                                                if (!isActive) {
                                                    e.currentTarget.style.backgroundColor = `${cat.color || solidColor}22`;
                                                    e.currentTarget.style.borderColor = cat.color || solidColor;
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isActive) {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                    e.currentTarget.style.borderColor = borderLineColor;
                                                }
                                            }}
                                        >
                                            {cat.icon_name && (
                                                <i
                                                    className={`${cat.icon_prefix || 'fas'} ${cat.icon_name}`}
                                                    style={{ fontSize: '11px' }}
                                                />
                                            )}
                                            {cat.name}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Right scroll button */}
                            {showRightCatScroll && (
                                <button
                                    onClick={() => categoryScrollRef.current?.scrollBy({ left: 150, behavior: 'smooth' })}
                                    style={{
                                        position: 'absolute',
                                        right: 0,
                                        zIndex: 10,
                                        background: 'transparent',
                                        border: 'none',
                                        color: textColor,
                                        cursor: 'pointer',
                                        padding: '4px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        opacity: 0.7,
                                        transition: 'opacity 0.2s',
                                    }}
                                    onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
                                    onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
                                >
                                    <FontAwesomeIcon icon={solidIcons.faChevronRight} style={{ fontSize: '11px' }} />
                                </button>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Content Container */}
            <div style={{ flex: 1, padding: '18px 10px 10px 10px', overflowY: 'auto' }}>
                {activeTab === 'options' && (
                    <div>
                        {view === 'list' ? (
                            /* Matrix Protocol Section */
                            <div style={{ marginBottom: '20px' }}>


                                {/* Search Input */}
                                <div style={{
                                    marginBottom: '16px',
                                    position: 'relative'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        left: '12px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        color: textColor,
                                        opacity: 0.5,
                                        pointerEvents: 'none',
                                        height: '30px',
                                        userSelect: 'none'
                                    }}>
                                        <FontAwesomeIcon icon={solidIcons.faSearch} style={{ fontSize: '12px' }} />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        style={{
                                            width: '100%',
                                            padding: '8px 12px 8px 32px',
                                            borderRadius: '6px',
                                            border: `1px solid ${borderLineColor}`,
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            color: textColor,
                                            fontFamily: 'Work Sans, sans-serif',
                                            fontSize: '13px',
                                            outline: 'none',
                                            height: '30px',
                                            transition: 'all 0.2s ease'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = solidColor;
                                            e.target.style.background = 'rgba(255, 255, 255, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = borderLineColor;
                                            e.target.style.background = 'rgba(255, 255, 255, 0.05)';
                                        }}
                                    />
                                </div>

                                {protocolsLoading ? (
                                    <div style={{
                                        padding: '12px',
                                        fontFamily: 'Work Sans, sans-serif',
                                        fontSize: '13px',
                                        color: textColor,
                                        opacity: 0.7
                                    }}>
                                        Loading protocols...
                                    </div>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                                        {filteredProtocols.map((protocol: MatrixProtocol) => {
                                            const colors = getProtocolColor(protocol.protocol_key);

                                            return (
                                                <button
                                                    key={protocol.protocol_id}
                                                    onClick={() => {
                                                        setSelectedProtocol(protocol.protocol_id);
                                                        setView('detail');
                                                    }}
                                                    style={{
                                                        display: 'flex',
                                                        padding: '8px',
                                                        background: 'transparent',
                                                        border: `1px solid ${solidColor}50`,
                                                        borderRadius: '8px',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s ease',
                                                        userSelect: 'none',
                                                        minHeight: '70px',
                                                        height: 'fit-content',
                                                        boxShadow: `0px 0 1px ${solidColor}90`,
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.backgroundColor = `color-mix(in srgb, ${globalHoverColor}, transparent 50%)`;
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.backgroundColor = 'transparent';

                                                    }}
                                                >

                                                    {/* Protocol Icon */}
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '8px',
                                                        width: '55px',
                                                        height: '55px',
                                                        marginRight: '10px',
                                                        borderRadius: '3px',
                                                        backgroundColor: 'rgba(255, 255, 255, 0.05)'
                                                    }}>
                                                        <img
                                                            src={protocol.ui_assets?.slug && protocol.ui_assets?.card
                                                                ? `/protocols/${protocol.ui_assets.slug}/${protocol.ui_assets.card}.webp`
                                                                : protocol.icon || '/protocols/default/card.webp'}
                                                            alt={protocol.display_name}
                                                            onError={(e) => {
                                                                e.currentTarget.src = '/protocols/default/card.webp';
                                                            }}
                                                            style={{
                                                                width: '40px',
                                                                height: '40px',
                                                                objectFit: 'contain',
                                                                borderRadius: '3px',

                                                            }}
                                                        />
                                                    </div>


                                                    {/* Protocol Title and  short description */}
                                                    <div style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'flex-start',
                                                        gap: '3px',
                                                        width: '100%',

                                                    }}>

                                                        {/* Title */}
                                                        <h4 style={{
                                                            margin: 0,
                                                            fontFamily: 'Work Sans, sans-serif',
                                                            fontSize: '14px',
                                                            fontWeight: 500,
                                                            color: textColor,
                                                            userSelect: 'none',


                                                        }}>
                                                            {protocol.display_name || protocol.protocol_key}
                                                        </h4>

                                                        {/* short description */}
                                                        <p style={{
                                                            margin: 0,
                                                            fontFamily: 'Work Sans, sans-serif',
                                                            fontSize: '11px',
                                                            fontWeight: 400,
                                                            color: textColor,
                                                            opacity: 0.7,
                                                            userSelect: 'none',
                                                            lineHeight: '1.4',
                                                            textAlign: 'left',
                                                            width: '100%',

                                                        }}>
                                                            {protocol.short_description || ''}
                                                        </p>


                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Protocol Detail View */
                            <div>
                                {/* Back Button */}
                                <button
                                    onClick={() => setView('list')}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        padding: '8px 8px',
                                        height: '30px',
                                        marginBottom: '16px',
                                        background: 'transparent',
                                        border: `1px solid ${borderLineColor}`,
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontFamily: 'Work Sans, sans-serif',
                                        fontSize: '13px',
                                        color: textColor,
                                        transition: 'all 0.2s ease',
                                        userSelect: 'none'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = globalHoverColor;
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = 'transparent';
                                    }}
                                >
                                    <FontAwesomeIcon icon={solidIcons.faArrowLeft} style={{ fontSize: '12px' }} />
                                    <span>Back</span>
                                </button>

                                {/* Dynamic Container */}
                                <div style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '16px'
                                }}>


                                    {/* Protocol Description Display */}
                                    <div>

                                        <DataDisplayEditor
                                            value={protocols.find((p: MatrixProtocol) => p.protocol_id === selectedProtocol)?.display_description || ''}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'custom' && (
                    <div>
                        {/* Custom content will go here */}
                        <p style={{ fontFamily: 'Work Sans, sans-serif', fontSize: '13px', color: textColor, opacity: 0.7 }}>
                            Custom content
                        </p>
                    </div>
                )}
            </div>

            {/* Sticky Footer - Detail View */}
            {
                view === 'detail' && activeTab === 'options' && (
                    <div style={{
                        padding: '16px',
                        borderTop: `1px solid ${borderLineColor}`,
                        background: '#ffffff',
                    }}>
                        <button
                            onClick={handleUseProtocol}
                            disabled={useProtocolMutation.isPending}
                            style={{
                                width: '100%',
                                padding: '10px',
                                backgroundColor: solidColor,
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '8px',
                                cursor: useProtocolMutation.isPending ? 'wait' : 'pointer',
                                opacity: useProtocolMutation.isPending ? 0.7 : 1,
                                fontFamily: 'Work Sans, sans-serif',
                                fontSize: '14px',
                                fontWeight: 400,
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                height: '30px',
                                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.opacity = '0.9';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.opacity = '1';
                            }}
                        >
                            <span>Use Protocol</span>
                            <FontAwesomeIcon icon={solidIcons.faArrowRight} style={{ fontSize: '12px' }} />
                        </button>
                    </div>
                )
            }
        </div >
    );
};

export default SmartMatrixContext;
