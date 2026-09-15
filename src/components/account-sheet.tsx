"use client";

import type { Address, VegPreference } from "@/lib/types";
import Link from "next/link";
import { BagIcon, ChevronRightIcon, LeafIcon, MapPinIcon } from "./icons";
import { ProfileCard } from "./profile-card";
import { Sheet } from "./sheet";

const PREF_LABEL: Record<VegPreference, string> = {
  off: "Off",
  veg_restaurants: "Only veg restaurants",
  veg_dishes: "Veg dishes only",
};

/** Quick account menu behind the avatar button on Home. */
export function AccountSheet({
  open,
  onClose,
  address,
  savedCount,
  pref,
  onManageAddresses,
}: {
  open: boolean;
  onClose: () => void;
  address: Address | null;
  savedCount: number;
  pref: VegPreference;
  onManageAddresses: () => void;
}) {
  return (
    <Sheet open={open} onClose={onClose} title="Account">
      <div className="mb-4">
        <ProfileCard compact />
      </div>

      <ul className="divide-y divide-line rounded-2xl border border-line">
        <li>
          <Link href="/orders" onClick={onClose} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-line/40">
            <BagIcon className="shrink-0 text-brand" />
            <span className="min-w-0 flex-1">
              <span className="block font-medium">Orders</span>
              <span className="block text-xs text-muted">Track and reorder</span>
            </span>
            <ChevronRightIcon className="shrink-0 text-muted" />
          </Link>
        </li>
        <li>
          <button
            type="button"
            onClick={() => {
              onClose();
              onManageAddresses();
            }}
            className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-line/40"
          >
            <MapPinIcon className="shrink-0 text-brand" />
            <span className="min-w-0 flex-1">
              <span className="block font-medium">Addresses</span>
              <span className="block truncate text-xs text-muted">
                {address ? `Delivering to ${address.short_label}` : "No address set"}
                {savedCount > 0 && ` · ${savedCount} saved`}
              </span>
            </span>
            <ChevronRightIcon className="shrink-0 text-muted" />
          </button>
        </li>
        <li className="flex items-center gap-3 px-4 py-3">
          <LeafIcon className="shrink-0 text-veg" />
          <span className="min-w-0 flex-1">
            <span className="block font-medium">Veg mode</span>
            <span className="block text-xs text-muted">{PREF_LABEL[pref]} · change it from the home screen</span>
          </span>
        </li>
      </ul>
    </Sheet>
  );
}
