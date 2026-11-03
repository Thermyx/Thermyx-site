// The Media page has three sections:
//   Thermyx Media     our channels (from socials.js), our videos (VIDEOS), and our posts, press,
//                     and recognition (POSTS)
//   Learn             the app's Learn articles, to read here (data/learn.js)
//   Selected Sources  every reference those articles cite (data/learn.js)
// Add an entry to publish it (newest first). `example: true` marks a template: it shows an
// "Example" tag and isn't a link; delete those as real entries arrive.
export const MEDIA_SECTIONS = [
  { id: "thermyx", label: "Thermyx Media", blurb: "Our channels, our pitches, and the press." },
  { id: "learn", label: "Learn", blurb: "Short, sourced reads from the app." },
  { id: "sources", label: "Selected Sources", blurb: "Every reference our articles cite." },
];

// Channels shown as tiles, in order (ids from socials.js), with what to do there.
export const CHANNELS = [
  { id: "youtube", action: "Watch" },
  { id: "instagram", action: "Follow" },
  { id: "tiktok", action: "Follow" },
  { id: "linkedin", action: "Connect" },
];

// Videos, newest first. `id` is the YouTube video id; titles and dates are the uploads' own.
export const VIDEOS = [
  {
    id: "C0UxrPtbHs4",
    kind: "Submission",
    title: "Thermyx · Congressional App Challenge 2026",
    event: "Congressional App Challenge · Texas District 07",
    date: "2026-10-26",
  },
  {
    id: "BnMitvgW82s",
    kind: "Pitch",
    title: "SXSW EDU Student Impact Challenge",
    event: "SXSW EDU",
    date: "2026-10-24",
  },
  {
    id: "rirPzc-jbFg",
    kind: "Pitch",
    title: "BASK Pitch",
    event: "BASK",
    date: "2026-10-24",
  },
];

// Posts, press, and recognition.
//   type    "Press" | "Blog" | "Recognition"
//   date    "YYYY-MM-DD" or null; href: where it lives; image: a path under public/ (shown on hover)
export const POSTS = [
  { id: "example-press", type: "Press", title: "A feature about Thermyx", source: "Publication name", date: null, href: null, image: "/examples/render-exploded.webp", example: true },
  { id: "example-blog", type: "Blog", title: "A post from the build", source: "Thermyx", date: null, href: null, image: "/examples/render-heat.webp", example: true },
  { id: "example-recognition", type: "Recognition", title: "An award or recognition", source: "Who gave it", date: null, href: null, image: "/examples/render-assembled.webp", example: true },
];
