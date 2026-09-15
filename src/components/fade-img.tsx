"use client";

import { useEffect, useRef, useState, type ImgHTMLAttributes } from "react";

/**
 * <img> that fades in once loaded instead of popping, and reports failure
 * so the caller can swap in a placeholder. Handles the cached-image case
 * (already complete before React attaches onLoad) so nothing stays hidden.
 */
export function FadeImg({
  onFail,
  className = "",
  ...props
}: Omit<ImgHTMLAttributes<HTMLImageElement>, "onError" | "onLoad"> & { onFail?: () => void }) {
  const ref = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const img = ref.current;
    if (img?.complete && img.naturalWidth > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing with an external (already-loaded) image
      setLoaded(true);
    }
  }, []);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      decoding="async"
      onLoad={() => setLoaded(true)}
      onError={onFail}
      className={`transition-opacity duration-300 ease-out ${loaded ? "opacity-100" : "opacity-0"} ${className}`}
      {...props}
    />
  );
}
