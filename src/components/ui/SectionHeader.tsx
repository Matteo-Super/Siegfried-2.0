import { Reveal } from "./Reveal";

type Props = {
  eyebrow?: string;
  title: React.ReactNode;
  sub?: string;
  center?: boolean;
};

export function SectionHeader({ eyebrow, title, sub, center = true }: Props) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && (
        <Reveal>
          <p className="section-eyebrow">{eyebrow}</p>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
      </Reveal>
      {sub && (
        <Reveal delay={0.1}>
          <p className="mt-4 text-lg text-2">{sub}</p>
        </Reveal>
      )}
    </div>
  );
}
