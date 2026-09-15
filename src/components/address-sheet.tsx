"use client";

import { useEffect, useState } from "react";
import type { Address, AddressLabel, GeocodeResult } from "@/lib/types";
import { searchAddresses, type LocationError, type LocationStatus } from "@/lib/use-address";
import { BriefcaseIcon, CrosshairIcon, HomeIcon, MapPinIcon, SearchIcon, TrashIcon } from "./icons";
import { Sheet } from "./sheet";

const LOCATION_ERROR_TEXT: Record<LocationError, string> = {
  blocked:
    "Location is blocked for this site. Allow it in your browser's site settings (the lock icon in the address bar), then tap the button again.",
  dismissed: "The location prompt was closed. Tap the button again and choose Allow.",
  insecure:
    "Browsers only share location over HTTPS. Open the app via localhost or an https:// address — for phone testing run `npm run dev:https`.",
  timeout: "Couldn't get a GPS fix in time. Try again, or search for your area below.",
  unavailable: "This device can't work out its location right now. Search for your area below.",
  geocode: "Found your position but couldn't turn it into an address. Search for your area below.",
};

const LABEL_ICON: Record<AddressLabel, typeof HomeIcon> = {
  home: HomeIcon,
  work: BriefcaseIcon,
  other: MapPinIcon,
};

export function AddressSheet({
  open,
  onClose,
  status,
  error = null,
  current,
  saved,
  onLocate,
  onChoose,
  onSave,
  onRemove,
}: {
  open: boolean;
  onClose: () => void;
  status: LocationStatus;
  /** Why the last "use my location" failed, if it did. */
  error?: LocationError | null;
  current: Address | null;
  saved: Address[];
  onLocate: () => void;
  onChoose: (a: Address) => void;
  onSave: (g: GeocodeResult, label: AddressLabel) => void;
  onRemove: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  // Results are stored with the query they answer, so "still searching" is
  // derived (query ≠ answered query) rather than a second piece of state.
  const [answer, setAnswer] = useState<{ q: string; results: GeocodeResult[] }>({ q: "", results: [] });
  const [picked, setPicked] = useState<GeocodeResult | null>(null);
  const [label, setLabel] = useState<AddressLabel>("home");

  const q = query.trim();
  const canSearch = !picked && q.length >= 3;
  const searching = canSearch && answer.q !== q;
  const results = canSearch && answer.q === q ? answer.results : [];

  // Debounced forward geocode. Nominatim asks for ≤1 req/s; 500ms plus the
  // 3-char minimum keeps us comfortably under while typing.
  useEffect(() => {
    if (!canSearch) return;
    let cancelled = false;
    const t = setTimeout(async () => {
      const found = await searchAddresses(q);
      if (!cancelled) setAnswer({ q, results: found });
    }, 500);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q, canSearch]);

  // Every path out of the sheet goes through here so it reopens blank.
  const close = () => {
    setQuery("");
    setPicked(null);
    onClose();
  };

  // Close automatically once a fresh GPS lookup lands.
  useEffect(() => {
    if (open && status === "resolved") onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- react to status only
  }, [status]);

  const deniedNote = error
    ? LOCATION_ERROR_TEXT[error]
    : status === "denied"
      ? "Location access was denied — enter your address below, or allow it in your browser settings."
      : status === "unavailable"
        ? "We couldn't detect your location. Enter your address below."
        : null;

  return (
    <Sheet open={open} onClose={close} title="Delivery address">
      {deniedNote && (
        <p className="mb-4 rounded-xl bg-brand/10 px-3 py-2 text-sm text-foreground">{deniedNote}</p>
      )}

      <button
        type="button"
        onClick={onLocate}
        disabled={status === "locating"}
        className="mb-4 flex w-full items-center gap-3 rounded-2xl border border-veg/40 bg-veg/5 px-4 py-3 text-left hover:bg-veg/10 disabled:opacity-60"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-veg text-white">
          <CrosshairIcon className={status === "locating" ? "animate-spin" : ""} width={18} height={18} />
        </span>
        <span className="min-w-0">
          <span className="block font-semibold">{status === "locating" ? "Finding you…" : "Use my current location"}</span>
          <span className="block text-xs text-muted">
            {status === "locating" ? "Waiting for GPS" : error ? "Didn't work — see note above" : "Your browser will ask for permission"}
          </span>
        </span>
      </button>

      {saved.length > 0 && (
        <section className="mb-4">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Saved</h3>
          <ul className="divide-y divide-line rounded-2xl border border-line">
            {saved.map((a) => {
              const Icon = LABEL_ICON[a.label];
              const active = current?.id === a.id;
              return (
                <li key={a.id} className="flex items-center gap-2 pr-2">
                  <button
                    type="button"
                    onClick={() => {
                      onChoose(a);
                      close();
                    }}
                    className={`flex min-w-0 flex-1 items-center gap-3 px-4 py-3 text-left hover:bg-line/40 ${active ? "text-brand" : ""}`}
                  >
                    <Icon className="shrink-0" />
                    <span className="min-w-0">
                      <span className="block font-medium capitalize">{a.label}</span>
                      <span className="block truncate text-xs text-muted">{a.formatted}</span>
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(a.id)}
                    aria-label={`Remove ${a.label} address`}
                    className="rounded-full p-2 text-muted hover:bg-line/60 hover:text-red-600"
                  >
                    <TrashIcon width={16} height={16} />
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <section>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Add an address</h3>
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            value={picked ? picked.formatted : query}
            onChange={(e) => {
              setPicked(null);
              setQuery(e.target.value);
            }}
            placeholder="Search area, street or landmark"
            className="w-full rounded-2xl border border-line bg-background py-3 pl-10 pr-3 outline-none focus:border-brand"
          />
        </div>

        {!picked && query.trim().length >= 3 && (
          <ul className="mt-2 overflow-hidden rounded-2xl border border-line">
            {searching && results.length === 0 && (
              <li className="px-4 py-3 text-sm text-muted">Searching…</li>
            )}
            {!searching && results.length === 0 && (
              <li className="px-4 py-3 text-sm text-muted">No matches — try a nearby landmark.</li>
            )}
            {results.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => setPicked(r)}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-line/40"
                >
                  <MapPinIcon className="mt-0.5 shrink-0 text-muted" />
                  <span className="min-w-0">
                    <span className="block font-medium">{r.short_label}</span>
                    <span className="block truncate text-xs text-muted">{r.formatted}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        {picked && (
          <div className="mt-3 space-y-3">
            <div className="flex gap-2" role="radiogroup" aria-label="Address label">
              {(["home", "work", "other"] as const).map((l) => {
                const Icon = LABEL_ICON[l];
                const on = label === l;
                return (
                  <button
                    key={l}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => setLabel(l)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm capitalize ${
                      on ? "border-brand bg-brand/10 text-brand" : "border-line text-muted"
                    }`}
                  >
                    <Icon width={16} height={16} />
                    {l}
                  </button>
                );
              })}
            </div>
            <button
              type="button"
              onClick={() => {
                onSave(picked, label);
                close();
              }}
              className="w-full rounded-2xl bg-brand py-3 font-semibold text-white hover:opacity-90"
            >
              Deliver here
            </button>
          </div>
        )}
      </section>
    </Sheet>
  );
}
