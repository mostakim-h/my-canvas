// src/app/page.tsx

"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { useCanvas } from "@/hooks/useCanvas";
import {getCursor} from "@/utils/shapeFactory";

export default function Home() {
  const {
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
  } = useCanvas();

  return (
    <div className="h-screen bg-black p-5 grid grid-rows-[auto_1fr] gap-4">
      <Navbar
        shapes={shapes}
        setShapes={setShapes}
        selectedId={selectedId}
        setSelectedId={setSelectedId}
      />

      <div className="grid grid-cols-[auto_1fr] gap-5 h-full">
        <Sidebar
          tool={tool}
          setTool={setTool}
          color={color}
          setColor={setColor}
        />

        <div
          ref={containerRef}
          className="border border-slate-700 rounded-md overflow-hidden"
        >
          <canvas
            ref={canvasRef}
            className="block bg-transparent"
            style={{
              cursor: getCursor(tool)
            }}
          />
        </div>
      </div>
    </div>
  );
}