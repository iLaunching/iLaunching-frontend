import { useState, useCallback, useRef, useEffect } from 'react';
import { nodeApi } from '../lib/api';

/**
 * useChatPrefetch - sovereign speed optimization
 * 
 * Provides a mechanism to pre-fetch chat history when hovering over a node.
 * Uses a Map-based cache to prevent redundant network requests.
 */

// Simple in-memory cache (could be moved to a context if needed globally)
const chatCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const useChatPrefetch = () => {
    const [prefetchedNodes, setPrefetchedNodes] = useState<Set<string>>(new Set());
    const prefetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const prefetchChat = useCallback(async (nodeId: string) => {
        if (!nodeId) return;

        // Check cache first
        const cacheKey = `chat_node_${nodeId}`;
        const cached = chatCache.get(cacheKey);
        const now = Date.now();

        if (cached && (now - cached.timestamp < CACHE_TTL)) {
            console.log(`[ChatPrefetch] ⚡ Cache hit for node ${nodeId}`);
            return;
        }

        // Don't fetch if already fetched in this session/component lifecycle
        if (prefetchedNodes.has(nodeId)) return;

        console.log(`[ChatPrefetch] 🚀 Pre-fetching chat for node ${nodeId}...`);

        try {
            // Mark as requested to avoid double-fetching
            setPrefetchedNodes(prev => new Set(prev).add(nodeId));

            // Call API
            const response = await nodeApi.getChatHistory(nodeId);

            // Update cache
            chatCache.set(cacheKey, { data: response, timestamp: now });

            console.log(`[ChatPrefetch] ✅ Pre-fetch complete for node ${nodeId}`);
        } catch (error) {
            console.warn(`[ChatPrefetch] ⚠️ Pre-fetch failed for node ${nodeId}`, error);
            // Remove from set so we can try again later if needed
            setPrefetchedNodes(prev => {
                const next = new Set(prev);
                next.delete(nodeId);
                return next;
            });
        }
    }, [prefetchedNodes]);

    const handleNodeHover = useCallback((nodeId: string) => {
        // Clear any existing timeout
        if (prefetchTimeoutRef.current) {
            clearTimeout(prefetchTimeoutRef.current);
        }

        // 100ms delay to avoid fetching when just passing through
        prefetchTimeoutRef.current = setTimeout(() => {
            prefetchChat(nodeId);
        }, 100);
    }, [prefetchChat]);

    const handleNodeLeave = useCallback(() => {
        if (prefetchTimeoutRef.current) {
            clearTimeout(prefetchTimeoutRef.current);
            prefetchTimeoutRef.current = null;
        }
    }, []);

    return {
        handleNodeHover,
        handleNodeLeave
    };
};

/**
 * useChatHistory - Hook to access chat history for a specific node.
 * Shares the same cache as useChatPrefetch for instant loading.
 */
export const useChatHistory = (nodeId: string) => {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Effect to load data when nodeId changes
    useState(() => {
        // value initialization/reset when nodeId changes is handled by useEffect below
    });

    const loadChat = useCallback(async () => {
        if (!nodeId) {
            setData(null);
            return;
        }

        setIsLoading(true);

        try {
            // 1. Check Cache
            const cacheKey = `chat_node_${nodeId}`;
            const cached = chatCache.get(cacheKey);
            const now = Date.now();

            if (cached && (now - cached.timestamp < CACHE_TTL)) {
                console.log(`[ChatHistory] ⚡ Loaded from cache for node ${nodeId}`);
                setData(cached.data);
                setIsLoading(false);
                return;
            }

            // 2. Fetch from API
            console.log(`[ChatHistory] 📡 Fetching from API for node ${nodeId}...`);
            const response = await nodeApi.getChatHistory(nodeId);

            // 3. Update Cache
            chatCache.set(cacheKey, { data: response, timestamp: now });

            setData(response);
        } catch (error) {
            console.error(`[ChatHistory] ❌ Failed to fetch chat for node ${nodeId}`, error);
            setData(null);
        } finally {
            setIsLoading(false);
        }
    }, [nodeId]);

    // Effect to fetch data when nodeId changes
    useEffect(() => {
        loadChat();
    }, [loadChat]);

    return { data, isLoading, reload: loadChat };
};
