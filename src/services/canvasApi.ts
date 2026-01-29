/**
 * Canvas API Service
 * Handles all API calls for Phase 3 canvas persistence
 */

import api from '../lib/api';

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
        const response = await api.post('/node/create', data);
        return response.data;
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

        const url = `/node/context/${contextId}/nodes${params.toString() ? '?' + params.toString() : ''}`;
        const response = await api.get(url);
        return response.data;
    },

    async updateNodePosition(nodeId: string, x: number, y: number) {
        const response = await api.patch(`/node/${nodeId}/position`, { pos_x: x, pos_y: y });
        return response.data;
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
        const response = await api.patch(`/node/${nodeId}/state`, state);
        return response.data;
    },

    async deleteNode(nodeId: string) {
        await api.delete(`/node/${nodeId}`);
    },

    // ============================================================================
    // Connection Management
    // ============================================================================

    async createConnection(data: ConnectionCreateData) {
        const response = await api.post('/connection/create', data);
        return response.data;
    },

    async getNodeConnections(nodeId: string) {
        const response = await api.get(`/connection/node/${nodeId}/connections`);
        return response.data;
    },

    async getContextConnections(contextId: string) {
        const response = await api.get(`/connection/context/${contextId}/connections`);
        return response.data;
    },

    async deleteConnection(connectionId: string) {
        await api.delete(`/connection/${connectionId}`);
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

        const url = `/templates${params.toString() ? '?' + params.toString() : ''}`;
        const response = await api.get(url);
        return response.data;
    },

    async getAvailableNodes(contextId: string) {
        const response = await api.get(`/templates/context/${contextId}/available-nodes`);
        return response.data;
    },

    async getTemplate(templateId: string) {
        const response = await api.get(`/templates/${templateId}`);
        return response.data;
    },

    // ============================================================================
    // Smart Matrix Management (Sovereign Entity)
    // ============================================================================

    async getSmartMatrix(matrixId: string) {
        const response = await api.get(`/smart-matrix/${matrixId}`);
        return response.data;
    },

    async updateCameraPosition(matrixId: string, x: number, y: number, zoom?: number) {
        const response = await api.patch(`/smart-matrix/${matrixId}/position`, { x, y, zoom });
        return response.data;
    },

    async updateBusinessDNA(matrixId: string, dna: Record<string, any>) {
        const response = await api.patch(`/smart-matrix/${matrixId}/business-dna`, dna);
        return response.data;
    },
};
