import { useCallback, useEffect, useRef, useState } from "react";
import { BaseShape, ShapeType, PointerState, Point } from "@/types/types";
import { ShapeRenderer } from "@/utils/shapeRenderer";
import {
  getCanvasCoordinates,
  hitTestShape,
  getShapeHandles,
  hitTestHandle,
  createShape,
  resizeShape
} from "@/utils/canvasUtils";
import {ShapeFactory} from "@/utils/shapeFactory";

export function useCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rendererRef = useRef<ShapeRenderer | null>(null);

  const [tool, setTool] = useState<ShapeType | "select">("select");
  const [shapes, setShapes] = useState<BaseShape[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [color, setColor] = useState("#ff6b6b");
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<Point | null>(null);

  const pointerRef = useRef<PointerState>({
    dragging: false,
    resizing: false,
    offsetX: 0,
    offsetY: 0,
    handle: null,
    initial: null,
  });

  /**
   * Fit canvas to container size
   */
  const fitCanvas = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const rect = container.getBoundingClientRect();
    canvas.width = Math.floor(rect.width);
    canvas.height = Math.floor(rect.height);

    // Initialize renderer
    const ctx = canvas.getContext("2d");
    if (ctx) {
      rendererRef.current = new ShapeRenderer(ctx);
    }

    draw();
  }, []);

  /**
   * Main drawing function
   */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    const renderer = rendererRef.current;
    if (!canvas || !renderer) return;

    renderer.clear(canvas.width, canvas.height);
    renderer.drawBackground(canvas.width, canvas.height);

    shapes.forEach((shape) => {
      renderer.drawShape(shape);

      if (shape.id === selectedId) {
        const handles = getShapeHandles(shape);
        renderer.drawSelection(shape, handles);
      }
    });
  }, [shapes, selectedId]);

  /**
   * Handle pointer down events
   */
  const handlePointerDown = useCallback((event: PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const point = getCanvasCoordinates(event, canvas);
    const hitShape = hitTestShape(point.x, point.y, shapes);

    if (tool === "select") {
      if (hitShape) {
        setSelectedId(hitShape.id);
        setColor(hitShape.fill);

        const handles = getShapeHandles(hitShape);
        const hitHandle = hitTestHandle(point.x, point.y, handles);

        if (hitHandle && hitShape.type !== "pen" && hitShape.type !== "brush") {
          pointerRef.current = {
            dragging: false,
            resizing: true,
            offsetX: 0,
            offsetY: 0,
            handle: hitHandle.name,
            initial: { ...hitShape },
          };
        } else {
          pointerRef.current = {
            dragging: true,
            resizing: false,
            offsetX: point.x - hitShape.x,
            offsetY: point.y - hitShape.y,
            handle: null,
            initial: { ...hitShape },
          };
        }
      } else {
        setSelectedId(null);
      }
    } else {
      setIsDrawing(true);
      setStartPos(point);

      const newShape = createShape(tool, point, color);
      setShapes(prev => [...prev, newShape]);
      setSelectedId(newShape.id);

      if (tool === "pen" || tool === "brush") {
        pointerRef.current = {
          dragging: true,
          resizing: false,
          offsetX: 0,
          offsetY: 0,
          handle: null,
          initial: newShape,
        };
      } else {
        pointerRef.current = {
          dragging: true,
          resizing: false,
          offsetX: 0,
          offsetY: 0,
          handle: null,
          initial: newShape,
        };
      }
    }
  }, [tool, shapes, color]);

  /**
   * Handle pointer move events
   */
  const handlePointerMove = useCallback((event: PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const point = getCanvasCoordinates(event, canvas);

    if (pointerRef.current.dragging && selectedId) {
      setShapes(prev => prev.map(shape => {
        if (shape.id !== selectedId) return shape;

        if (isDrawing && startPos && shape.id === pointerRef.current.initial?.id) {
          if (ShapeFactory.isDrawingTool(shape.type)) {
            return {
              ...shape,
              points: [...(shape.points || []), point],
            };
          } else {
            const minX = Math.min(startPos.x, point.x);
            const minY = Math.min(startPos.y, point.y);
            const width = Math.abs(point.x - startPos.x) || 40;
            const height = Math.abs(point.y - startPos.y) || 24;

            return { ...shape, x: minX, y: minY, w: width, h: height };
          }
        }

        if (!pointerRef.current.resizing) {
          return {
            ...shape,
            x: point.x - pointerRef.current.offsetX,
            y: point.y - pointerRef.current.offsetY,
          };
        }

        return shape;
      }));
    }

    if (pointerRef.current.resizing && selectedId && pointerRef.current.handle && pointerRef.current.initial) {
      setShapes(prev => prev.map(shape => {
        if (shape.id !== selectedId) return shape;

        return resizeShape(shape, pointerRef.current.handle!, point, pointerRef.current.initial!);
      }));
    }
  }, [selectedId, isDrawing, startPos]);

  /**
   * Handle pointer up events
   */
  const handlePointerUp = useCallback(() => {
    pointerRef.current = {
      dragging: false,
      resizing: false,
      offsetX: 0,
      offsetY: 0,
      handle: null,
      initial: null,
    };
    setIsDrawing(false);
    setStartPos(null);
  }, []);

  /**
   * Handle double click for text editing
   */
  const handleDoubleClick = useCallback((event: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const point = getCanvasCoordinates(event, canvas);
    const hitShape = hitTestShape(point.x, point.y, shapes);

    if (hitShape && hitShape.type === "text") {
      const newText = prompt("Edit text:", hitShape.text || "");
      if (newText !== null) {
        setShapes(prev => prev.map(shape =>
          shape.id === hitShape.id ? { ...shape, text: newText } : shape
        ));
      }
    }
  }, [shapes]);

  useEffect(() => {
    fitCanvas();
    window.addEventListener("resize", fitCanvas);
    return () => window.removeEventListener("resize", fitCanvas);
  }, [fitCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("pointerdown", handlePointerDown);
    canvas.addEventListener("dblclick", handleDoubleClick);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      canvas.removeEventListener("pointerdown", handlePointerDown);
      canvas.removeEventListener("dblclick", handleDoubleClick);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerDown, handlePointerMove, handlePointerUp, handleDoubleClick]);

  useEffect(() => {
    if (!selectedId) return;

    setShapes(prev => prev.map(shape =>
      shape.id === selectedId ? { ...shape, fill: color } : shape
    ));
  }, [color, selectedId]);

  useEffect(() => {
    draw();
  }, [draw]);

  return {
    canvasRef,
    containerRef,
    tool,
    setTool,
    shapes,
    setShapes,
    selectedId,
    setSelectedId,
    color,
    setColor,
  };
}