"use client";

import { useEffect, useRef, useState } from "react";
import { ProtoBtn } from "@/components/onboarding/atoms/proto-field";

type SignaturePadProps = {
  onDone: (dataUrl: string) => void;
  onClear?: () => void;
};

export function SignaturePad({ onDone, onClear }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [hasInk, setHasInk] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(dpr, dpr);
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#15181A";
  }, []);

  function pos(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function down(e: React.PointerEvent<HTMLCanvasElement>) {
    drawing.current = true;
    const ctx = canvasRef.current!.getContext("2d")!;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    canvasRef.current!.setPointerCapture(e.pointerId);
  }

  function move(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    setHasInk(true);
  }

  function up() {
    drawing.current = false;
  }

  function clear() {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasInk(false);
    onClear?.();
  }

  function done() {
    onDone(canvasRef.current!.toDataURL("image/png"));
  }

  return (
    <div>
      <canvas
        ref={canvasRef}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerLeave={up}
        className="block h-[150px] w-full cursor-crosshair touch-none rounded-xl border-[1.5px] border-dashed border-line-strong bg-white"
      />
      <div className="mt-2.5 flex items-center justify-between">
        <span className="text-xs text-ink-faint">
          Sign above with finger or stylus
        </span>
        <div className="flex gap-2">
          <ProtoBtn small ghost onClick={clear}>
            Clear
          </ProtoBtn>
          <ProtoBtn small disabled={!hasInk} onClick={done}>
            Accept signature
          </ProtoBtn>
        </div>
      </div>
    </div>
  );
}
