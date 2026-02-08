import React from 'react';

/**
 * Supported context types for the polymorphic panel
 */
export type ContextType = 'smart-matrix' | 'smart-router' | 'genesis' | 'default';

/**
 * Props passed to each context component
 */
export interface ContextComponentProps {
    nodeData: any; // The full node object
    onClose?: () => void;
}

/**
 * Registry entry structure
 */
export interface ContextRegistryEntry {
    title: string;
    Component: React.ComponentType<ContextComponentProps>;
}

/**
 * The complete registry mapping
 */
export type ContextRegistryMap = {
    [K in ContextType]: ContextRegistryEntry;
};
