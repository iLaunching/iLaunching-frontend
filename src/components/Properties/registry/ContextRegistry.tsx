import React, { lazy } from 'react';
import type { ContextType, ContextRegistryMap, ContextComponentProps } from './ContextTypes';

// Lazy load context components for better performance
const SmartMatrixContext = lazy(() => import('../contexts/SmartMatrixContext'));
const SmartRouterContext = lazy(() => import('../contexts/SmartRouterContext'));
const DefaultContext = lazy(() => import('../contexts/DefaultContext'));

/**
 * The Context Registry
 * Maps node types to their corresponding UI components
 */
export const contextRegistry: ContextRegistryMap = {
    'smart-matrix': {
        title: 'Smart Matrix',
        Component: SmartMatrixContext,
    },
    'smart-router': {
        title: 'Smart Router',
        Component: SmartRouterContext,
    },
    'genesis': {
        title: 'Genesis',
        Component: DefaultContext, // Using default for now
    },
    'default': {
        title: 'Node Properties',
        Component: DefaultContext,
    },
};

/**
 * Hook to get the context component for a given node type
 * Memoized to prevent unnecessary re-computations
 */
export const useContextRegistry = (nodeType: string): React.ComponentType<ContextComponentProps> => {
    return React.useMemo(() => {
        const type = (nodeType as ContextType) || 'default';
        const entry = contextRegistry[type] || contextRegistry['default'];
        return entry.Component;
    }, [nodeType]);
};

/**
 * Helper to get the title for a context type
 */
export const getContextTitle = (nodeType: string): string => {
    const type = (nodeType as ContextType) || 'default';
    const entry = contextRegistry[type] || contextRegistry['default'];
    return entry.title;
};
