import { BaseShape, ShapeType, Point } from "@/types/types";

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
   * Create a new shape instance
   */
  static createShape(
    type: ShapeType,
    startPoint: Point,
    color: string,
    customId?: string
  ): BaseShape {
    const config = SHAPE_CONFIGS[type];
    const id = customId || this.generateId();

    const baseShape: BaseShape = {
      id,
      type,
      x: startPoint.x,
      y: startPoint.y,
      w: config.defaultSize.width,
      h: config.defaultSize.height,
      fill: color,
      stroke: config.isPath ? undefined : "#000",
      strokeWidth: config.strokeWidth,
    };

    // Add shape-specific properties
    if (config.hasText) {
      baseShape.text = "Double click to edit";
    }

    if (config.isPath) {
      baseShape.points = [startPoint];
      baseShape.stroke = undefined; // Path shapes use fill as stroke color
    }

    return baseShape;
  }

  /**
   * Get shape configuration
   */
  static getShapeConfig(type: ShapeType): ShapeConfig {
    return SHAPE_CONFIGS[type];
  }

  /**
   * Check if shape type is a drawing tool (pen, brush, etc.)
   */
  static isDrawingTool(type: ShapeType | "select"): boolean {
    if (type === "select") return false;
    return SHAPE_CONFIGS[type].isPath;
  }

  /**
   * Check if shape type supports text
   */
  static hasText(type: ShapeType): boolean {
    return SHAPE_CONFIGS[type].hasText;
  }

  /**
   * Check if shape can be resized with handles
   */
  static canResize(type: ShapeType): boolean {
    return !SHAPE_CONFIGS[type].isPath;
  }

  /**
   * Get cursor style for tool
   */
  static getCursor(type: ShapeType | "select"): string {
    if (type === "select") return "default";
    return SHAPE_CONFIGS[type].cursor;
  }

  /**
   * Generate unique ID for shapes
   */
  private static generateId(): string {
    return Math.random().toString(36).slice(2, 9);
  }

  /**
   * Get all available shape types
   */
  static getAllShapeTypes(): ShapeType[] {
    return Object.keys(SHAPE_CONFIGS) as ShapeType[];
  }

  /**
   * Get drawing tools only
   */
  static getDrawingTools(): ShapeType[] {
    return this.getAllShapeTypes().filter(type => SHAPE_CONFIGS[type].isPath);
  }

  /**
   * Get geometric shapes only
   */
  static getGeometricShapes(): ShapeType[] {
    return this.getAllShapeTypes().filter(type => !SHAPE_CONFIGS[type].isPath);
  }
}

/**
 * Helper functions for easy access
 */
export const createShape = ShapeFactory.createShape.bind(ShapeFactory);
export const getShapeConfig = ShapeFactory.getShapeConfig.bind(ShapeFactory);
export const isDrawingTool = ShapeFactory.isDrawingTool.bind(ShapeFactory);
export const canResize = ShapeFactory.canResize.bind(ShapeFactory);
export const getCursor = ShapeFactory.getCursor.bind(ShapeFactory);