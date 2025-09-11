import { BaseShape, Handle, Point } from "@/types/types";

/**
 * Convert mouse event coordinates to canvas coordinates
 */
export function getCanvasCoordinates(
  event: PointerEvent | MouseEvent,
  canvas: HTMLCanvasElement
): Point {
  const rect = canvas.getBoundingClientRect();
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
  };
}

/**
 * Test if a point hits a shape
 */
export function hitTestShape(x: number, y: number, shapes: BaseShape[]): BaseShape | null {
  for (let i = shapes.length - 1; i >= 0; i--) {
    const shape = shapes[i];

    if (shape.type === "rect" || shape.type === "text" || shape.type === "triangle") {
      if (x >= shape.x && x <= shape.x + shape.w && y >= shape.y && y <= shape.y + shape.h) {
        return shape;
      }
    } else if (shape.type === "circle") {
      const centerX = shape.x + shape.w / 2;
      const centerY = shape.y + shape.h / 2;
      const radiusX = shape.w / 2;
      const radiusY = shape.h / 2;
      const normalizedX = (x - centerX) / radiusX;
      const normalizedY = (y - centerY) / radiusY;

      if (normalizedX * normalizedX + normalizedY * normalizedY <= 1) {
        return shape;
      }
    } else if (shape.type === "pen" || shape.type === "brush") {
      if (shape.points) {
        const threshold = shape.strokeWidth || 5;
        for (const point of shape.points) {
          const distance = Math.sqrt((x - point.x) ** 2 + (y - point.y) ** 2);
          if (distance <= threshold) {
            return shape;
          }
        }
      }
    }
  }

  return null;
}

/**
 * Get resize handles for a shape
 */
export function getShapeHandles(shape: BaseShape): Handle[] {
  const { x, y, w, h } = shape;

  return [
    { name: "nw", x: x, y: y },
    { name: "n", x: x + w / 2, y: y },
    { name: "ne", x: x + w, y: y },
    { name: "e", x: x + w, y: y + h / 2 },
    { name: "se", x: x + w, y: y + h },
    { name: "s", x: x + w / 2, y: y + h },
    { name: "sw", x: x, y: y + h },
    { name: "w", x: x, y: y + h / 2 },
  ];
}

/**
 * Test if a point hits a resize handle
 */
export function hitTestHandle(x: number, y: number, handles: Handle[]): Handle | null {
  const threshold = 8;

  return handles.find(handle =>
    Math.abs(handle.x - x) <= threshold && Math.abs(handle.y - y) <= threshold
  ) || null;
}

/**
 * Create a new shape based on tool type
 * @deprecated Use ShapeFactory.createShape instead
 */
export function createShape(
  tool: string,
  startPoint: Point,
  color: string,
  id?: string
): BaseShape {
  const shapeId = id || Math.random().toString(36).slice(2, 9);

  const baseShape: BaseShape = {
    id: shapeId,
    type: tool as never,
    x: startPoint.x,
    y: startPoint.y,
    w: 120,
    h: 80,
    fill: color,
    stroke: "#000",
    strokeWidth: 1,
  };

  switch (tool) {
    case "text":
      return { ...baseShape, text: "Double click to edit" };
    case "pen":
    case "brush":
      return {
        ...baseShape,
        w: 0,
        h: 0,
        points: [startPoint],
        strokeWidth: tool === "brush" ? 8 : 2,
      };
    case "triangle":
      return baseShape;
    default:
      return baseShape;
  }
}

/**
 * Update shape during resize operation
 */
export function resizeShape(
  shape: BaseShape,
  handleName: string,
  currentPoint: Point,
  initialShape: BaseShape
): BaseShape {
  let { x, y, w, h } = shape;
  const minSize = 20;
  const init = initialShape;

  switch (handleName) {
    case "nw":
      x = Math.min(init.x + init.w - minSize, currentPoint.x);
      y = Math.min(init.y + init.h - minSize, currentPoint.y);
      w = init.x + init.w - x;
      h = init.y + init.h - y;
      break;
    case "n":
      y = Math.min(init.y + init.h - minSize, currentPoint.y);
      h = init.y + init.h - y;
      break;
    case "ne":
      w = Math.max(minSize, currentPoint.x - init.x);
      y = Math.min(init.y + init.h - minSize, currentPoint.y);
      h = init.y + init.h - y;
      break;
    case "e":
      w = Math.max(minSize, currentPoint.x - init.x);
      break;
    case "se":
      w = Math.max(minSize, currentPoint.x - init.x);
      h = Math.max(minSize, currentPoint.y - init.y);
      break;
    case "s":
      h = Math.max(minSize, currentPoint.y - init.y);
      break;
    case "sw":
      x = Math.min(init.x + init.w - minSize, currentPoint.x);
      w = init.x + init.w - x;
      h = Math.max(minSize, currentPoint.y - init.y);
      break;
    case "w":
      x = Math.min(init.x + init.w - minSize, currentPoint.x);
      w = init.x + init.w - x;
      break;
  }

  return { ...shape, x, y, w, h };
}