import type { SVGProps } from "react";

// Small inline icon set (Lucide-style strokes) so there's no icon dependency.
type Props = SVGProps<SVGSVGElement>;
const base = (props: Props): Props => ({
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  ...props,
});

export const MapPinIcon = (p: Props) => (
  <svg {...base(p)}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);
export const ChevronDownIcon = (p: Props) => (
  <svg {...base(p)}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);
export const SearchIcon = (p: Props) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);
export const StarIcon = (p: Props) => (
  <svg {...base({ fill: "currentColor", stroke: "none", ...p })}>
    <path d="M12 2.5l2.9 6.2 6.8.8-5 4.7 1.3 6.7L12 17.6l-6 3.3 1.3-6.7-5-4.7 6.8-.8L12 2.5z" />
  </svg>
);
export const ClockIcon = (p: Props) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);
export const LeafIcon = (p: Props) => (
  <svg {...base(p)}>
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z" />
    <path d="M2 21c0-3 1.9-5.5 5-6.5" />
  </svg>
);
export const CrosshairIcon = (p: Props) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
  </svg>
);
export const XIcon = (p: Props) => (
  <svg {...base(p)}>
    <path d="M18 6 6 18M6 6l12 12" />
  </svg>
);
export const HomeIcon = (p: Props) => (
  <svg {...base(p)}>
    <path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2Z" />
  </svg>
);
export const BriefcaseIcon = (p: Props) => (
  <svg {...base(p)}>
    <rect x="2" y="7" width="20" height="14" rx="2" />
    <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
  </svg>
);
export const TrashIcon = (p: Props) => (
  <svg {...base(p)}>
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
  </svg>
);

/** The Indian veg/non-veg square mark: green for veg, red for non-veg. */
export function VegMark({ veg, className = "" }: { veg: boolean; className?: string }) {
  const c = veg ? "#16a34a" : "#dc2626";
  return (
    <svg viewBox="0 0 16 16" width={14} height={14} className={className} aria-label={veg ? "Veg" : "Non-veg"}>
      <rect x="1" y="1" width="14" height="14" rx="2" fill="none" stroke={c} strokeWidth="1.5" />
      <circle cx="8" cy="8" r="3.5" fill={c} />
    </svg>
  );
}
export const UserIcon = (p: Props) => (
  <svg {...base(p)}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);
export const ChevronRightIcon = (p: Props) => (
  <svg {...base(p)}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);
export const PlusIcon = (p: Props) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const MinusIcon = (p: Props) => (
  <svg {...base(p)}>
    <path d="M5 12h14" />
  </svg>
);
export const BagIcon = (p: Props) => (
  <svg {...base(p)}>
    <path d="M6 7h12l1 14H5L6 7Z" />
    <path d="M9 7V5a3 3 0 0 1 6 0v2" />
  </svg>
);
export const CheckIcon = (p: Props) => (
  <svg {...base(p)}>
    <path d="m5 12 5 5L20 7" />
  </svg>
);
export const CashIcon = (p: Props) => (
  <svg {...base(p)}>
    <rect x="2" y="6" width="20" height="12" rx="2" />
    <circle cx="12" cy="12" r="3" />
    <path d="M6 12h.01M18 12h.01" />
  </svg>
);
export const CardIcon = (p: Props) => (
  <svg {...base(p)}>
    <rect x="2" y="5" width="20" height="14" rx="2" />
    <path d="M2 10h20" />
  </svg>
);
export const PhoneIcon = (p: Props) => (
  <svg {...base(p)}>
    <rect x="6" y="2" width="12" height="20" rx="2" />
    <path d="M11 18h2" />
  </svg>
);
/** Delivery scooter with a box on the back, facing right (filled). */
export const DeliveryScooterIcon = (p: Props) => (
  <svg {...base({ fill: "currentColor", stroke: "none", ...p })}>
    <path d="M19 7c0-1.1-.9-2-2-2h-3v2h3v2.65L13.52 14H10V9H6c-2.21 0-4 1.79-4 4v3h2c0 1.66 1.34 3 3 3s3-1.34 3-3h4.48L19 10.35V7zM7 17c-.55 0-1-.45-1-1h2c0 .55-.45 1-1 1zM5 6h5v2H5zm14 7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zm0 4c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z" />
  </svg>
);

/** The scooter "driving": trailing speed lines plus a slight bounce. */
export function DrivingScooter({ size = 26, driving = true }: { size?: number; driving?: boolean }) {
  return (
    <span className="relative inline-block overflow-hidden" style={{ width: size, height: size }} aria-hidden>
      {driving && (
        <>
          <span className="ride-line" style={{ top: "34%", width: size * 0.28 }} />
          <span className="ride-line" style={{ top: "54%", width: size * 0.2, animationDelay: "-250ms" }} />
          <span className="ride-line" style={{ top: "74%", width: size * 0.24, animationDelay: "-500ms" }} />
        </>
      )}
      <DeliveryScooterIcon width={size} height={size} className={`absolute inset-0 ${driving ? "ride-bob" : ""}`} />
    </span>
  );
}
export const SettingsIcon = (p: Props) => (
  <svg {...base(p)}>
    <path d="M12.2 2h-.4a2 2 0 0 0-2 2v.2a2 2 0 0 1-1 1.7l-.4.2a2 2 0 0 1-2 0l-.2-.1a2 2 0 0 0-2.7.7l-.2.4a2 2 0 0 0 .7 2.7l.2.1a2 2 0 0 1 1 1.7v.6a2 2 0 0 1-1 1.7l-.2.1a2 2 0 0 0-.7 2.7l.2.4a2 2 0 0 0 2.7.7l.2-.1a2 2 0 0 1 2 0l.4.2a2 2 0 0 1 1 1.7V20a2 2 0 0 0 2 2h.4a2 2 0 0 0 2-2v-.2a2 2 0 0 1 1-1.7l.4-.2a2 2 0 0 1 2 0l.2.1a2 2 0 0 0 2.7-.7l.2-.4a2 2 0 0 0-.7-2.7l-.2-.1a2 2 0 0 1-1-1.7v-.6a2 2 0 0 1 1-1.7l.2-.1a2 2 0 0 0 .7-2.7l-.2-.4a2 2 0 0 0-2.7-.7l-.2.1a2 2 0 0 1-2 0l-.4-.2a2 2 0 0 1-1-1.7V4a2 2 0 0 0-2-2Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
export const HomeFilledIcon = (p: Props) => (
  <svg {...base({ fill: "currentColor", ...p })}>
    <path d="m3 10 9-7 9 7v10a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2Z" />
  </svg>
);
export const SunIcon = (p: Props) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </svg>
);
export const MoonIcon = (p: Props) => (
  <svg {...base(p)}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
  </svg>
);
export const SystemIcon = (p: Props) => (
  <svg {...base(p)}>
    <rect x="2" y="4" width="20" height="13" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>
);
