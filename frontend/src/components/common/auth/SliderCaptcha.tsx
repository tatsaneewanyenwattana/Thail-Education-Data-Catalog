"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const CW = 320;
const CH = 160;
const S = 42;
const R = 7;
const OX = R + 2;
const OY = R + 2;
const PCW = OX + S + R + 2;
const PCH = OY + S + 2;
const TOLERANCE = 5;

type Status = "idle" | "success" | "fail";

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function piece(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + S * 0.38 - R, y);
  ctx.arc(x + S * 0.38, y, R, Math.PI, 0, false);
  ctx.lineTo(x + S, y);
  ctx.lineTo(x + S, y + S * 0.38 - R);
  ctx.arc(x + S, y + S * 0.38, R, -Math.PI / 2, Math.PI / 2, false);
  ctx.lineTo(x + S, y + S);
  ctx.lineTo(x, y + S);
  ctx.closePath();
}

function makeBg(ctx: CanvasRenderingContext2D) {
  const h1 = rand(180, 280);
  const grad = ctx.createLinearGradient(0, 0, CW, CH);
  grad.addColorStop(0, `hsl(${h1},55%,48%)`);
  grad.addColorStop(0.5, `hsl(${h1 + 50},50%,42%)`);
  grad.addColorStop(1, `hsl(${h1 + 110},52%,38%)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CW, CH);
  for (let i = 0; i < 18; i++) {
    ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.1 + 0.02})`;
    ctx.beginPath();
    ctx.arc(Math.random() * CW, Math.random() * CH, rand(8, 30), 0, Math.PI * 2);
    ctx.fill();
  }
}

function draw(
  img: HTMLImageElement | null,
  bgC: HTMLCanvasElement,
  pcC: HTMLCanvasElement,
  tx: number,
  ty: number
) {
  const bg = bgC.getContext("2d")!;
  const pc = pcC.getContext("2d")!;

  bg.clearRect(0, 0, CW, CH);
  if (img) bg.drawImage(img, 0, 0, CW, CH);
  else makeBg(bg);

  // hole
  bg.save();
  piece(bg, tx, ty);
  bg.fillStyle = "rgba(0,0,0,0.4)";
  bg.fill();
  bg.strokeStyle = "rgba(255,255,255,0.5)";
  bg.lineWidth = 1.5;
  bg.stroke();
  bg.restore();

  // piece — sample from background at exact same position
  pc.clearRect(0, 0, PCW, PCH);
  pc.save();
  piece(pc, OX, OY);
  pc.clip();
  // source rect on background = (tx - OX, ty - OY, PCW, PCH)
  // dest rect on piece canvas = (0, 0, PCW, PCH)
  // so pixel at (OX, OY) on piece canvas = pixel at (tx, ty) on background
  if (img) {
    pc.drawImage(img, tx - OX, ty - OY, PCW, PCH, 0, 0, PCW, PCH);
  } else {
    // re-draw background into piece at correct offset
    pc.save();
    pc.translate(-(tx - OX), -(ty - OY));
    makeBg(pc);
    pc.restore();
  }
  pc.restore();

  // piece border
  piece(pc, OX, OY);
  pc.strokeStyle = "rgba(255,255,255,0.85)";
  pc.lineWidth = 2;
  pc.stroke();
}

export default function SliderCaptcha({
  onVerify,
}: {
  onVerify: (ok: boolean) => void;
}) {
  const bgRef = useRef<HTMLCanvasElement>(null);
  const pcRef = useRef<HTMLCanvasElement>(null);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [sx, setSx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const startX = useRef(0);

  const init = useCallback(() => {
    const ntx = rand(S + 60, CW - S - R - 20);
    const nty = rand(OY + 2, CH - S - 10);
    setTx(ntx);
    setTy(nty);
    setSx(0);
    setStatus("idle");

    const bgC = bgRef.current;
    const pcC = pcRef.current;
    if (!bgC || !pcC) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = `https://picsum.photos/${CW}/${CH}?random=${Date.now()}`;
    img.onload = () => draw(img, bgC, pcC, ntx, nty);
    img.onerror = () => draw(null, bgC, pcC, ntx, nty);
  }, []);

  useEffect(() => { init(); }, [init]);

  const onDown = (e: React.PointerEvent) => {
    if (status === "success") return;
    setDragging(true);
    startX.current = e.clientX - sx;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onMove = (e: React.PointerEvent) => {
    if (!dragging) return;
    setSx(Math.max(0, Math.min(CW - S, e.clientX - startX.current)));
  };

  const onUp = () => {
    if (!dragging) return;
    setDragging(false);
    if (Math.abs(sx - tx) <= TOLERANCE) {
      setStatus("success");
      onVerify(true);
    } else {
      setStatus("fail");
      onVerify(false);
      setTimeout(init, 800);
    }
  };

  const border =
    status === "success" ? "border-green-400" :
    status === "fail" ? "border-red-400" : "border-gray-200";

  const thumb =
    status === "success" ? "bg-green-500" :
    status === "fail" ? "bg-red-500" : "bg-primary-dark";

  return (
    <div className={`mx-auto overflow-hidden rounded-xl border-2 ${border} transition-colors`} style={{ width: CW }}>
      <div className="relative" style={{ width: CW, height: CH }}>
        <canvas ref={bgRef} width={CW} height={CH} style={{ width: CW, height: CH }} />
        <canvas
          ref={pcRef}
          width={PCW}
          height={PCH}
          className="pointer-events-none absolute"
          style={{ left: sx - OX, top: ty - OY, width: PCW, height: PCH }}
        />
      </div>

      <div className="relative flex h-11 items-center bg-gray-100 px-1">
        <div
          className="absolute left-0 top-0 h-full rounded-r-lg bg-primary-dark/10 transition-all"
          style={{ width: sx + 20 }}
        />
        {status === "idle" && sx === 0 && (
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center font-sarabun text-caption text-text-muted select-none">
            ลากจิ๊กซอว์ไปยังตำแหน่งที่ถูกต้อง
          </span>
        )}
        <div
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          className={`relative z-10 flex h-9 w-10 cursor-grab items-center justify-center rounded-lg ${thumb} text-white shadow-md transition-colors active:cursor-grabbing`}
          style={{ transform: `translateX(${sx}px)` }}
        >
          {status === "success" ? (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
          ) : status === "fail" ? (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          )}
        </div>
      </div>
    </div>
  );
}
