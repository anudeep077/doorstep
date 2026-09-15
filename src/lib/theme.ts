export type Theme = "system" | "light" | "dark";
export const THEME_KEY = "theme";

/**
 * Runs inline in <head> before paint: reads the stored theme and stamps
 * <html data-theme> so the first frame is already the right colour.
 * Kept as a string because it must execute before React hydrates.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_KEY)});if(t==='"light"'||t==='"dark"'){document.documentElement.setAttribute('data-theme',JSON.parse(t));}}catch(e){}})();`;

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  if (theme === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", theme);
}
