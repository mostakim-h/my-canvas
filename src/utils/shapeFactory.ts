import { ShapeType } from "@/types/types";

/**
 * Configuration for different shape types
 */
interface ShapeConfig {
  defaultSize: { width: number; height: number };
  hasText: boolean;
  isPath: boolean; // For drawing tools like pen/brush
  strokeWidth: number;
  cursor: string;
}

/**
 * Shape configurations - Easy to extend for new shapes
 */
const SHAPE_CONFIGS: Record<ShapeType, ShapeConfig> = {
  rect: {
    defaultSize: { width: 120, height: 80 },
    hasText: false,
    isPath: false,
    strokeWidth: 1,
    cursor: "crosshair",
  },
  circle: {
    defaultSize: { width: 100, height: 100 },
    hasText: false,
    isPath: false,
    strokeWidth: 1,
    cursor: "crosshair",
  },
  triangle: {
    defaultSize: { width: 100, height: 100 },
    hasText: false,
    isPath: false,
    strokeWidth: 1,
    cursor: "crosshair",
  },
  text: {
    defaultSize: { width: 120, height: 40 },
    hasText: true,
    isPath: false,
    strokeWidth: 0,
    cursor: "text",
  },
  pen: {
    defaultSize: { width: 0, height: 0 },
    hasText: false,
    isPath: true,
    strokeWidth: 2,
    cursor: "crosshair",
  },
  brush: {
    defaultSize: { width: 0, height: 0 },
    hasText: false,
    isPath: true,
    strokeWidth: 8,
    cursor: "crosshair",
  },
};

/**
 * Shape Factory Class
 * Makes it easy to create new shapes and extend functionality
 */
export class ShapeFactory {
  /**
   * Check if shape type is a drawing tool (pen, brush, etc.)
   */
  static isDrawingTool(type: ShapeType | "select"): boolean {
    if (type === "select") return false;
    return SHAPE_CONFIGS[type].isPath;
  }

  /**
   * Get cursor style for tool
   */
  static getCursor(type: ShapeType | "select"): string {
    if (type === "select") return "default";
    return SHAPE_CONFIGS[type].cursor;
  }

}

export const getCursor = ShapeFactory.getCursor.bind(ShapeFactory);