"use client";

import { useCallback, useEffect, useState } from "react";
import { isClientMounted, markClientMounted, readJSON, writeJSON } from "@/lib/storage";
import { applyTheme, THEME_KEY, type Theme } from "@/lib/theme";

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(() => (isClientMounted() ? readJSON<Theme>(THEME_KEY, "system") : "system"));
  const [ready, setReady] = useState(isClientMounted);

  useEffect(() => {
    if (ready) return;
    markClientMounted();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(readJSON<Theme>(THEME_KEY, "system"));
    setReady(true);
  }, [ready]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    writeJSON(THEME_KEY, next);
    applyTheme(next);
  }, []);

  return { theme, setTheme, ready };
}
