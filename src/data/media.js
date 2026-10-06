// The Media page has two sections:
//   Thermyx Media     our channels (from socials.js), and our posts, press, and recognition (POSTS)
//   Selected Sources  what we read, cite, and build with: research, guidance, articles, and
//                     collaborations (SOURCES)
// Add an entry to publish it (newest first). `example: true` marks a template: it shows an
// "Example" tag and isn't a link; delete those as real entries arrive.
export const MEDIA_SECTIONS = [
  { id: "thermyx", label: "Thermyx Media", blurb: "Our channels, our posts, and the press." },
  { id: "sources", label: "Selected Sources", blurb: "What we read, cite, and build with." },
];

// Channels shown as tiles, in order (ids from socials.js), with what to do there.
export const CHANNELS = [
  { id: "youtube", action: "Watch" },
  { id: "instagram", action: "Follow" },
  { id: "tiktok", action: "Follow" },
  { id: "linkedin", action: "Connect" },
];

// Posts, press, recognition, and videos.
//   type    "Press" | "Blog" | "Video" | "Recognition"
//   date    "YYYY-MM-DD" or null; href: where it lives; image: a path under public/ (shown on hover)
export const POSTS = [
  { id: "example-press", type: "Press", title: "A feature about Thermyx", source: "Publication name", date: null, href: null, image: "/examples/render-exploded.webp", example: true },
  { id: "example-blog", type: "Blog", title: "A post from the build", source: "Thermyx", date: null, href: null, image: "/examples/render-heat.webp", example: true },
  { id: "example-video", type: "Video", title: "A video from the channel", source: "YouTube", date: null, href: null, image: "/examples/render-app-home.webp", example: true },
  { id: "example-recognition", type: "Recognition", title: "An award or recognition", source: "Who gave it", date: null, href: null, image: "/examples/render-assembled.webp", example: true },
];

// Sources. The first five are real: the references the Thermyx app's Learning Center cites
// (ThermyxApp/Resources/Content/learning-articles.json), each link checked.
//   type    "Research" | "Guidance" | "Article" | "Collaboration"
//   citedIn the Learning Center article that cites it
export const SOURCES = [
  {
    id: "charkoudian-2003",
    type: "Research",
    title: "Skin blood flow in adult human thermoregulation: how it works, when it does not, and why",
    authors: "Charkoudian N.",
    venue: "Mayo Clinic Proceedings 78(5):603–612",
    year: 2003,
    href: "https://doi.org/10.4065/78.5.603",
    citedIn: "Why your feet tell you about heat strain first",
  },
  {
    id: "wms-frostbite-2024",
    type: "Research",
    title: "Wilderness Medical Society Clinical Practice Guidelines for the Prevention and Treatment of Frostbite: 2024 Update",
    authors: "McIntosh SE, et al.",
    venue: "Wilderness & Environmental Medicine 35(2):183–197",
    year: 2024,
    href: "https://doi.org/10.1177/10806032231222359",
    citedIn: "Cold feet, poor circulation, and warming safely",
  },
  {
    id: "fatigue-gait-2019",
    type: "Research",
    title: "Effects of experimentally induced fatigue on healthy older adults' gait: a systematic review",
    authors: null,
    venue: "PLOS ONE 14(12):e0226939",
    year: 2019,
    href: "https://doi.org/10.1371/journal.pone.0226939",
    citedIn: "Fatigue shows up in your gait before you feel it",
  },
  {
    id: "osha-new-workers",
    type: "Guidance",
    title: "Heat: Protecting New Workers",
    authors: "OSHA",
    venue: "osha.gov",
    year: null,
    href: "https://www.osha.gov/heat-exposure/protecting-new-workers",
    citedIn: "Hydration, shade, and the 20-minute rule",
  },
  {
    id: "osha-first-aid",
    type: "Guidance",
    title: "Heat-Related Illnesses and First Aid",
    authors: "OSHA",
    venue: "osha.gov",
    year: null,
    href: "https://www.osha.gov/heat-exposure/illness-first-aid",
    citedIn: "What Thermyx is not",
  },
  {
    id: "example-collaboration",
    type: "Collaboration",
    title: "A lab, team, or company we're working with",
    authors: "Partner name",
    venue: "What we're doing together, in a line",
    year: null,
    href: null,
    example: true,
  },
];
