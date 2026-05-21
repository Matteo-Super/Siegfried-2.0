import { Component, type ReactNode } from "react";

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
  /** When true, render a minimal inline fallback (for a sub-section like the 3D sim). */
  compact?: boolean;
};

type State = { hasError: boolean };

// Catches render/runtime errors so a single failing component (e.g. the WebGL
// canvas) never blanks the whole page.
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error("ErrorBoundary caught:", error);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div
        className={`flex flex-col items-center justify-center gap-4 text-center ${
          this.props.compact ? "h-[460px] rounded-2xl border border-[color:var(--border)] p-8" : "min-h-screen p-8"
        }`}
      >
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[color:var(--border)] bg-accent/10 text-2xl text-accent">
          <i className="fa-solid fa-triangle-exclamation" />
        </span>
        <div>
          <p className="text-lg font-bold">Etwas ist schiefgelaufen</p>
          <p className="mt-1 text-sm text-2">Bitte lade die Seite neu.</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="rounded-xl border border-[color:var(--border)] px-5 py-2.5 text-sm font-semibold transition-colors hover:border-accent hover:text-accent"
        >
          <i className="fa-solid fa-rotate-right mr-2" /> Neu laden
        </button>
      </div>
    );
  }
}
