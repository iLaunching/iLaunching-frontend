
import React from 'react';
import { ContextRegistryType, ContextType, ContextDefinition } from './ContextTypes';
import { SmartMatrixContext } from '../contexts/SmartMatrixContext';
import { SmartRouterContext } from '../contexts/SmartRouterContext';

// Placeholder for missing contexts
const PlaceholderContext: React.FC<any> = () => (
    <div style= {{ padding: '20px', color: '#9ca3af', textAlign: 'center' }}>
        Configuration not available for this node type yet.
    </div>
);

export const ContextRegistry: ContextRegistryType = {
    [ContextType.SMART_MATRIX]: {
        title: 'Smart Matrix',
        goalStatement: 'Configure Matrix Settings',
        Component: SmartMatrixContext,
        capabilities: []
    },
    [ContextType.SMART_ROUTER]: {
        title: 'Smart Router',
        goalStatement: 'Manage Routing Logic',
        Component: SmartRouterContext,
        capabilities: []
    },
    [ContextType.GENESIS]: {
        title: 'Genesis Node',
        goalStatement: 'System Initialization',
        Component: PlaceholderContext,
        capabilities: []
    },
    [ContextType.UNKNOWN]: {
        title: 'Unknown Node',
        goalStatement: '',
        Component: PlaceholderContext,
        capabilities: []
    }
};

export const getContextDefinition = (type: string): ContextDefinition => {
    // Simple mapping from string to enum
    // In real app, node.type might match enum values
    const normalizedType = type as ContextType;
    return ContextRegistry[normalizedType] || ContextRegistry[ContextType.UNKNOWN];
};
