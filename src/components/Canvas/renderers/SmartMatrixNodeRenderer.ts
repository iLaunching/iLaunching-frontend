/**
 * SmartMatrixNodeRenderer
 * Custom renderer for AI-powered Smart Matrix nodes
 * 
 * Features:
 * - Model name and provider display
 * - Execution status indicator
 * - Real-time streaming text preview
 * - Token usage visualization
 * - Progress bar during execution
 * - Configuration summary
 * - Port rendering (inputs/outputs)
 * 
 * Visual States:
 * - Idle: Shows model info and config
 * - Executing: Shows progress, streaming text
 * - Success: Shows completion checkmark
 * - Error: Shows error indicator
 */

import type { Camera } from '../core/Camera.js';
import { SmartMatrixNode, MODEL_INFO, type AIModel } from '../nodes/SmartMatrixNode.js';

/**
 * Rendering configuration
 */
const RENDERER_CONFIG = {
  HEADER_HEIGHT: 40,
  PORT_RADIUS: 6,
  PORT_SPACING: 30,
  ICON_SIZE: 24,
  PADDING: 12,
  TEXT_LINE_HEIGHT: 18,
  PROGRESS_BAR_HEIGHT: 4,
  STREAM_PREVIEW_LINES: 3,
  COLORS: {
    BACKGROUND: '#1e1b4b',
    BACKGROUND_EXECUTING: '#312e81',
    BACKGROUND_SUCCESS: '#065f46',
    BACKGROUND_ERROR: '#7f1d1d',
    HEADER: '#4c1d95',
    BORDER: '#6d28d9',
    BORDER_SELECTED: '#a78bfa',
    BORDER_HOVER: '#8b5cf6',
    TEXT_PRIMARY: '#e9d5ff',
    TEXT_SECONDARY: '#c4b5fd',
    TEXT_MUTED: '#a78bfa',
    PORT_INPUT: '#10b981',
    PORT_OUTPUT: '#3b82f6',
    PROGRESS: '#8b5cf6',
    STREAM_TEXT: '#fbbf24'
  }
} as const;

export class SmartMatrixNodeRenderer {
  /**
   * Render a Smart Matrix node
   */
  public render(
    ctx: CanvasRenderingContext2D,
    node: SmartMatrixNode,
    camera: Camera
  ): void {
    try {
      ctx.save();
      
      // Get node bounds in screen space
      const [screenX, screenY] = camera.toScreen(node.x, node.y);
      const scaledWidth = node.width * camera.zoom;
      const scaledHeight = node.height * camera.zoom;
      
      // Viewport culling
      if (!this.isVisible(screenX, screenY, scaledWidth, scaledHeight, ctx.canvas)) {
        return;
      }
      
      // Choose background color based on status
      const bgColor = this.getBackgroundColor(node.status);
      
      // Draw node background
      ctx.fillStyle = bgColor;
      ctx.strokeStyle = node.isSelected 
        ? RENDERER_CONFIG.COLORS.BORDER_SELECTED 
        : node.isHovered 
        ? RENDERER_CONFIG.COLORS.BORDER_HOVER 
        : RENDERER_CONFIG.COLORS.BORDER;
      ctx.lineWidth = node.isSelected ? 3 : node.isHovered ? 2 : 1.5;
      
      this.roundRect(
        ctx,
        screenX,
        screenY,
        scaledWidth,
        scaledHeight,
        8 * camera.zoom
      );
      ctx.fill();
      ctx.stroke();
      
      // Draw header
      this.renderHeader(ctx, node, screenX, screenY, scaledWidth, camera.zoom);
      
      // Draw content based on status
      if (node.status === 'running') {
        this.renderExecutingState(ctx, node, screenX, screenY, scaledWidth, scaledHeight, camera.zoom);
      } else {
        this.renderIdleState(ctx, node, screenX, screenY, scaledWidth, scaledHeight, camera.zoom);
      }
      
      // Draw ports
      this.renderPorts(ctx, node, screenX, screenY, scaledHeight, camera.zoom);
      
      // Draw status indicator
      this.renderStatusIndicator(ctx, node, screenX, screenY, scaledWidth, camera.zoom);
      
      ctx.restore();
    } catch (error) {
      console.error('Error rendering SmartMatrixNode:', error);
      ctx.restore();
    }
  }
  
