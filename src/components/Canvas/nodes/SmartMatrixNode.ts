/**
 * SmartMatrixNode
 * AI-powered node for executing LLM queries in the automation workflow
 * 
 * Features:
 * - Multiple AI model support (GPT-4, Claude, etc.)
 * - Real-time streaming responses via WebSocket
 * - Configurable parameters (temperature, max tokens, system prompt)
 * - Input/output data flow integration
 * - Execution progress tracking
 * - Result caching and storage
 * - Error handling with retries
 * 
 * @example
 * ```typescript
 * const node = new SmartMatrixNode('node-1', 100, 100);
 * node.setConfig({ model: 'gpt-4', temperature: 0.7 });
 * const result = await node.execute({ prompt: 'Analyze this data...' });
 * ```
 */

import { BaseNode } from './BaseNode.js';
import type { NodeType, UUID, ExecutionContext, ExecutionResult } from '../types/index.js';

/**
 * Available AI models
 */
export type AIModel = 
  | 'gpt-4'
  | 'gpt-4-turbo'
  | 'gpt-3.5-turbo'
  | 'claude-3-opus'
  | 'claude-3-sonnet'
  | 'claude-3-haiku';

/**
 * AI model configuration
 */
export interface ModelConfig {
  model: AIModel;
  temperature: number;        // 0.0 to 2.0
  maxTokens: number;          // Maximum response length
  topP?: number;              // Nucleus sampling (0.0 to 1.0)
  frequencyPenalty?: number;  // -2.0 to 2.0
  presencePenalty?: number;   // -2.0 to 2.0
  stopSequences?: string[];   // Array of sequences to stop generation
}

/**
 * System prompt templates
 */
export type PromptTemplate = 
  | 'general'
  | 'analysis'
  | 'creative'
  | 'code'
  | 'summarize'
  | 'custom';

/**
 * Execution statistics
 */
export interface ExecutionStats {
  startTime: number;
  endTime?: number;
  duration?: number;
  tokensUsed?: {
    prompt: number;
    completion: number;
    total: number;
  };
  cost?: number;
  streamChunks?: number;
}

/**
 * Smart Matrix Node configuration
 */
export interface SmartMatrixConfig extends ModelConfig {
  systemPrompt: string;
  promptTemplate: PromptTemplate;
  streaming: boolean;
  retryOnError: boolean;
  maxRetries: number;
  timeout: number; // milliseconds
  fallbackModel?: AIModel;
}

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: SmartMatrixConfig = {
  model: 'gpt-4-turbo',
  temperature: 0.7,
  maxTokens: 2000,
  topP: 1.0,
  frequencyPenalty: 0,
  presencePenalty: 0,
  systemPrompt: 'You are a helpful AI assistant.',
  promptTemplate: 'general',
  streaming: true,
  retryOnError: true,
  maxRetries: 3,
  timeout: 60000, // 60 seconds
};

/**
 * Model metadata for UI display
 */
export const MODEL_INFO: Record<AIModel, { name: string; provider: string; maxTokens: number; costPer1kTokens: number }> = {
  'gpt-4': {
    name: 'GPT-4',
    provider: 'OpenAI',
    maxTokens: 8192,
    costPer1kTokens: 0.03
  },
  'gpt-4-turbo': {
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    maxTokens: 128000,
    costPer1kTokens: 0.01
  },
  'gpt-3.5-turbo': {
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    maxTokens: 16384,
    costPer1kTokens: 0.002
  },
  'claude-3-opus': {
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    maxTokens: 200000,
    costPer1kTokens: 0.015
  },
  'claude-3-sonnet': {
    name: 'Claude 3 Sonnet',
    provider: 'Anthropic',
    maxTokens: 200000,
    costPer1kTokens: 0.003
  },
  'claude-3-haiku': {
    name: 'Claude 3 Haiku',
    provider: 'Anthropic',
    maxTokens: 200000,
    costPer1kTokens: 0.00025
  }
};

/**
 * Smart Matrix Node implementation
 */
export class SmartMatrixNode extends BaseNode {
  // Configuration
  private config: SmartMatrixConfig;
  
  // Execution state
  private currentExecution?: {
    sessionId: string;
    abortController: AbortController;
    websocket?: WebSocket;
    streamedText: string;
    stats: ExecutionStats;
  };
  
