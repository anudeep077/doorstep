"use client";

import { useCallback, useEffect, useState } from "react";
import { isClientMounted, markClientMounted, readJSON, writeJSON } from "@/lib/storage";
import type { VegPreference } from "@/lib/types";

const KEY = "veg_preference";

// Persisted (profiles.veg_preference once auth lands) so the confirmation
// modal is a one-time choice, not a per-session nag. On the first hydration
// this starts as "off" and reads storage in an effect (`ready` lets the feed
// hold its skeleton so a veg user never sees non-veg cards flash); on later
// mounts it reads synchronously so there's no skeleton at all.
export function useVegPreference() {
  const [pref, setPrefState] = useState<VegPreference>(() => (isClientMounted() ? readJSON(KEY, "off") : "off"));
  const [ready, setReady] = useState(isClientMounted);

  useEffect(() => {
    if (ready) return;
    markClientMounted();
    // localStorage is a client-only external system, so this is the one
    // place it can be read — the same hydration pattern Momentum uses.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPrefState(readJSON<VegPreference>(KEY, "off"));
    setReady(true);
  }, [ready]);

  const setPref = useCallback((next: VegPreference) => {
    setPrefState(next);
    writeJSON(KEY, next);
  }, []);

  return { pref, setPref, ready };
}
