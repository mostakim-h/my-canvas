import {Button} from "@/components/ui/button";
import {BringToFront, Delete, FileDown, FileUp, MousePointer2, SendToBack} from "lucide-react";
import React from "react";
import {BaseShape, ShapeType} from "@/app/page";

export default function Navbar(
  {
    tool,
    setTool,
    shapes,
    setShapes,
    selectedId,
    setSelectedId
  }: {
    tool: string,
    setTool: (tool: ShapeType | "select") => void,
    shapes: BaseShape[],
    setShapes: (shapes: (p: BaseShape[]) => (BaseShape[])) => void,
    selectedId: string | null,
    setSelectedId: (id: string | null) => void
  }) {

  function exportJSON() {
    const data = JSON.stringify(shapes, null, 2);
    const blob = new Blob([data], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "canvas-shapes.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  // import JSON
  async function importJSON(file?: File) {
    const f = file;
    if (!f) {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "application/json";
      input.onchange = () => {
        const file = input.files && input.files[0];
        if (file) importJSON(file);
      };
      input.click();
      return;
    }
    const text = await f.text();
    try {
      const data = JSON.parse(text) as BaseShape[];
      setShapes(data);
    } catch (err) {
      alert("Invalid JSON");
    }
  }

  function sendToBack() {
    if (!selectedId) return;
    setShapes((p: BaseShape[]) => {
      const found = p.find((s) => s.id === selectedId);
      if (!found) return p;
      return [found, ...p.filter((s) => s.id !== selectedId)];
    });
  }

  function deleteSelected() {
    if (!selectedId) return;
    setShapes((p) => p.filter((s) => s.id !== selectedId));
    setSelectedId(null);
  }

  function bringToFront() {
    if (!selectedId) return;
    setShapes((p) => {
      const found = p.find((s) => s.id === selectedId);
      if (!found) return p;
      return [...p.filter((s) => s.id !== selectedId), found];
    });
  }

  return (
    <div className="flex gap-4 items-center">
      <Button
        onClick={() => setTool("select")}
        className={`${tool === "select" ? "border-blue-500 text-blue-600" : ""} cursor-pointer`}
      >
        <MousePointer2 size={16} className="inline-block"/>
      </Button>
      <Button onClick={exportJSON}>
        <FileDown size={16} className="inline-block"/>
      </Button>
      <Button onClick={() => importJSON()}>
        <FileUp size={16} className="inline-block"/>
      </Button>
      <Button onClick={bringToFront}>
        <BringToFront size={16} className="inline-block"/>
      </Button>
      <Button onClick={sendToBack}>
        <SendToBack size={16} className="inline-block"/>
      </Button>
      <Button onClick={deleteSelected}>
        <Delete size={16} className="inline-block"/>
      </Button>
    </div>
  )
}