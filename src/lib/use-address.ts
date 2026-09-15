"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isClientMounted, markClientMounted, readJSON, writeJSON } from "@/lib/storage";
import type { Address, GeocodeResult } from "@/lib/types";

const CURRENT_KEY = "current_address";
const SAVED_KEY = "saved_addresses";

/** Why the last location attempt failed — drives the message under the button. */
export type LocationError =
  | "blocked"     // permission is denied at the browser level; needs site settings
  | "dismissed"   // user closed the prompt without choosing
  | "insecure"    // page isn't https/localhost, so the browser refuses to ask
  | "timeout"     // no GPS fix in time
  | "unavailable" // device has no way to locate itself
  | "geocode";    // got coordinates but couldn't turn them into an address

export type LocationStatus =
  | "idle"        // nothing attempted yet (server render / first paint)
  | "locating"    // permission prompt showing or GPS fix in progress
  | "resolved"    // we have an address (from GPS or manual pick)
  | "denied"      // user refused permission — manual entry is the path
  | "unavailable" // no geolocation API, timeout, or geocoder failure
  | "manual";     // user chose an address by hand; don't re-prompt

export async function reverseGeocode(lat: number, lng: number): Promise<GeocodeResult> {
  const res = await fetch(`/api/geocode?lat=${lat}&lon=${lng}`);
  if (!res.ok) throw new Error("reverse geocode failed");
  const { results } = (await res.json()) as { results: GeocodeResult[] };
  if (!results[0]) throw new Error("no result");
  return results[0];
}

export async function searchAddresses(q: string): Promise<GeocodeResult[]> {
  const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
  if (!res.ok) return [];
  const { results } = (await res.json()) as { results: GeocodeResult[] };
  return results;
}

function fromGeocode(g: GeocodeResult, label: Address["label"] = "other"): Address {
  return { id: crypto.randomUUID(), label, short_label: g.short_label, formatted: g.formatted, lat: g.lat, lng: g.lng };
}

// Outcome of the geolocation attempt for this page session, so re-mounting
// the feed (back navigation) neither re-prompts nor flashes "Finding…".
let sessionStatus: LocationStatus | null = null;

export function useAddress() {
  // Synchronous read on client-side re-mounts (see isClientMounted) so the
  // chip doesn't flash "Finding location…" when returning to the feed.
  const remount = isClientMounted();
  const [current, setCurrent] = useState<Address | null>(() => (remount ? readJSON(CURRENT_KEY, null) : null));
  const [saved, setSaved] = useState<Address[]>(() => (remount ? readJSON(SAVED_KEY, []) : []));
  const [status, setStatusState] = useState<LocationStatus>(() =>
    remount ? (readJSON(CURRENT_KEY, null) ? "manual" : (sessionStatus ?? "idle")) : "idle"
  );
  const requested = useRef(remount && (Boolean(readJSON(CURRENT_KEY, null)) || sessionStatus !== null));
  const [error, setError] = useState<LocationError | null>(null);
  const setStatus = useCallback((next: LocationStatus) => {
    sessionStatus = next;
    setStatusState(next);
  }, []);

  const locate = useCallback(() => {
    setError(null);
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setError("unavailable");
      setStatus("unavailable");
      return;
    }
    // Browsers only offer geolocation on secure origins. localhost counts;
    // a LAN IP over plain http (phone testing) does not, and the browser
    // then fails with PERMISSION_DENIED without ever showing a prompt.
    if (!window.isSecureContext) {
      setError("insecure");
      setStatus("unavailable");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const g = await reverseGeocode(coords.latitude, coords.longitude);
          const addr = fromGeocode(g);
          setCurrent(addr);
          writeJSON(CURRENT_KEY, addr);
          setStatus("resolved");
        } catch {
          setError("geocode");
          setStatus("unavailable");
        }
      },
      async (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          // Same error code whether the user dismissed the prompt or the
          // site is blocked; the Permissions API tells them apart.
          let blocked = false;
          try {
            blocked = (await navigator.permissions.query({ name: "geolocation" })).state === "denied";
          } catch {
            /* Permissions API unavailable — assume dismissed */
          }
          setError(blocked ? "blocked" : "dismissed");
          setStatus("denied");
        } else {
          setError(err.code === err.TIMEOUT ? "timeout" : "unavailable");
          setStatus("unavailable");
        }
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60_000 }
    );
  }, [setStatus]);

  // On first load: reuse a stored address if there is one (no permission
  // prompt on every visit), otherwise ask for location once.
  // Hydrating from localStorage (client-only) — see use-veg-preference.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (requested.current) return;
    requested.current = true;
    markClientMounted();
    setSaved(readJSON<Address[]>(SAVED_KEY, []));
    const stored = readJSON<Address | null>(CURRENT_KEY, null);
    if (stored) {
      setCurrent(stored);
      setStatus("manual");
      return;
    }
    locate();
  }, [locate, setStatus]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const choose = useCallback(
    (addr: Address) => {
      setCurrent(addr);
      writeJSON(CURRENT_KEY, addr);
      setStatus("manual");
    },
    [setStatus]
  );

  const save = useCallback(
    (g: GeocodeResult, label: Address["label"]) => {
      const addr = fromGeocode(g, label);
      setSaved((prev) => {
        const next = [addr, ...prev.filter((a) => a.formatted !== addr.formatted)];
        writeJSON(SAVED_KEY, next);
        return next;
      });
      choose(addr);
    },
    [choose]
  );

  const remove = useCallback((id: string) => {
    setSaved((prev) => {
      const next = prev.filter((a) => a.id !== id);
      writeJSON(SAVED_KEY, next);
      return next;
    });
  }, []);

  return { current, saved, status, error, locate, choose, save, remove };
}
