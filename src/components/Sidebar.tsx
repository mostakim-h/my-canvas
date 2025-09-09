import React from "react";
import {Button} from "@/components/ui/button";
import {Circle, Square, TextCursor} from "lucide-react";
import {ShapeType} from "@/app/page";

export default function Sidebar(
  {
    tool,
    setTool,
    color,
    setColor
  }: {
    tool: string,
    setTool: (tool: ShapeType | "select") => void,
    color: string,
    setColor: (color: string) => void
  }) {
  return (
    <div className="flex gap-3 flex-col">
      <Button
        onClick={() => setTool("rect")}
        className={`${tool === "rect" ? "border-blue-500 text-blue-600" : ""} cursor-pointer`}
      >
        <Square size={16} className="inline-block"/>
      </Button>

      <Button
        onClick={() => setTool("circle")}
        className={`${tool === "circle" ? "border-blue-500 text-blue-600" : ""} cursor-pointer`}
      >
        <Circle size={16} className="inline-block"/>
      </Button>

      <Button
        onClick={() => setTool("text")}
        className={`${tool === "text" ? "border-blue-500 text-blue-600" : ""} cursor-pointer`}
      >
        <TextCursor size={16} className="inline-block"/>
      </Button>

      <Button
        className={'p-2'}
      >
        <input
          aria-label="Fill color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          type="color"
          className="p-0 w-6 h-6 rounded-full"
        />
      </Button>
    </div>
  )
}