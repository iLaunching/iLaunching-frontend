/**
 * Sales API Client
 * Handles sales conversation and streaming responses
 */

import apiClient from './auth';

// ============================================
// Sales API Response Types
// ============================================

export interface MessageRequest {
  session_id: string;
  message: string;
  email?: string;
  name?: string;
}

export interface MessageResponse {
  message: string;
  stage: string;
  qualification_score: number;
  should_handoff: boolean;
  sales_profile_id?: string;
}

export interface ConversationCreate {
  session_id: string;
  email: string;
  name?: string;
}

export interface ConversationResponse {
  id: string;
  session_id: string;
  email: string;
  current_stage: string;
  total_messages: number;
  qualification_score: number;
  engagement_score: number;
  quality_tier: string;
  pain_points: string[];
  goals: string[];
  budget_signals: string[];
  industry?: string;
  company_size?: string;
  urgency_level?: string;
  decision_authority?: string;
  converted: boolean;
  sales_profile_id?: string;
}

// ============================================
// Sales API Functions
// ============================================

// Get sales API base URL from environment
const SALES_API_URL = import.meta.env.VITE_SALES_API_URL || 'http://localhost:8001/api/sales';

export const salesApi = {
  /**
   * Create a new sales conversation
   */
  async createConversation(data: ConversationCreate): Promise<ConversationResponse> {
    try {
      const response = await apiClient.post(`${SALES_API_URL}/conversations`, data);
      return response.data;
    } catch (error) {
      console.error('Create conversation failed:', error);
      throw error;
    }
  },

  /**
   * Send a message and get AI response
   */
  async sendMessage(request: MessageRequest): Promise<MessageResponse> {
    try {
      const response = await apiClient.post(`${SALES_API_URL}/message`, request);
      return response.data;
    } catch (error) {
      console.error('Send message failed:', error);
      throw error;
    }
  },

  /**
   * Get conversation by session ID
   */
  async getConversation(sessionId: string): Promise<ConversationResponse> {
    try {
      const response = await apiClient.get(`${SALES_API_URL}/conversations/session/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Get conversation failed:', error);
      throw error;
    }
  },

  /**
   * Stream messages using Server-Sent Events (SSE)
   * This provides a streaming interface for real-time responses
   */
  createMessageStream(
    request: MessageRequest,
    onMessage: (response: MessageResponse) => void,
    onError: (error: Error) => void,
    onComplete: () => void
  ): () => void {
    // For now, we'll simulate streaming by sending the message and processing the response
    // In the future, this can be upgraded to use WebSocket or SSE
    
    let cancelled = false;
    
    const processMessage = async () => {
      try {
        if (cancelled) return;
        
        const response = await this.sendMessage(request);
        
        if (cancelled) return;
        
        // Simulate streaming by breaking the message into chunks
        const message = response.message;
        const chunkSize = 10; // Characters per chunk
        let index = 0;
        
        const streamChunks = () => {
          if (cancelled || index >= message.length) {
            if (!cancelled) {
              onComplete();
            }
            return;
          }
          
          const chunk = message.slice(0, index + chunkSize);
          index += chunkSize;
          
          onMessage({
            ...response,
            message: chunk
          });
          
          // Continue streaming
          setTimeout(streamChunks, 50); // 50ms delay between chunks
        };
        
        streamChunks();
        
      } catch (error) {
        if (!cancelled) {
          onError(error as Error);
        }
      }
    };
    
    processMessage();
    
    // Return cancellation function
    return () => {
      cancelled = true;
    };
  },

  /**
   * Generate a unique session ID
   */
  generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
};

export default salesApi;