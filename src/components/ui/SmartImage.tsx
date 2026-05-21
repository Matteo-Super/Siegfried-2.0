import { useState } from "react";
import type { Photo } from "../../data/site";

type Props = {
  photo?: Photo;
  /** Which variant to use as the main source. */
  size?: "full" | "card";
  alt: string;
  className?: string;
  /** Slow Ken Burns zoom for cinematic sections. */
  kenburns?: boolean;
  priority?: boolean;
};

// Responsive image with blur-up LQIP placeholder + WebP source / JPG fallback.
export function SmartImage({
  photo,
  size = "card",
  alt,
  className = "",
  kenburns = false,
  priority = false,
}: Props) {
  const [loaded, setLoaded] = useState(false);

  if (!photo) {
    return (
      <div
        className={`flex items-center justify-center bg-ink-800 text-3 ${className}`}
        aria-label={alt}
      >
        <i className="fa-solid fa-image opacity-30" />
      </div>
    );
  }

  const webp = size === "full" ? photo.full : photo.card;
  const jpg = size === "full" ? photo.fullJpg : photo.cardJpg;

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img
        src={photo.lqip}
        alt=""
        aria-hidden
        className={`absolute inset-0 h-full w-full scale-110 object-cover blur-xl transition-opacity duration-700 ${
          loaded ? "opacity-0" : "opacity-100"
        }`}
      />
      <picture>
        <source srcSet={webp} type="image/webp" />
        <img
          src={jpg}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={`h-full w-full object-cover transition-[opacity,transform] duration-[1200ms] ease-out ${
            loaded ? "opacity-100" : "opacity-0"
          } ${kenburns ? "animate-kenburns" : ""}`}
        />
      </picture>
    </div>
  );
}
