import {Button} from "@/components/ui/button";
import {BringToFront, FileDown, FileUp, SendToBack, Trash2} from "lucide-react";
import React from "react";
import {BaseShape} from "@/types/types";

type Props = {
  shapes: BaseShape[],
  setShapes: (shapes: (p: BaseShape[]) => (BaseShape[])) => void,
  selectedId: string | null,
  setSelectedId: (id: string | null) => void
}

export default function Navbar(
  {
    shapes,
    setShapes,
    selectedId,
    setSelectedId
  }: Props) {

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
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      setShapes(data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    <div className={'gap-5 grid grid-cols-[calc(var(--spacing)*55)_1fr_1fr]'}>
      <h2 className={'text-white text-2xl font-bold'}>My Canvas</h2>
      <div className="flex gap-4 items-center">
        <Button onClick={bringToFront} className={'cursor-pointer'}>
          <BringToFront/>
        </Button>
        <Button onClick={sendToBack} className={'cursor-pointer'}>
          <SendToBack/>
        </Button>
        <Button onClick={deleteSelected} className={'cursor-pointer'}>
          <Trash2 className="text-destructive"/>
        </Button>
      </div>
      <div className="flex gap-4 items-center justify-end">
        <Button onClick={exportJSON} className={'cursor-pointer'}>
          <FileDown/>
        </Button>
        <Button onClick={() => importJSON()} className={'cursor-pointer'}>
          <FileUp/>
        </Button>
      </div>
    </div>
  )
}