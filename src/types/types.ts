export type ShapeType = "rect" | "circle" | "text";

export type BaseShape = {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  w: number;
  h: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  rotation?: number;
  text?: string;
};