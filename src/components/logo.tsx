import type { SVGProps } from "react";

/** Doorstep mark: an arched door on its step, on the brand orange tile. */
export function LogoMark({ size = 32, ...props }: { size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden {...props}>
      <rect width="64" height="64" rx="16" fill="var(--brand)" />
      <path d="M21 46V29a11 11 0 0 1 22 0v17" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
      <path d="M14 47h36" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
      <circle cx="37" cy="37" r="2.6" fill="#fff" />
    </svg>
  );
}

/** Mark + wordmark, lockup used in headers. */
export function Wordmark({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark size={size} />
      <span className="font-extrabold tracking-[-0.03em]" style={{ fontSize: size * 0.8, lineHeight: 1 }}>
        doorstep
      </span>
    </span>
  );
}
