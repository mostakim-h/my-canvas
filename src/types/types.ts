export type ShapeType = "rect" | "circle" | "text" | "triangle" | "pen" | "brush";

export interface BaseShape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  text?: string;
  // For pen/brush tools
  points?: Array<{ x: number; y: number }>;
}

export interface Handle {
  name: string;
  x: number;
  y: number;
}

export interface PointerState {
  dragging: boolean;
  resizing: boolean;
  offsetX: number;
  offsetY: number;
  handle?: string | null;
  initial: BaseShape | null;
}

export interface CanvasState {
  tool: ShapeType | "select";
  shapes: BaseShape[];
  selectedId: string | null;
  color: string;
  isDrawing: boolean;
  startPos: { x: number; y: number } | null;
}

export interface Point {
  x: number;
  y: number;
}