import { useRef, type ReactNode, type MouseEvent } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  /** Enable cursor-tracking 3D tilt + glow. */
  tilt?: boolean;
  id?: string;
};

// Glassmorphism card with optional parallax tilt + spotlight glow on hover.
export function GlassCard({ children, className = "", tilt = false, id }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: MouseEvent<HTMLDivElement>) {
    if (!tilt || !ref.current) return;
    const el = ref.current;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const rx = (py - 0.5) * -8;
    const ry = (px - 0.5) * 8;
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  }

  function onLeave() {
    if (!tilt || !ref.current) return;
    ref.current.style.transform = "";
  }

  return (
    <div
      id={id}
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`glass glass-hover glass-ring relative overflow-hidden ${className}`}
      style={
        tilt
          ? {
              transition: "transform 0.25s cubic-bezier(.16,1,.3,1)",
              willChange: "transform",
            }
          : undefined
      }
    >
      {tilt && (
        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 hover:opacity-100"
          style={{
            background:
              "radial-gradient(420px circle at var(--mx,50%) var(--my,50%), rgba(129,140,248,0.12), transparent 60%)",
          }}
        />
      )}
      {children}
    </div>
  );
}
