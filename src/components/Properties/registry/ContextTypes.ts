
import { UUID } from '../../../types';

export enum ContextType {
    SMART_MATRIX = 'smart-matrix',
    SMART_ROUTER = 'smart-router',
    GENESIS = 'genesis',
    UNKNOWN = 'unknown' // Fallback
}

export interface NodeCapability {
    id: string;
    label: string;
    type: 'toggle' | 'slider' | 'input' | 'action';
    onExecute?: () => void;
}

export interface ContextComponentProps {
    nodeId: UUID;
    isMock?: boolean; // For testing/preview without real node data
}

export interface ContextDefinition {
    title: string;
    goalStatement: string;
    icon?: React.ReactNode;
    Component: React.ComponentType<ContextComponentProps>;
    capabilities?: NodeCapability[];
}

export type ContextRegistryType = Record<ContextType, ContextDefinition>;
