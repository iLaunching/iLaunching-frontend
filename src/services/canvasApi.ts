/**
 * Canvas API Service
 * Handles all API calls for Phase 3 canvas persistence
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_VERSION = 'v1';

export interface NodeCreateData {
    context_id: string;
    node_type: string;
    node_name: string;
    node_description?: string;
    pos_x: number;
    pos_y: number;
    width?: number;
    height?: number;
    color?: string;
    background_color?: string;
    text_color?: string;
    port_config?: {
        inputs?: Array<{
            id: string;
            dataType: string;
            label: string;
        }>;
        outputs?: Array<{
            id: string;
            dataType: string;
            label: string;
        }>;
    };
    is_master_bridge?: boolean;
    metadata?: Record<string, any>;
}

export interface ConnectionCreateData {
    source_node_id: string;
    source_port_id: string;
    target_node_id: string;
    target_port_id: string;
    color?: string;
    animated?: boolean;
    pulse_speed?: number;
}

export interface Viewport {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}

export const canvasApi = {
    // ============================================================================
    // Node Management
    // ============================================================================

    async createNode(data: NodeCreateData) {
        const response = await fetch(`${API_BASE}/api/${API_VERSION}/node/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to create node');
        }

        return response.json();
    },

    async getContextNodes(contextId: string, viewport?: Viewport, nodeType?: string) {
        const params = new URLSearchParams();

        if (viewport) {
            params.append('min_x', viewport.minX.toString());
            params.append('max_x', viewport.maxX.toString());
            params.append('min_y', viewport.minY.toString());
            params.append('max_y', viewport.maxY.toString());
        }

        if (nodeType) {
            params.append('node_type', nodeType);
        }

        const url = `${API_BASE}/api/${API_VERSION}/node/context/${contextId}/nodes${params.toString() ? '?' + params.toString() : ''}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch nodes');
        }

        return response.json();
    },

    async updateNodePosition(nodeId: string, x: number, y: number) {
        const response = await fetch(`${API_BASE}/api/${API_VERSION}/node/${nodeId}/position`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pos_x: x, pos_y: y }),
        });

        if (!response.ok) {
            throw new Error('Failed to update node position');
        }

        return response.json();
    },

    async updateNodeState(
        nodeId: string,
        state: {
            operational_status?: string;
            visual_state?: string;
            is_selected?: boolean;
            is_hovered?: boolean;
        }
    ) {
        const response = await fetch(`${API_BASE}/api/${API_VERSION}/node/${nodeId}/state`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(state),
        });

        if (!response.ok) {
            throw new Error('Failed to update node state');
        }

        return response.json();
    },

    async deleteNode(nodeId: string) {
        const response = await fetch(`${API_BASE}/api/${API_VERSION}/node/${nodeId}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            throw new Error('Failed to delete node');
        }
    },

    // ============================================================================
    // Connection Management
    // ============================================================================

    async createConnection(data: ConnectionCreateData) {
        const response = await fetch(`${API_BASE}/api/${API_VERSION}/connection/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Failed to create connection');
        }

        return response.json();
    },

    async getNodeConnections(nodeId: string) {
        const response = await fetch(
            `${API_BASE}/api/${API_VERSION}/connection/node/${nodeId}/connections`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch node connections');
        }

        return response.json();
    },

    async getContextConnections(contextId: string) {
        const response = await fetch(
            `${API_BASE}/api/${API_VERSION}/connection/context/${contextId}/connections`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch context connections');
        }

        return response.json();
    },

    async deleteConnection(connectionId: string) {
        const response = await fetch(
            `${API_BASE}/api/${API_VERSION}/connection/${connectionId}`,
            {
                method: 'DELETE',
            }
        );

        if (!response.ok) {
            throw new Error('Failed to delete connection');
        }
    },

    // ============================================================================
    // Template Management (Node Library)
    // ============================================================================

    async getAllTemplates(category?: string, contextType?: string) {
        const params = new URLSearchParams();

        if (category) {
            params.append('category', category);
        }

        if (contextType) {
            params.append('context_type', contextType);
        }

        const url = `${API_BASE}/api/${API_VERSION}/templates${params.toString() ? '?' + params.toString() : ''}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error('Failed to fetch templates');
        }

        return response.json();
    },

    async getAvailableNodes(contextId: string) {
        const response = await fetch(
            `${API_BASE}/api/${API_VERSION}/templates/context/${contextId}/available-nodes`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch available nodes');
        }

        return response.json();
    },

    async getTemplate(templateId: string) {
        const response = await fetch(
            `${API_BASE}/api/${API_VERSION}/templates/${templateId}`
        );

        if (!response.ok) {
            throw new Error('Failed to fetch template');
        }

        return response.json();
    },
};
