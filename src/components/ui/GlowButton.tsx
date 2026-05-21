import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost" | "google";

type Props = {
  children: ReactNode;
  variant?: Variant;
  href?: string;
  className?: string;
  full?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const base =
  "group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl font-semibold text-sm px-6 py-3 transition-all duration-300 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";

const Shine = () => (
  <span className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-xl">
    <span className="absolute inset-y-0 left-0 w-1/3 -translate-x-[120%] bg-gradient-to-r from-transparent via-white/30 to-transparent group-hover:[animation:shine-sweep_0.9s_ease]" />
  </span>
);

const styles: Record<Variant, string> = {
  primary:
    "text-white shadow-glow hover:-translate-y-0.5 [background:linear-gradient(135deg,#6366f1,#818cf8)] before:absolute before:inset-0 before:rounded-xl before:opacity-0 hover:before:opacity-100 before:[background:linear-gradient(135deg,#818cf8,#a78bfa)] before:transition-opacity",
  ghost:
    "border border-[color:var(--border)] text-[color:var(--text-1)] hover:border-[color:var(--accent)] hover:bg-accent/5 backdrop-blur",
  google:
    "bg-white text-slate-800 hover:-translate-y-0.5 shadow-md border border-slate-200",
};

export function GlowButton({
  children,
  variant = "primary",
  href,
  className = "",
  full,
  ...rest
}: Props) {
  const cls = `${base} ${styles[variant]} ${full ? "w-full" : ""} ${className}`;
  const content = (
    <>
      <Shine />
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </>
  );

  if (href) {
    const external = href.startsWith("http");
    return (
      <a
        href={href}
        className={cls}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
      >
        {content}
      </a>
    );
  }
  return (
    <button className={cls} {...rest}>
      {content}
    </button>
  );
}