  /**
   * Render node header with model info
   */
  private renderHeader(
    ctx: CanvasRenderingContext2D,
    node: SmartMatrixNode,
    x: number,
    y: number,
    width: number,
    zoom: number
  ): void {
    const headerHeight = RENDERER_CONFIG.HEADER_HEIGHT * zoom;
    const padding = RENDERER_CONFIG.PADDING * zoom;
    
    // Header background
    ctx.fillStyle = RENDERER_CONFIG.COLORS.HEADER;
    this.roundRect(ctx, x, y, width, headerHeight, 8 * zoom, true, false);
    ctx.fill();
    
    // Model icon (AI sparkle)
    ctx.save();
    ctx.fillStyle = RENDERER_CONFIG.COLORS.TEXT_PRIMARY;
    ctx.font = `${20 * zoom}px Arial`;
    ctx.fillText('✨', x + padding, y + headerHeight / 2 + 8 * zoom);
    ctx.restore();
    
    // Model name
    const config = node.getConfig();
    const modelInfo = MODEL_INFO[config.model];
    
    ctx.fillStyle = RENDERER_CONFIG.COLORS.TEXT_PRIMARY;
    ctx.font = `bold ${14 * zoom}px sans-serif`;
    ctx.fillText(
      modelInfo.name,
      x + padding + 30 * zoom,
      y + headerHeight / 2 - 2 * zoom
    );
    
    // Provider
    ctx.fillStyle = RENDERER_CONFIG.COLORS.TEXT_MUTED;
    ctx.font = `${11 * zoom}px sans-serif`;
    ctx.fillText(
      modelInfo.provider,
      x + padding + 30 * zoom,
      y + headerHeight / 2 + 12 * zoom
    );
  }
  
  /**
   * Render idle state (config summary)
   */
  private renderIdleState(
    ctx: CanvasRenderingContext2D,
    node: SmartMatrixNode,
    x: number,
    y: number,
    width: number,
    height: number,
    zoom: number
  ): void {
    const headerHeight = RENDERER_CONFIG.HEADER_HEIGHT * zoom;
    const padding = RENDERER_CONFIG.PADDING * zoom;
    const lineHeight = RENDERER_CONFIG.TEXT_LINE_HEIGHT * zoom;
    
    let currentY = y + headerHeight + padding;
    
    const config = node.getConfig();
    
    // Configuration details
    ctx.fillStyle = RENDERER_CONFIG.COLORS.TEXT_SECONDARY;
    ctx.font = `${12 * zoom}px sans-serif`;
    
    // Temperature
    ctx.fillText(
      `Temperature: ${config.temperature.toFixed(1)}`,
      x + padding,
      currentY
    );
    currentY += lineHeight;
    
    // Max tokens
    ctx.fillText(
      `Max Tokens: ${config.maxTokens}`,
      x + padding,
      currentY
    );
    currentY += lineHeight;
    
    // Streaming indicator
    const streamIcon = config.streaming ? '🌊' : '📄';
    ctx.fillText(
      `${streamIcon} ${config.streaming ? 'Streaming' : 'Non-streaming'}`,
      x + padding,
      currentY
    );
    currentY += lineHeight;
    
    // System prompt preview (truncated)
    currentY += padding / 2;
    ctx.fillStyle = RENDERER_CONFIG.COLORS.TEXT_MUTED;
    ctx.font = `${10 * zoom}px sans-serif`;
    const promptPreview = this.truncateText(
      config.systemPrompt,
      Math.floor(width / (6 * zoom))
    );
    ctx.fillText(
      `System: ${promptPreview}`,
      x + padding,
      currentY
    );
  }
  
