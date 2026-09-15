"use client";

import { useState } from "react";
import type { VegPreference } from "@/lib/types";
import { LeafIcon } from "./icons";
import { Sheet } from "./sheet";
import { ToggleSwitch } from "./toggle-switch";

// Short forms for the row subtitle; the modal spells them out in full.
const MODE_LABEL: Record<Exclude<VegPreference, "off">, string> = {
  veg_restaurants: "Only veg restaurants",
  veg_dishes: "Veg dishes only",
};

/**
 * The "Veg mode" row plus both confirmation modals. Owns only the modal
 * open/closed state; the preference itself lives with the feed so the
 * on-animation can be sequenced against the re-filter.
 */
export function VegModeRow({
  pref,
  ready,
  onTurnOn,
  onTurnOff,
}: {
  pref: VegPreference;
  /** False until the stored preference has been read on the client. */
  ready: boolean;
  onTurnOn: (mode: Exclude<VegPreference, "off">) => void;
  onTurnOff: () => void;
}) {
  const [modal, setModal] = useState<"choose" | "confirm-off" | null>(null);
  const on = pref !== "off";

  return (
    <>
      <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3">
        <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${on ? "bg-veg text-white" : "bg-veg/10 text-veg"}`}>
          <LeafIcon width={18} height={18} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">Veg mode</p>
          {on ? (
            // "Change" sits outside the truncating span so it can't be
            // clipped when the mode label runs long on narrow screens.
            <p className="flex items-center gap-1.5 text-xs text-muted">
              <span className="truncate">{MODE_LABEL[pref as keyof typeof MODE_LABEL]}</span>
              <span aria-hidden>·</span>
              <button type="button" onClick={() => setModal("choose")} className="shrink-0 font-medium text-veg underline-offset-2 hover:underline">
                Change
              </button>
            </p>
          ) : (
            <p className="truncate text-xs text-muted">Filter the feed to vegetarian options</p>
          )}
        </div>
        <ToggleSwitch
          checked={on}
          animate={ready}
          label="Veg mode"
          onChange={(next) => setModal(next ? "choose" : "confirm-off")}
        />
      </div>

      {/* Turning ON: pick which flavour of veg mode. */}
      <Sheet open={modal === "choose"} onClose={() => setModal(null)} title="Turn on veg mode">
        <p className="mb-4 text-sm text-muted">How strict should it be?</p>
        <div className="space-y-2">
          <ChoiceButton
            title="Only veg restaurants"
            body="Hide every restaurant that isn't 100% vegetarian."
            selected={pref === "veg_restaurants"}
            onClick={() => {
              setModal(null);
              onTurnOn("veg_restaurants");
            }}
          />
          <ChoiceButton
            title="All restaurants, veg dishes only"
            body="Keep every restaurant, but show their veg dishes instead."
            selected={pref === "veg_dishes"}
            onClick={() => {
              setModal(null);
              onTurnOn("veg_dishes");
            }}
          />
        </div>
        <button type="button" onClick={() => setModal(null)} className="mt-3 w-full py-2 text-sm font-medium text-muted">
          Cancel
        </button>
      </Sheet>

      {/* Turning OFF: confirm, don't flip instantly. */}
      <Sheet open={modal === "confirm-off"} onClose={() => setModal(null)} title="Turn off veg mode?">
        <p className="mb-5 text-sm text-muted">Non-veg restaurants and dishes will show in your feed again.</p>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setModal(null)}
            className="rounded-2xl border border-line py-3 font-semibold hover:bg-line/40"
          >
            Keep it on
          </button>
          <button
            type="button"
            onClick={() => {
              setModal(null);
              onTurnOff();
            }}
            className="rounded-2xl bg-foreground py-3 font-semibold text-background hover:opacity-90"
          >
            Turn off
          </button>
        </div>
      </Sheet>
    </>
  );
}

function ChoiceButton({
  title,
  body,
  selected,
  onClick,
}: {
  title: string;
  body: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition-colors hover:bg-veg/5 ${
        selected ? "border-veg bg-veg/10" : "border-line"
      }`}
    >
      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-veg/15 text-veg">
        <LeafIcon width={14} height={14} />
      </span>
      <span>
        <span className="block font-semibold">{title}</span>
        <span className="block text-sm text-muted">{body}</span>
      </span>
    </button>
  );
}

/**
 * Full-screen green splash shown only for the "only veg restaurants" path.
 * Mounted by the feed; unmounts itself when the CSS animation finishes.
 */
export function VegModeOverlay({ onDone }: { onDone: () => void }) {
  return (
    <div
      className="veg-splash fixed inset-0 z-50 grid place-items-center bg-veg text-white"
      onAnimationEnd={(e) => {
        if (e.target === e.currentTarget) onDone();
      }}
      role="status"
      aria-live="polite"
    >
      <div className="veg-splash-content flex flex-col items-center gap-3">
        <span className="grid h-20 w-20 place-items-center rounded-full bg-white/20">
          <LeafIcon width={44} height={44} strokeWidth={2.2} />
        </span>
        <p className="text-2xl font-bold tracking-tight">Veg mode on</p>
      </div>
    </div>
  );
}
