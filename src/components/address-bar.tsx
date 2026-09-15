"use client";

import type { Address } from "@/lib/types";
import type { LocationStatus } from "@/lib/use-address";
import { ChevronDownIcon, MapPinIcon } from "./icons";

const STATUS_TEXT: Partial<Record<LocationStatus, string>> = {
  idle: "Finding location…",
  locating: "Finding location…",
  denied: "Set address",
  unavailable: "Set address",
};

/** Compact "Deliver to" chip — sized to its content, sits left on its row. */
export function AddressBar({
  address,
  status,
  onClick,
}: {
  address: Address | null;
  status: LocationStatus;
  onClick: () => void;
}) {
  const label = address?.short_label ?? STATUS_TEXT[status] ?? "Set address";
  const pending = !address && (status === "idle" || status === "locating");

  return (
    <div className="mr-auto min-w-0">
      <button
        type="button"
        onClick={onClick}
        aria-label={`Deliver to ${label}. Change address`}
        className="inline-flex max-w-full items-center gap-2 rounded-full border border-line bg-surface py-1.5 pl-2 pr-3 text-left shadow-sm hover:bg-line/40"
      >
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
          <MapPinIcon width={16} height={16} />
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block text-[10px] font-medium uppercase tracking-wide text-muted">Deliver to</span>
          <span className={`block truncate text-sm font-semibold ${pending ? "animate-pulse text-muted" : ""}`}>{label}</span>
        </span>
        <ChevronDownIcon width={16} height={16} className="shrink-0 text-muted" />
      </button>
    </div>
  );
}