  /**
   * Render executing state (progress and streaming text)
   */
  private renderExecutingState(
    ctx: CanvasRenderingContext2D,
    node: SmartMatrixNode,
    x: number,
    y: number,
    width: number,
    height: number,
    zoom: number
  ): void {
    const headerHeight = RENDERER_CONFIG.HEADER_HEIGHT * zoom;
    const padding = RENDERER_CONFIG.PADDING * zoom;
    const lineHeight = RENDERER_CONFIG.TEXT_LINE_HEIGHT * zoom;
    
    const progress = node.getProgress();
    if (!progress) return;
    
    let currentY = y + headerHeight + padding;
    
    // Execution time
    const elapsed = Math.floor(progress.elapsed! / 1000);
    ctx.fillStyle = RENDERER_CONFIG.COLORS.TEXT_SECONDARY;
    ctx.font = `${12 * zoom}px sans-serif`;
    ctx.fillText(
      `Executing... ${elapsed}s`,
      x + padding,
      currentY
    );
    currentY += lineHeight + padding / 2;
    
    // Progress bar (indeterminate animation)
    this.renderProgressBar(
      ctx,
      x + padding,
      currentY,
      width - 2 * padding,
      RENDERER_CONFIG.PROGRESS_BAR_HEIGHT * zoom,
      progress.elapsed!
    );
    currentY += RENDERER_CONFIG.PROGRESS_BAR_HEIGHT * zoom + padding;
    
    // Streaming text preview
    if (progress.streamedText) {
      ctx.fillStyle = RENDERER_CONFIG.COLORS.STREAM_TEXT;
      ctx.font = `${11 * zoom}px monospace`;
      
      const lines = this.wrapText(
        progress.streamedText,
        Math.floor(width / (7 * zoom))
      );
      
      const maxLines = RENDERER_CONFIG.STREAM_PREVIEW_LINES;
      const displayLines = lines.slice(-maxLines); // Show last N lines
      
      displayLines.forEach((line, index) => {
        ctx.fillText(
          line,
          x + padding,
          currentY + index * lineHeight
        );
      });
      
      // Cursor animation
      const cursorBlink = Math.floor(progress.elapsed! / 500) % 2 === 0;
      if (cursorBlink) {
        const lastLine = displayLines[displayLines.length - 1] || '';
        const cursorX = x + padding + ctx.measureText(lastLine).width;
        const cursorY = currentY + (displayLines.length - 1) * lineHeight;
        
        ctx.fillStyle = RENDERER_CONFIG.COLORS.STREAM_TEXT;
        ctx.fillRect(cursorX, cursorY - 10 * zoom, 2 * zoom, 12 * zoom);
      }
    }
  }
  
  /**
   * Render progress bar with animation
   */
  private renderProgressBar(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    elapsed: number
  ): void {
    // Background
    ctx.fillStyle = 'rgba(139, 92, 246, 0.2)';
    ctx.fillRect(x, y, width, height);
    
    // Animated progress (indeterminate)
    const animationDuration = 2000; // 2 seconds
    const progress = (elapsed % animationDuration) / animationDuration;
    const barWidth = width * 0.3;
    const barX = x + (width - barWidth) * progress;
    
    ctx.fillStyle = RENDERER_CONFIG.COLORS.PROGRESS;
    ctx.fillRect(barX, y, barWidth, height);
  }
  
