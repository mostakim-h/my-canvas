import React from "react";
import {Button} from "@/components/ui/button";
import {Circle, MousePointer2, Square, TextCursor} from "lucide-react";
import {ShapeType} from "@/types/types";

type Props = {
  tool: string,
  setTool: (tool: ShapeType | "select") => void,
  color: string,
  setColor: (color: string) => void
}

export default function Sidebar(
  {
    tool,
    setTool,
    color,
    setColor
  }: Props) {
  return (
    <div className="flex gap-3 flex-col justify-center">
      <Button
        onClick={() => setTool("select")}
        className={`${tool === "select" ? "border-blue-500 text-blue-600" : ""} cursor-pointer`}
      >
        <MousePointer2 size={16} className="inline-block"/>
      </Button>
      <Button
        onClick={() => setTool("text")}
        className={`${tool === "text" ? "border-blue-500 text-blue-600" : ""} cursor-pointer`}
      >
        <TextCursor size={16} className="inline-block"/>
      </Button>
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
        className={'p-2 cursor-pointer'}
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