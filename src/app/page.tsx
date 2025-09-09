"use client";

import React, {useCallback, useEffect, useRef, useState} from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";

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

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [tool, setTool] = useState<ShapeType | "select">("select");
  const [shapes, setShapes] = useState<BaseShape[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [color, setColor] = useState("#ff6b6b");
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState<{ x: number; y: number } | null>(null);

  // Resize canvas to container
  useEffect(() => {
    function fitCanvas() {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      canvas.width = Math.floor(rect.width);
      canvas.height = Math.floor(rect.height);
      draw();
    }

    fitCanvas();
    window.addEventListener("resize", fitCanvas);
    return () => window.removeEventListener("resize", fitCanvas);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hitTest = useCallback((x: number, y: number) => {
    for (let i = shapes.length - 1; i >= 0; i--) {
      const s = shapes[i];
      if (s.type === "rect" || s.type === "text") {
        if (x >= s.x && x <= s.x + s.w && y >= s.y && y <= s.y + s.h) return s;
      } else if (s.type === "circle") {
        const cx = s.x + s.w / 2;
        const cy = s.y + s.h / 2;
        const rx = s.w / 2;
        const ry = s.h / 2;
        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;
        if (dx * dx + dy * dy <= 1) return s;
      }
    }
    return null;
  }, [shapes]);

  // Drawing function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Background grid
    const gridSize = 24;
    ctx.save();
    ctx.fillStyle = "#0f172a"; // dark background
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(255,255,255,0.03)";
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x + 0.5, 0);
      ctx.lineTo(x + 0.5, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y + 0.5);
      ctx.lineTo(canvas.width, y + 0.5);
      ctx.stroke();
    }
    ctx.restore();

    // Draw shapes
    shapes.forEach((s) => {
      ctx.save();
      // shape area
      if (s.type === "rect") {
        ctx.fillStyle = s.fill;
        ctx.fillRect(s.x, s.y, s.w, s.h);
        if (s.stroke) {
          ctx.lineWidth = s.strokeWidth ?? 2;
          ctx.strokeStyle = s.stroke;
          ctx.strokeRect(s.x, s.y, s.w, s.h);
        }
      } else if (s.type === "circle") {
        ctx.beginPath();
        ctx.ellipse(s.x + s.w / 2, s.y + s.h / 2, s.w / 2, s.h / 2, 0, 0, Math.PI * 2);
        ctx.fillStyle = s.fill;
        ctx.fill();
        if (s.stroke) {
          ctx.lineWidth = s.strokeWidth ?? 2;
          ctx.strokeStyle = s.stroke;
          ctx.stroke();
        }
      } else if (s.type === "text") {
        ctx.fillStyle = s.fill;
        ctx.font = `${Math.max(12, Math.floor(s.h / 2))}px Inter, ui-sans-serif, system-ui`;
        ctx.textBaseline = "top";
        const lines = (s.text || "").split("\n");
        let ty = s.y + 4;
        lines.forEach((ln) => {
          ctx.fillText(ln, s.x + 6, ty);
          ty += Math.floor(s.h / lines.length);
        });
      }

      // selected outline
      if (s.id === selectedId) {
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#60a5fa";
        ctx.setLineDash([6, 6]);
        ctx.strokeRect(s.x - 6 / 2, s.y - 6 / 2, s.w + 6, s.h + 6);
        ctx.setLineDash([]);

        // draw resize handles
        const handles = getHandlesForShape(s);
        handles.forEach((h) => {
          ctx.beginPath();
          ctx.fillStyle = "#fff";
          ctx.fillRect(h.x - 6, h.y - 6, 12, 12);
          ctx.strokeStyle = "#111827";
          ctx.lineWidth = 1;
          ctx.strokeRect(h.x - 6, h.y - 6, 12, 12);
        });
      }

      ctx.restore();
    });
  }, [shapes, selectedId]);

  useEffect(() => {
    draw();
  }, [shapes, selectedId, draw]);

  // Handles computation
  function getHandlesForShape(s: BaseShape) {
    const {x, y, w, h} = s;
    return [
      {name: "nw", x: x, y: y},
      {name: "n", x: x + w / 2, y: y},
      {name: "ne", x: x + w, y: y},
      {name: "e", x: x + w, y: y + h / 2},
      {name: "se", x: x + w, y: y + h},
      {name: "s", x: x + w / 2, y: y + h},
      {name: "sw", x: x, y: y + h},
      {name: "w", x: x, y: y + h / 2},
    ];
  }

  // Pointer state for dragging/resizing
  const pointerRef = useRef<{
    dragging: boolean;
    resizing: boolean;
    offsetX: number;
    offsetY: number;
    handle?: string | null;
    initial: BaseShape | null;
  }>({dragging: false, resizing: false, offsetX: 0, offsetY: 0, handle: null, initial: null});

  // Pointer events
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function toCanvasCoords(e: PointerEvent) {
      const rect = canvas.getBoundingClientRect();
      return {x: e.clientX - rect.left, y: e.clientY - rect.top};
    }

    function onPointerDown(e: PointerEvent) {
      const p = toCanvasCoords(e);
      const hit = hitTest(p.x, p.y);

      if (tool === "select") {
        if (hit) {
          setSelectedId(hit.id);
          // check handle
          const handles = getHandlesForShape(hit);
          const found = handles.find((h) => Math.abs(h.x - p.x) <= 8 && Math.abs(h.y - p.y) <= 8);
          if (found) {
            // start resizing
            pointerRef.current.resizing = true;
            pointerRef.current.handle = found.name;
            pointerRef.current.initial = {...hit};
          } else {
            // start dragging
            pointerRef.current.dragging = true;
            pointerRef.current.offsetX = p.x - hit.x;
            pointerRef.current.offsetY = p.y - hit.y;
            pointerRef.current.initial = {...hit};
          }
        } else {
          setSelectedId(null);
        }
      } else {
        // start drawing a new shape
        setIsDrawing(true);
        setStartPos({x: p.x, y: p.y});
        const newShape: BaseShape = {
          id: Math.random().toString(36).slice(2, 9),
          type: tool,
          x: p.x,
          y: p.y,
          w: 120,
          h: 80,
          fill: color,
          stroke: "#000",
          strokeWidth: 1,
          text: tool === "text" ? "Double click to edit" : undefined,
        };
        setShapes((s) => [...s, newShape]);
        setSelectedId(newShape.id);

        // prepare pointer ref to drag-resize newly created shape
        pointerRef.current.dragging = true;
        pointerRef.current.offsetX = 0;
        pointerRef.current.offsetY = 0;
        pointerRef.current.initial = newShape;
      }
    }

    function onPointerMove(e: PointerEvent) {
      const p = toCanvasCoords(e);
      const sid = selectedId;
      if (pointerRef.current.dragging && sid) {
        setShapes((prev) => {
          return prev.map((s) => {
            if (s.id !== sid) return s;
            // if we started drawing a new shape: update size based on startPos
            if (isDrawing && startPos && s.id === pointerRef.current.initial?.id) {
              const nx = Math.min(startPos.x, p.x);
              const ny = Math.min(startPos.y, p.y);
              const nw = Math.abs(p.x - startPos.x);
              const nh = Math.abs(p.y - startPos.y);
              return {...s, x: nx, y: ny, w: nw || 40, h: nh || 24};
            }

            // regular dragging
            if (!pointerRef.current.resizing) {
              return {...s, x: p.x - pointerRef.current.offsetX, y: p.y - pointerRef.current.offsetY};
            }
            return s;
          });
        });
      }

      if (pointerRef.current.resizing && sid) {
        const handle = pointerRef.current.handle;
        const init = pointerRef.current.initial;
        if (!handle || !init) return;
        setShapes((prev) => {
          return prev.map((s) => {
            if (s.id !== sid) return s;
            let nx = s.x;
            let ny = s.y;
            let nw = s.w;
            let nh = s.h;
            const minSize = 20;

            // compute based on handle
            switch (handle) {
              case "nw":
                nx = Math.min(init.x + init.w - minSize, p.x);
                ny = Math.min(init.y + init.h - minSize, p.y);
                nw = init.x + init.w - nx;
                nh = init.y + init.h - ny;
                break;
              case "n":
                ny = Math.min(init.y + init.h - minSize, p.y);
                nh = init.y + init.h - ny;
                break;
              case "ne":
                nw = Math.max(minSize, p.x - init.x);
                ny = Math.min(init.y + init.h - minSize, p.y);
                nh = init.y + init.h - ny;
                break;
              case "e":
                nw = Math.max(minSize, p.x - init.x);
                break;
              case "se":
                nw = Math.max(minSize, p.x - init.x);
                nh = Math.max(minSize, p.y - init.y);
                break;
              case "s":
                nh = Math.max(minSize, p.y - init.y);
                break;
              case "sw":
                nx = Math.min(init.x + init.w - minSize, p.x);
                nw = init.x + init.w - nx;
                nh = Math.max(minSize, p.y - init.y);
                break;
              case "w":
                nx = Math.min(init.x + init.w - minSize, p.x);
                nw = init.x + init.w - nx;
                break;
            }
            return {...s, x: nx, y: ny, w: nw, h: nh};
          });
        });
      }
    }

    function onPointerUp(e: PointerEvent) {
      pointerRef.current.dragging = false;
      pointerRef.current.resizing = false;
      pointerRef.current.handle = null;
      pointerRef.current.initial = null;
      setIsDrawing(false);
      setStartPos(null);
    }

    canvas.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      canvas.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [tool, hitTest, selectedId, isDrawing, startPos, color]);

  // double click to edit text
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function toCanvasCoords(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      return {x: e.clientX - rect.left, y: e.clientY - rect.top};
    }

    function onDblClick(e: MouseEvent) {
      const p = toCanvasCoords(e);
      const hit = hitTest(p.x, p.y);
      if (hit && hit.type === "text") {
        const newText = prompt("Edit text:", hit.text || "");
        if (newText !== null) {
          setShapes((prev) => prev.map((s) => (s.id === hit.id ? {...s, text: newText} : s)));
        }
      }
    }

    canvas.addEventListener("dblclick", onDblClick);
    return () => canvas.removeEventListener("dblclick", onDblClick);
  }, [hitTest]);

  // simple toolbar actions
  function addSample() {
    const s: BaseShape = {
      id: Math.random().toString(36).slice(2, 9),
      type: "rect",
      x: 80,
      y: 80,
      w: 160,
      h: 110,
      fill: color,
      stroke: "#111827",
      strokeWidth: 1,
    };
    setShapes((p) => [...p, s]);
    setSelectedId(s.id);
  }


  // Update color for selected
  useEffect(() => {
    if (!selectedId) return;
    setShapes((prev) => prev.map((s) => (s.id === selectedId ? {...s, fill: color} : s)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color]);

  return (
    <div className="h-screen bg-black p-5 grid grid-rows-[auto_1fr] gap-4">

      <Navbar
        setTool={setTool}
        tool={tool}
        shapes={shapes}
        setShapes={setShapes}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
      />

      <div className={'grid grid-cols-[auto_1fr] gap-5 h-full'}>
        <Sidebar
          tool={tool}
          setTool={setTool}
          color={color}
          setColor={setColor}
        />
        <div ref={containerRef} className="border border-slate-700 rounded-md">
          <canvas ref={canvasRef} className="block bg-white"/>
        </div>
      </div>
    </div>
  );
}