  /**
   * Render input/output ports
   */
  private renderPorts(
    ctx: CanvasRenderingContext2D,
    node: SmartMatrixNode,
    x: number,
    y: number,
    height: number,
    zoom: number
  ): void {
    const portRadius = RENDERER_CONFIG.PORT_RADIUS * zoom;
    
    // Input ports (left side)
    const inputPorts = node.getInputPorts();
    const inputSpacing = height / (inputPorts.length + 1);
    
    inputPorts.forEach((port, index) => {
      const portY = y + inputSpacing * (index + 1);
      
      // Port circle
      ctx.fillStyle = port.connected 
        ? RENDERER_CONFIG.COLORS.PORT_INPUT 
        : 'rgba(16, 185, 129, 0.3)';
      ctx.strokeStyle = RENDERER_CONFIG.COLORS.PORT_INPUT;
      ctx.lineWidth = 2 * zoom;
      
      ctx.beginPath();
      ctx.arc(x, portY, portRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Port label (if zoomed in enough)
      if (zoom > 0.5) {
        ctx.fillStyle = RENDERER_CONFIG.COLORS.TEXT_MUTED;
        ctx.font = `${10 * zoom}px sans-serif`;
        ctx.fillText(
          port.label,
          x + portRadius + 8 * zoom,
          portY + 4 * zoom
        );
      }
    });
    
    // Output ports (right side)
    const outputPorts = node.getOutputPorts();
    const outputSpacing = height / (outputPorts.length + 1);
    const width = node.width * zoom;
    
    outputPorts.forEach((port, index) => {
      const portY = y + outputSpacing * (index + 1);
      
      // Port circle
      ctx.fillStyle = port.connected 
        ? RENDERER_CONFIG.COLORS.PORT_OUTPUT 
        : 'rgba(59, 130, 246, 0.3)';
      ctx.strokeStyle = RENDERER_CONFIG.COLORS.PORT_OUTPUT;
      ctx.lineWidth = 2 * zoom;
      
      ctx.beginPath();
      ctx.arc(x + width, portY, portRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      // Port label (if zoomed in enough)
      if (zoom > 0.5) {
        ctx.fillStyle = RENDERER_CONFIG.COLORS.TEXT_MUTED;
        ctx.font = `${10 * zoom}px sans-serif`;
        ctx.textAlign = 'right';
        ctx.fillText(
          port.label,
          x + width - portRadius - 8 * zoom,
          portY + 4 * zoom
        );
        ctx.textAlign = 'left'; // Reset
      }
    });
  }
  
  /**
   * Render status indicator (top-right corner)
   */
  private renderStatusIndicator(
    ctx: CanvasRenderingContext2D,
    node: SmartMatrixNode,
    x: number,
    y: number,
    width: number,
    zoom: number
  ): void {
    const size = 12 * zoom;
    const margin = 8 * zoom;
    const indicatorX = x + width - size - margin;
    const indicatorY = y + margin;
    
    // Status icon
    let icon = '';
    let color = '';
    
    switch (node.status) {
      case 'running':
        icon = '⏳';
        color = RENDERER_CONFIG.COLORS.PROGRESS;
        break;
      case 'success':
        icon = '✅';
        color = '#10b981';
        break;
      case 'error':
        icon = '❌';
        color = '#ef4444';
        break;
      case 'idle':
        icon = '⭕';
        color = RENDERER_CONFIG.COLORS.TEXT_MUTED;
        break;
    }
    
    ctx.save();
    ctx.font = `${size}px Arial`;
    ctx.fillText(icon, indicatorX, indicatorY + size);
    ctx.restore();
  }
  
  // ============================================================================
  // UTILITIES
  // ============================================================================
  
  /**
   * Get background color based on status
   */
  private getBackgroundColor(status: string): string {
    switch (status) {
      case 'running':
        return RENDERER_CONFIG.COLORS.BACKGROUND_EXECUTING;
      case 'success':
        return RENDERER_CONFIG.COLORS.BACKGROUND_SUCCESS;
      case 'error':
        return RENDERER_CONFIG.COLORS.BACKGROUND_ERROR;
      default:
        return RENDERER_CONFIG.COLORS.BACKGROUND;
    }
  }
  
  /**
   * Check if node is visible in viewport
   */
  private isVisible(
    x: number,
    y: number,
    width: number,
    height: number,
    canvas: HTMLCanvasElement
  ): boolean {
    return !(
      x + width < 0 ||
      x > canvas.width ||
      y + height < 0 ||
      y > canvas.height
    );
  }
  
  /**
   * Draw rounded rectangle
   */
  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
    topOnly: boolean = false,
    bottomOnly: boolean = false
  ): void {
    ctx.beginPath();
    
    if (topOnly) {
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height);
      ctx.lineTo(x, y + height);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
    } else if (bottomOnly) {
      ctx.moveTo(x, y);
      ctx.lineTo(x + width, y);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y);
    } else {
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
    }
    
    ctx.closePath();
  }
  
  /**
   * Truncate text to max length
   */
  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
  }
  
  /**
   * Wrap text to multiple lines
   */
  private wrapText(text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    words.forEach(word => {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      if (testLine.length > maxWidth) {
        if (currentLine) lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    });
    
    if (currentLine) lines.push(currentLine);
    return lines;
  }
}