  // Results cache
  private resultCache: Map<string, { result: any; timestamp: number }> = new Map();
  private cacheTimeout = 300000; // 5 minutes
  
  constructor(id: UUID, x: number, y: number) {
    super(id, 'smart-matrix', x, y, 280, 200, 'Smart Matrix');
    
    // Initialize config with defaults
    this.config = { ...DEFAULT_CONFIG };
    
    // Set node color
    this.color = '#8b5cf6'; // Purple for AI nodes
    
    // Setup ports
    this.initializePorts();
  }
  
  /**
   * Initialize input and output ports
   */
  private initializePorts(): void {
    // Input ports
    this.addInputPort('prompt', 'string', 'Prompt', true);
    this.addInputPort('context', 'string', 'Context', false);
    this.addInputPort('data', 'any', 'Data', false);
    
    // Output ports
    this.addOutputPort('response', 'string', 'Response');
    this.addOutputPort('tokens', 'object', 'Token Usage');
    this.addOutputPort('metadata', 'object', 'Metadata');
  }
  
  // ============================================================================
  // CONFIGURATION
  // ============================================================================
  
  /**
   * Update node configuration
   */
  public setConfig(config: Partial<SmartMatrixConfig>): void {
    this.config = {
      ...this.config,
      ...config
    };
    
    // Validate configuration
    this.validateConfig();
    
    this.updatedAt = Date.now();
  }
  
  /**
   * Get current configuration
   */
  public getConfig(): SmartMatrixConfig {
    return { ...this.config };
  }
  
  /**
   * Validate configuration values
   */
  private validateConfig(): void {
    // Temperature bounds
    if (this.config.temperature < 0 || this.config.temperature > 2) {
      throw new Error('Temperature must be between 0 and 2');
    }
    
    // Max tokens
    const modelInfo = MODEL_INFO[this.config.model];
    if (this.config.maxTokens > modelInfo.maxTokens) {
      this.config.maxTokens = modelInfo.maxTokens;
    }
    
    // Top P bounds
    if (this.config.topP !== undefined && (this.config.topP < 0 || this.config.topP > 1)) {
      throw new Error('Top P must be between 0 and 1');
    }
    
    // Penalty bounds
    if (this.config.frequencyPenalty !== undefined && 
        (this.config.frequencyPenalty < -2 || this.config.frequencyPenalty > 2)) {
      throw new Error('Frequency penalty must be between -2 and 2');
    }
    
    if (this.config.presencePenalty !== undefined && 
        (this.config.presencePenalty < -2 || this.config.presencePenalty > 2)) {
      throw new Error('Presence penalty must be between -2 and 2');
    }
  }
  
  // ============================================================================
  // EXECUTION
  // ============================================================================
  
