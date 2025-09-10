import {BaseShape, Handle} from "@/types/types";

/**
 * Shape rendering class that handles drawing different shape types
 */
export class ShapeRenderer {
  private ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  /**
   * Draw the canvas background grid
   */
  drawBackground(width: number, height: number, gridSize: number = 24): void {
    this.ctx.save();

    // Dark background
    this.ctx.fillStyle = "#0f172a";
    this.ctx.fillRect(0, 0, width, height);

    // Grid lines
    this.ctx.strokeStyle = "rgba(255,255,255,0.03)";
    this.ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x < width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x + 0.5, 0);
      this.ctx.lineTo(x + 0.5, height);
      this.ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y < height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y + 0.5);
      this.ctx.lineTo(width, y + 0.5);
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  /**
   * Draw a single shape
   */
  drawShape(shape: BaseShape): void {
    this.ctx.save();

    switch (shape.type) {
      case "rect":
        this.drawRectangle(shape);
        break;
      case "circle":
        this.drawCircle(shape);
        break;
      case "text":
        this.drawText(shape);
        break;
      case "triangle":
        this.drawTriangle(shape);
        break;
      case "pen":
        this.drawPenStroke(shape);
        break;
      case "brush":
        this.drawBrushStroke(shape);
        break;
      default:
        console.warn(`Unknown shape type: ${shape.type}`);
    }

    this.ctx.restore();
  }

  /**
   * Draw rectangle shape
   */
  private drawRectangle(shape: BaseShape): void {
    this.ctx.fillStyle = shape.fill;
    this.ctx.fillRect(shape.x, shape.y, shape.w, shape.h);

    if (shape.stroke) {
      this.ctx.lineWidth = shape.strokeWidth ?? 2;
      this.ctx.strokeStyle = shape.stroke;
      this.ctx.strokeRect(shape.x, shape.y, shape.w, shape.h);
    }
  }

  /**
   * Draw circle/ellipse shape
   */
  private drawCircle(shape: BaseShape): void {
    const centerX = shape.x + shape.w / 2;
    const centerY = shape.y + shape.h / 2;
    const radiusX = shape.w / 2;
    const radiusY = shape.h / 2;

    this.ctx.beginPath();
    this.ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);

    this.ctx.fillStyle = shape.fill;
    this.ctx.fill();

    if (shape.stroke) {
      this.ctx.lineWidth = shape.strokeWidth ?? 2;
      this.ctx.strokeStyle = shape.stroke;
      this.ctx.stroke();
    }
  }

  /**
   * Draw text shape
   */
  private drawText(shape: BaseShape): void {
    this.ctx.fillStyle = shape.fill;
    this.ctx.font = `${Math.max(12, Math.floor(shape.h / 2))}px Inter, ui-sans-serif, system-ui`;
    this.ctx.textBaseline = "top";

    const lines = (shape.text || "").split("\n");
    const lineHeight = Math.floor(shape.h / lines.length);
    let y = shape.y + 4;

    lines.forEach((line) => {
      this.ctx.fillText(line, shape.x + 6, y);
      y += lineHeight;
    });
  }

  /**
   * Draw triangle shape
   */
  private drawTriangle(shape: BaseShape): void {
    const { x, y, w, h } = shape;

    this.ctx.beginPath();
    // Top point
    this.ctx.moveTo(x + w / 2, y);
    // Bottom left
    this.ctx.lineTo(x, y + h);
    // Bottom right
    this.ctx.lineTo(x + w, y + h);
    this.ctx.closePath();

    this.ctx.fillStyle = shape.fill;
    this.ctx.fill();

    if (shape.stroke) {
      this.ctx.lineWidth = shape.strokeWidth ?? 2;
      this.ctx.strokeStyle = shape.stroke;
      this.ctx.stroke();
    }
  }

  /**
   * Draw pen stroke (thin line)
   */
  private drawPenStroke(shape: BaseShape): void {
    if (!shape.points || shape.points.length < 2) return;

    this.ctx.beginPath();
    this.ctx.moveTo(shape.points[0].x, shape.points[0].y);

    for (let i = 1; i < shape.points.length; i++) {
      this.ctx.lineTo(shape.points[i].x, shape.points[i].y);
    }

    this.ctx.strokeStyle = shape.fill;
    this.ctx.lineWidth = shape.strokeWidth ?? 2;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.ctx.stroke();
  }

  /**
   * Draw brush stroke (thick, smooth)
   */
  private drawBrushStroke(shape: BaseShape): void {
    if (!shape.points || shape.points.length < 2) return;

    this.ctx.beginPath();
    this.ctx.moveTo(shape.points[0].x, shape.points[0].y);

    // Use quadratic curves for smoother brush strokes
    for (let i = 1; i < shape.points.length - 1; i++) {
      const currentPoint = shape.points[i];
      const nextPoint = shape.points[i + 1];
      const midX = (currentPoint.x + nextPoint.x) / 2;
      const midY = (currentPoint.y + nextPoint.y) / 2;

      this.ctx.quadraticCurveTo(currentPoint.x, currentPoint.y, midX, midY);
    }

    // Draw to the last point
    const lastPoint = shape.points[shape.points.length - 1];
    this.ctx.lineTo(lastPoint.x, lastPoint.y);

    this.ctx.strokeStyle = shape.fill;
    this.ctx.lineWidth = shape.strokeWidth ?? 8;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.ctx.stroke();
  }

  /**
   * Draw selection outline and handles
   */
  drawSelection(shape: BaseShape, handles: Handle[]): void {
    this.ctx.save();

    // Selection outline
    this.ctx.beginPath();
    this.ctx.lineWidth = 2;
    this.ctx.strokeStyle = "#60a5fa";
    this.ctx.setLineDash([6, 6]);
    this.ctx.strokeRect(
      shape.x - 3,
      shape.y - 3,
      shape.w + 6,
      shape.h + 6
    );
    this.ctx.setLineDash([]);

    // Resize handles (only for non-path shapes)
    if (shape.type !== "pen" && shape.type !== "brush") {
      handles.forEach((handle) => {
        this.ctx.beginPath();
        this.ctx.fillStyle = "#fff";
        this.ctx.fillRect(handle.x - 6, handle.y - 6, 12, 12);
        this.ctx.strokeStyle = "#111827";
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(handle.x - 6, handle.y - 6, 12, 12);
      });
    }

    this.ctx.restore();
  }

  /**
   * Clear the entire canvas
   */
  clear(width: number, height: number): void {
    this.ctx.clearRect(0, 0, width, height);
  }
}