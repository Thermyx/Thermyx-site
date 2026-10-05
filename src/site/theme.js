import { useLocation } from "react-router-dom";
import { PAGES } from "./pages.js";

// Browser chrome colors per theme (the <meta name="theme-color"> and the color scheme).
export const THEMES = {
  dark: { chrome: "#000000", scheme: "dark" },
  cream: { chrome: "#eee9e0", scheme: "light" },
};

// The theme of the page at `pathname` (index.html applies the same rule before first paint).
export function themeOf(pathname) {
  const path = pathname.replace(/\/+$/, "") || "/";
  return PAGES.find((page) => page.path === path)?.theme ?? "dark";
}

export function usePageTheme() {
  return themeOf(useLocation().pathname);
}
