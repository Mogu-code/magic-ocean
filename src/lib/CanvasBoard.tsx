"use client";
import { useEffect, useRef, useState } from "react";

type Props = { onSave: (blob: Blob) => void };

export default function CanvasBoard({ onSave }: Props) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const isDrawing = useRef(false);

  const [color, setColor] = useState("#4a90e2");
  const [size, setSize] = useState(6);

  /** ✅ Always size canvas based on wrapper div */
  const resizeCanvas = () => {
    const wrapper = wrapperRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;

    const { width, height } = wrapper.getBoundingClientRect();

    // CSS size
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // internal pixel buffer
    canvas.width = width * dpr;
    canvas.height = height * dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); // ✅ no need to divide coords
    
    ctx.clearRect(0, 0, width, height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    ctxRef.current = ctx;
  };

  useEffect(() => {
    resizeCanvas();

    const obs = new ResizeObserver(resizeCanvas);
    obs.observe(wrapperRef.current!);

    return () => obs.disconnect();
  }, []);

  const getPos = (e: any) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top;
    return { x, y };
  };

  const startDrawing = (e: any) => {
    e.preventDefault();
    isDrawing.current = true;
    const { x, y } = getPos(e);
    ctxRef.current!.beginPath();
    ctxRef.current!.moveTo(x, y);
  };

  const draw = (e: any) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    const { x, y } = getPos(e);
    ctxRef.current!.strokeStyle = color;
    ctxRef.current!.lineWidth = size;
    ctxRef.current!.lineTo(x, y);
    ctxRef.current!.stroke();
  };

  const stop = () => {
    isDrawing.current = false;
    ctxRef.current!.beginPath();
  };
  const exportCroppedPNG = () => {
    const canvas = canvasRef.current!;
    const ctx = ctxRef.current!;
    const { width, height } = canvas;
  
    const data = ctx.getImageData(0, 0, width, height).data;
  
    let minX = width, minY = height, maxX = 0, maxY = 0;
  
    // find bounding box of drawn pixels
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4 + 3; // alpha channel
        if (data[idx] > 0) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }
  
    // crop area
    const cropWidth = maxX - minX;
    const cropHeight = maxY - minY;
  
    const croppedCanvas = document.createElement("canvas");
    croppedCanvas.width = cropWidth;
    croppedCanvas.height = cropHeight;
    const croppedCtx = croppedCanvas.getContext("2d")!;
    croppedCtx.drawImage(canvas, minX, minY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
  
    croppedCanvas.toBlob((blob) => blob && onSave(blob), "image/png");
  };
  
  const saveDrawing = () => {
    exportCroppedPNG();
  };
  

  const clearCanvas = () => resizeCanvas();

  return (
    <div className="w-full max-w-md mx-auto bg-white/70 backdrop-blur rounded-2xl p-4 shadow-2xl">
      {/* tools */}
      <div className="flex gap-3 mb-3 items-center">
        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-8 w-10 rounded" />
        <input type="range" min="2" max="16" value={size} onChange={(e) => setSize(parseInt(e.target.value))} className="flex-1" />
        <button onClick={clearCanvas} className="px-3 py-1.5 rounded-xl bg-gray-300 hover:bg-gray-400">Clear</button>
      </div>

      {/* ✅ wrapper controls size, canvas absolutely fills it */}
      <div ref={wrapperRef} className="relative w-full aspect-square rounded-xl overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stop}
          onMouseLeave={stop}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stop}
        />
      </div>

      <button onClick={saveDrawing} className="mt-4 w-full py-2 rounded-2xl bg-blue-500 text-white hover:bg-blue-700">
        Drop into ocean 🌊
      </button>
    </div>
  );
}
