import { useEffect, useRef } from "react";

// Fixed ambient layer: drifting gradient orbs + a subtle floating particle field.
export function Background() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const ctx = canvas.getContext("2d")!;
    let raf = 0;
    let w = 0;
    let h = 0;

    type P = { x: number; y: number; vx: number; vy: number; r: number; a: number };
    let particles: P[] = [];

    function resize() {
      w = canvas!.width = window.innerWidth;
      h = canvas!.height = window.innerHeight;
      const count = Math.min(70, Math.floor((w * h) / 26000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        r: Math.random() * 1.6 + 0.4,
        a: Math.random() * 0.4 + 0.1,
      }));
    }
    resize();
    window.addEventListener("resize", resize);

    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(129,140,248,${p.a})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(frame);
    }
    frame();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute -top-[8%] -right-[5%] h-[600px] w-[600px] rounded-full animate-drift1"
        style={{
          background: "radial-gradient(circle, rgba(99,102,241,.30), transparent 70%)",
          filter: "blur(120px)",
        }}
      />
      <div
        className="absolute -bottom-[10%] -left-[8%] h-[500px] w-[500px] rounded-full animate-drift2"
        style={{
          background: "radial-gradient(circle, rgba(168,85,247,.22), transparent 70%)",
          filter: "blur(120px)",
        }}
      />
      <div
        className="absolute left-[35%] top-[45%] h-[400px] w-[400px] rounded-full animate-drift3"
        style={{
          background: "radial-gradient(circle, rgba(52,211,153,.15), transparent 70%)",
          filter: "blur(120px)",
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 opacity-60" />
    </div>
  );
}
