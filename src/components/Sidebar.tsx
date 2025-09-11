"use client";

import React from "react";
import {Circle, MousePointer2, PaintBucket, Pen, Square, Triangle, Type} from "lucide-react";
import {ShapeType} from "@/types/types";
import {Button} from "@/components/ui/button";
import {Card} from "@/components/ui/card";

interface SidebarProps {
  tool: ShapeType | "select";
  setTool: (tool: ShapeType | "select") => void;
  color: string;
  setColor: (color: string) => void;
}

interface ToolConfig {
  id: ShapeType | "select";
  icon: React.ReactNode;
  label: string;
  category: "selection" | "shapes" | "drawing";
}

const TOOLS: ToolConfig[] = [
  {
    id: "select",
    icon: <MousePointer2 size={18}/>,
    label: "Select",
    category: "selection",
  },
  {
    id: "text",
    icon: <Type size={18}/>,
    label: "Text",
    category: "shapes",
  },
  {
    id: "rect",
    icon: <Square size={18}/>,
    label: "Rectangle",
    category: "shapes",
  },
  {
    id: "circle",
    icon: <Circle size={18}/>,
    label: "Circle",
    category: "shapes",
  },
  {
    id: "triangle",
    icon: <Triangle size={18}/>,
    label: "Triangle",
    category: "shapes",
  },

  // Drawing Tools
  {
    id: "pen",
    icon: <Pen size={18}/>,
    label: "Pen",
    category: "drawing",
  },
  {
    id: "brush",
    icon: <PaintBucket size={18}/>,
    label: "Brush",
    category: "drawing",
  },
];

const COLOR_PRESETS = [
  "#FF6B6B",
  "#6C5CE7",
  "#00B894",
  "#FDCB6E",
  "#74B9FF",
  "#E17055",
  "#A29BFE",
  "#55EFC4",
  "#FAB1A0",
  "#81ECEC",
  "#FFEAA7",
  "#D63031"
];


export default function Sidebar({tool, setTool, color, setColor}: SidebarProps) {
  const renderToolSection = (category: string, tools: ToolConfig[]) => {
    const sectionTools = tools.filter(t => t.category === category);
    if (sectionTools.length === 0) return null;

    return (
      <div key={category} className="space-y-2">
        <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide px-2">
          {category}
        </h3>
        <div className="space-y-2">
          {sectionTools.map((toolConfig) => (
            <Button
              key={toolConfig.id}
              onClick={() => setTool(toolConfig.id)}
              className={`
                w-full flex items-center justify-start gap-3 px-3 py-2.5 text-sm rounded-lg
                transition-all duration-200 group
                ${
                tool === toolConfig.id
                  ? "text-blue-500 shadow-lg"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              }
              `}
              title={toolConfig.label}
            >
              <span className={`transition-transform duration-200 ${
                tool === toolConfig.id ? "scale-110" : "group-hover:scale-105"
              }`}>
                {toolConfig.icon}
              </span>
              <span className="font-medium">{toolConfig.label}</span>
            </Button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card className={'bg-gray-800 border border-gray-700 rounded-lg h-full w-55 overflow-y-auto'}>
      <h2 className="text-lg m-0 font-semibold text-white text-center">
        Tools & Colors
      </h2>

      <div className="p-4 flex flex-col justify-between">

        <div className="space-y-6">
          {["selection", "shapes", "drawing"].map(category =>
            renderToolSection(category, TOOLS)
          )}
        </div>

        <div className="my-6 border-t border-gray-700"></div>

        <div className="space-y-4">
          <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide">
            Colors
          </h3>

          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full border-2 border-gray-600 shadow-inner"
              style={{backgroundColor: color}}
            />
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-16 h-8 rounded cursor-pointer bg-transparent border border-gray-600"
            />
          </div>

          <div className="grid grid-cols-6 gap-2">
            {COLOR_PRESETS.map((presetColor) => (
              <button
                key={presetColor}
                onClick={() => setColor(presetColor)}
                className={`
                w-6 h-6 rounded-lg border-2 transition-all duration-200
                hover:scale-105 hover:shadow-lg
                ${
                  color === presetColor
                    ? "border-white shadow-lg scale-105"
                    : "border-gray-600 hover:border-gray-400"
                }
              `}
                style={{backgroundColor: presetColor}}
                title={presetColor}
              />
            ))}
          </div>

          <p className="text-xs text-gray-500 text-center">
            Click any color or use the picker above
          </p>
        </div>
      </div>
    </Card>
  );
}