  /**
   * Execute the AI query
   * @override
   */
  public async execute(
    inputs: Record<string, any>,
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    try {
      // Validate inputs
      if (!inputs.prompt || typeof inputs.prompt !== 'string') {
        throw new Error('Prompt input is required and must be a string');
      }
      
      // Check cache
      const cacheKey = this.getCacheKey(inputs);
      const cached = this.resultCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
        const outputsMap = new Map<string, any>();
        if (cached.result) {
          Object.entries(cached.result).forEach(([key, value]) => {
            outputsMap.set(key, value);
          });
        }
        return {
          success: true,
          outputs: outputsMap,
          duration: 0
        };
      }
      
      // Update status
      this.status = 'running';
      this.errorMessage = undefined;
      
      // Execute with retry logic
      let lastError: Error | undefined;
      for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
        try {
          const result = await this.executeQuery(inputs, context, attempt);
          
          // Cache successful result
          this.resultCache.set(cacheKey, {
            result: result.outputs,
            timestamp: Date.now()
          });
          
          // Update status
          this.status = 'success';
          this.lastExecutionTime = Date.now();
          this.executionCount++;
          
          return result;
        } catch (error) {
          lastError = error as Error;
          
          // Don't retry if not configured
          if (!this.config.retryOnError || attempt === this.config.maxRetries) {
            break;
          }
          
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }
      
      // All retries failed
      throw lastError || new Error('Execution failed');
      
    } catch (error) {
      this.status = 'error';
      this.errorMessage = (error as Error).message;
      
      return {
        success: false,
        outputs: new Map<string, any>(),
        error: error as Error,
        duration: 0
      };
    }
  }
  
  /**
   * Execute single query attempt
   */
  private async executeQuery(
    inputs: Record<string, any>,
    context: ExecutionContext,
    attemptNumber: number
  ): Promise<ExecutionResult> {
    const stats: ExecutionStats = {
      startTime: Date.now()
    };
    
    // Build prompt
    const fullPrompt = this.buildPrompt(inputs);
    
    // Setup abort controller
    const abortController = new AbortController();
    
    // Setup session
    const sessionId = `${this.id}-${Date.now()}`;
    this.currentExecution = {
      sessionId,
      abortController,
      streamedText: '',
      stats
    };
    
    try {
      let response: string;
      let tokenUsage: any;
      
      if (this.config.streaming) {
        // Execute with streaming
        const streamResult = await this.executeStreaming(fullPrompt, abortController.signal);
        response = streamResult.text;
        tokenUsage = streamResult.tokenUsage;
        stats.streamChunks = streamResult.chunks;
      } else {
        // Execute non-streaming
        const result = await this.executeNonStreaming(fullPrompt, abortController.signal);
        response = result.text;
        tokenUsage = result.tokenUsage;
      }
      
      // Update stats
      stats.endTime = Date.now();
      stats.duration = stats.endTime - stats.startTime;
      stats.tokensUsed = tokenUsage;
      stats.cost = this.calculateCost(tokenUsage);
      
      // Return result
      const outputsMap = new Map<string, any>();
      outputsMap.set('response', response);
      outputsMap.set('tokens', tokenUsage);
      outputsMap.set('metadata', {
        model: this.config.model,
        duration: stats.duration,
        cost: stats.cost,
        attempt: attemptNumber + 1,
        sessionId
      });
      
      return {
        success: true,
        outputs: outputsMap,
        duration: stats.duration || 0
      };
      
    } finally {
      // Cleanup
      this.currentExecution = undefined;
    }
  }
  
  /**
   * Build full prompt from inputs and system prompt
   */
  private buildPrompt(inputs: Record<string, any>): string {
    let prompt = inputs.prompt;
    
    // Add context if provided
    if (inputs.context) {
      prompt = `Context: ${inputs.context}\n\n${prompt}`;
    }
    
    // Add data if provided
    if (inputs.data) {
      const dataStr = typeof inputs.data === 'string' 
        ? inputs.data 
        : JSON.stringify(inputs.data, null, 2);
      prompt = `Data:\n${dataStr}\n\n${prompt}`;
    }
    
    return prompt;
  }
  
  /**
   * Execute with streaming (WebSocket)
   */
  private async executeStreaming(
    prompt: string,
    signal: AbortSignal
  ): Promise<{ text: string; tokenUsage: any; chunks: number }> {
    return new Promise((resolve, reject) => {
      try {
        // Connect to WebSocket
        const wsUrl = `${this.getWebSocketUrl()}?session_id=${this.currentExecution!.sessionId}`;
        const ws = new WebSocket(wsUrl);
        
        if (!this.currentExecution) {
          reject(new Error('Execution state lost'));
          return;
        }
        
        this.currentExecution.websocket = ws;
        
        let streamedText = '';
        let chunkCount = 0;
        let tokenUsage: any = {};
        
        // Setup abort handler
        signal.addEventListener('abort', () => {
          ws.close();
          reject(new Error('Execution aborted'));
        });
        
        // Setup timeout
        const timeout = setTimeout(() => {
          ws.close();
          reject(new Error('Execution timeout'));
        }, this.config.timeout);
        
        ws.onopen = () => {
          // Send query
          ws.send(JSON.stringify({
            type: 'query',
            prompt,
            systemPrompt: this.config.systemPrompt,
            model: this.config.model,
            temperature: this.config.temperature,
            maxTokens: this.config.maxTokens,
            topP: this.config.topP,
            frequencyPenalty: this.config.frequencyPenalty,
            presencePenalty: this.config.presencePenalty,
            stopSequences: this.config.stopSequences
          }));
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.type === 'chunk') {
              // Append streamed text
              streamedText += data.content;
              chunkCount++;
              
              // Update execution state
              if (this.currentExecution) {
                this.currentExecution.streamedText = streamedText;
              }
              
            } else if (data.type === 'done') {
              // Stream complete
              tokenUsage = data.tokenUsage || {};
              clearTimeout(timeout);
              ws.close();
              resolve({ text: streamedText, tokenUsage, chunks: chunkCount });
              
            } else if (data.type === 'error') {
              // Stream error
              clearTimeout(timeout);
              ws.close();
              reject(new Error(data.message || 'Stream error'));
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        ws.onerror = (error) => {
          clearTimeout(timeout);
          reject(new Error('WebSocket connection error'));
        };
        
        ws.onclose = (event) => {
          clearTimeout(timeout);
          if (!event.wasClean) {
            reject(new Error('WebSocket connection closed unexpectedly'));
          }
        };
        
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Execute without streaming (HTTP)
   */
  private async executeNonStreaming(
    prompt: string,
    signal: AbortSignal
  ): Promise<{ text: string; tokenUsage: any }> {
    const response = await fetch(this.getApiUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`
      },
      body: JSON.stringify({
        prompt,
        systemPrompt: this.config.systemPrompt,
        model: this.config.model,
        temperature: this.config.temperature,
        maxTokens: this.config.maxTokens,
        topP: this.config.topP,
        frequencyPenalty: this.config.frequencyPenalty,
        presencePenalty: this.config.presencePenalty,
        stopSequences: this.config.stopSequences
      }),
      signal
    });
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }
    
    const data = await response.json();
    return {
      text: data.response,
      tokenUsage: data.tokenUsage || {}
    };
  }
  
  /**
   * Cancel current execution
   */
  public cancel(): void {
    if (this.currentExecution) {
      this.currentExecution.abortController.abort();
      
      if (this.currentExecution.websocket) {
        this.currentExecution.websocket.close();
      }
      
      this.status = 'idle';
      this.currentExecution = undefined;
    }
  }
  
  /**
   * Get current execution progress
   */
  public getProgress(): {
    isExecuting: boolean;
    streamedText: string;
    startTime?: number;
    elapsed?: number;
  } | null {
    if (!this.currentExecution) {
      return null;
    }
    
    const elapsed = Date.now() - this.currentExecution.stats.startTime;
    
    return {
      isExecuting: true,
      streamedText: this.currentExecution.streamedText,
      startTime: this.currentExecution.stats.startTime,
      elapsed
    };
  }
  
  // ============================================================================
  // UTILITIES
  // ============================================================================
  
  /**
   * Generate cache key from inputs
   */
  private getCacheKey(inputs: Record<string, any>): string {
    return JSON.stringify({
      prompt: inputs.prompt,
      context: inputs.context,
      data: inputs.data,
      config: {
        model: this.config.model,
        temperature: this.config.temperature,
        systemPrompt: this.config.systemPrompt
      }
    });
  }
  
  /**
   * Calculate cost from token usage
   */
  private calculateCost(tokenUsage: any): number {
    if (!tokenUsage || !tokenUsage.total) return 0;
    
    const modelInfo = MODEL_INFO[this.config.model];
    return (tokenUsage.total / 1000) * modelInfo.costPer1kTokens;
  }
  
  /**
   * Get API base URL
   */
  private getApiUrl(): string {
    // TODO: Get from environment or config
    return '/api/smart-matrix/execute';
  }
  
  /**
   * Get WebSocket URL
   */
  private getWebSocketUrl(): string {
    // TODO: Get from environment or config
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/api/smart-matrix/stream`;
  }
  
  /**
   * Get authentication token
   */
  private getAuthToken(): string {
    // TODO: Get from auth context
    return '';
  }
  
  /**
   * Clear result cache
   */
  public clearCache(): void {
    this.resultCache.clear();
  }
  
  /**
   * Validate inputs before execution
   * @override
   */
  public validateInputs(inputs: Record<string, any>): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check required prompt
    if (!inputs.prompt) {
      errors.push('Prompt is required');
    } else if (typeof inputs.prompt !== 'string') {
      errors.push('Prompt must be a string');
    }
    
    // Check data type if provided
    if (inputs.data !== undefined && inputs.data !== null) {
      // Data can be any type
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Serialize node to data format
   * @override
   */
  public getNodeData(): any {
    return {
      config: this.config,
      executionStats: this.currentExecution?.stats
    };
  }
  
  /**
   * Cleanup resources
   * @override
   */
  public destroy(): void {
    // Cancel any running execution
    this.cancel();
    
    // Clear cache
    this.clearCache();
  }
}
