/**
 * Validation Utilities
 * Type guards and validation functions for configuration and runtime safety
 */

import type { CanvasEngineConfig, CameraState } from '../types/index.js';

/**
 * Validate canvas engine configuration
 * @throws {Error} If configuration is invalid
 */
export function validateEngineConfig(config: CanvasEngineConfig): void {
  if (!config.containerElement) {
    throw new Error('Canvas engine requires a containerElement');
  }

  if (!(config.containerElement instanceof HTMLElement)) {
    throw new Error('containerElement must be an HTMLElement');
  }

  // Validate camera config if provided
  if (config.initialCamera) {
    validateCameraState(config.initialCamera);
  }

  // Validate grid size
  if (config.gridSize !== undefined) {
    if (!Number.isFinite(config.gridSize) || config.gridSize <= 0) {
      throw new Error('gridSize must be a positive number');
    }
  }
}

/**
 * Validate camera state
 * @throws {Error} If camera state is invalid
 */
export function validateCameraState(camera: Partial<CameraState>): void {
  if (camera.x !== undefined && !Number.isFinite(camera.x)) {
    throw new Error('Camera x must be a finite number');
  }

  if (camera.y !== undefined && !Number.isFinite(camera.y)) {
    throw new Error('Camera y must be a finite number');
  }

  if (camera.zoom !== undefined) {
    if (!Number.isFinite(camera.zoom) || camera.zoom <= 0) {
      throw new Error('Camera zoom must be a positive number');
    }
  }

  if (camera.minZoom !== undefined && camera.maxZoom !== undefined) {
    if (camera.minZoom >= camera.maxZoom) {
      throw new Error('Camera minZoom must be less than maxZoom');
    }
  }

  if (camera.minZoom !== undefined && camera.minZoom <= 0) {
    throw new Error('Camera minZoom must be positive');
  }

  if (camera.maxZoom !== undefined && camera.maxZoom <= 0) {
    throw new Error('Camera maxZoom must be positive');
  }
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Check if a value is a finite number
 */
export function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

/**
 * Safe parseFloat with default value
 */
export function safeParseFloat(value: unknown, defaultValue: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return defaultValue;
}
