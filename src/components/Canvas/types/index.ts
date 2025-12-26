/**
 * Canvas Engine Type Definitions
 * Complete type system for node-based automation builder
 */

// ============================================================================
// GEOMETRY TYPES
// ============================================================================

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ============================================================================
// CAMERA TYPES
// ============================================================================

export interface CameraState {
  x: number;
  y: number;
  zoom: number;
  minZoom: number;
  maxZoom: number;
}

export interface CameraTransform {
  toScreen: (worldX: number, worldY: number) => [number, number];
  toWorld: (screenX: number, screenY: number) => [number, number];
}

// ============================================================================
// NODE PORT TYPES
// ============================================================================

export type PortType = 'input' | 'output';
export type DataType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'event' | 'stream' | 'any';

export interface NodePort {
  id: string;
  type: PortType;
  dataType: DataType;
  label: string;
  position: Point;
  connected: boolean;
  value?: any;
}

// ============================================================================
// NODE TYPES
// ============================================================================

export type NodeType = 
  | 'smart-matrix'
  | 'trigger'
  | 'data-source'
  | 'filter'
  | 'transform'
  | 'condition'
  | 'loop'
  | 'output'
  | 'webhook'
  | 'schedule'
  | 'api-call';

export type NodeStatus = 'idle' | 'running' | 'success' | 'error' | 'warning';

export interface NodeData {
  id: string;
  type: NodeType;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  icon: string;
  color: string;
  status: NodeStatus;
  config: Record<string, any>;
  inputPorts: NodePort[];
  outputPorts: NodePort[];
  metadata?: {
    createdAt: number;
    updatedAt: number;
    executionCount: number;
    lastExecutionTime?: number;
    error?: string;
  };
}

// ============================================================================
// LINK TYPES
// ============================================================================

export interface LinkData {
  id: string;
  fromNodeId: string;
  fromPortId: string;
  toNodeId: string;
  toPortId: string;
  animated: boolean;
  color: string;
  pulseSpeed: number;
  status: 'idle' | 'active' | 'error';
}

export interface BezierControlPoints {
  cp1: Point;
  cp2: Point;
}

// ============================================================================
// INTERACTION TYPES
// ============================================================================

export type InteractionMode = 
  | 'select'
  | 'pan'
  | 'drag-node'
  | 'box-select'
  | 'create-link'
  | 'drag-canvas';

export interface DragState {
  active: boolean;
  nodeId?: string;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
}

export interface SelectionState {
  selectedNodeIds: Set<string>;
  selectedLinkIds: Set<string>;
  selectionBox?: Rect;
}

// ============================================================================
// ENGINE CONFIG TYPES
// ============================================================================

export interface CanvasEngineConfig {
  containerElement: HTMLElement;
  initialCamera?: Partial<CameraState>;
  gridEnabled?: boolean;
  gridSize?: number;
  snapToGrid?: boolean;
  performanceMode?: 'high' | 'balanced' | 'low';
  maxNodes?: number;
  enableDebug?: boolean;
}

export interface RenderConfig {
  showGrid: boolean;
  showFPS: boolean;
  showNodeIds: boolean;
  showPortLabels: boolean;
  enableAnimations: boolean;
  renderShadows: boolean;
  renderAntialiasing: boolean;
}

// ============================================================================
// EVENT TYPES
// ============================================================================

export type CanvasEventType =
  | 'node-added'
  | 'node-removed'
  | 'node-updated'
  | 'node-selected'
  | 'node-deselected'
  | 'link-added'
  | 'link-removed'
  | 'link-updated'
  | 'camera-changed'
  | 'execution-started'
  | 'execution-completed'
  | 'execution-failed'
  | 'state-changed';

export interface CanvasEvent<T = any> {
  type: CanvasEventType;
  timestamp: number;
  data: T;
}

export type CanvasEventListener<T = any> = (event: CanvasEvent<T>) => void;

// ============================================================================
// STATE TYPES
// ============================================================================

export interface CanvasState {
  nodes: Map<string, NodeData>;
  links: Map<string, LinkData>;
  camera: CameraState;
  selection: SelectionState;
  interaction: {
    mode: InteractionMode;
    drag: DragState;
  };
  history: {
    past: CanvasSnapshot[];
    future: CanvasSnapshot[];
  };
}

export interface CanvasSnapshot {
  timestamp: number;
  nodes: NodeData[];
  links: LinkData[];
  camera: CameraState;
}

// ============================================================================
// EXECUTION TYPES
// ============================================================================

export interface ExecutionContext {
  nodeId: string;
  inputs: Map<string, any>;
  outputs: Map<string, any>;
  metadata: {
    startTime: number;
    endTime?: number;
    error?: Error;
  };
}

export interface ExecutionResult {
  success: boolean;
  outputs: Map<string, any>;
  error?: Error;
  duration: number;
}

// ============================================================================
// SMART MATRIX SPECIFIC TYPES
// ============================================================================

export type AnalysisType = 'competitor' | 'market' | 'content' | 'full' | 'custom';

export interface SmartMatrixConfig {
  analysisType: AnalysisType;
  industry: string;
  targetAudience: string;
  competitors: string[];
  enableRealTimeData: boolean;
  cacheDuration: number;
  customPrompt?: string;
  filters?: {
    dateRange?: { start: Date; end: Date };
    regions?: string[];
    languages?: string[];
  };
}

export interface SmartMatrixResult {
  jobId: string;
  status: 'queued' | 'analyzing' | 'complete' | 'error';
  progress: number;
  results?: {
    competitorInsights?: any;
    marketTrends?: any;
    recommendations?: any[];
    fullAnalysis?: any;
  };
  error?: string;
  metadata: {
    startTime: number;
    endTime?: number;
    tokensUsed?: number;
    cost?: number;
  };
}

// ============================================================================
// API TYPES
// ============================================================================

export interface ScenarioData {
  id: string;
  name: string;
  description?: string;
  nodes: NodeData[];
  links: LinkData[];
  camera?: CameraState;
  metadata: {
    createdAt: number;
    updatedAt: number;
    version: string;
    tags?: string[];
  };
}

export interface SaveScenarioRequest {
  name: string;
  description?: string;
  nodes: NodeData[];
  links: LinkData[];
  tags?: string[];
}

export interface SaveScenarioResponse {
  scenarioId: string;
  success: boolean;
  message?: string;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type UUID = string;

export type Vector2 = [number, number];

export type RGB = [number, number, number];

export type RGBA = [number, number, number, number];

export interface BoundingBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  nodeCount: number;
  linkCount: number;
  renderTime: number;
  updateTime: number;
  memoryUsage?: number;
}

