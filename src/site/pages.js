// The site's pages, in header order. `theme` picks the page's palette: "dark" (the default, over
// the 3D Topography canvas) or "cream" (the app page: its own light world).
export const PAGES = [
  { path: "/app", label: "App", theme: "cream" },
  { path: "/team", label: "Team" },
  { path: "/validation", label: "Validation" },
  { path: "/media", label: "Media" },
  { path: "/contact", label: "Contact" },
];

// Old addresses that moved, so links to them keep working.
export const REDIRECTS = [{ from: "/news", to: "/media" }];

// The waitlist lives on the home page.
export const WAITLIST_HREF = "/#waitlist";
