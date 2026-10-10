// The Validation page: photos and video from building Prototype 1 (a masonry grid; any tile
// opens larger), then who has recognized Thermyx (a dropdown list).
//
// Media lives in public/validation/. Browsers can't all show iPhone HEIC photos or play MOV
// video, so the site uses web copies made from the originals ("-web.jpg", "-web.mp4").
//   type     "image" | "video"
//   src      the web copy
//   aspect   the tile's height ÷ width (the file's own shape)
//   title    a caption (shown on hover and in the opened card)
export const GALLERY = [
  { id: "demo01", type: "video", src: "/validation/demo01-web.mp4", aspect: 1280 / 720, title: "The app, connected to Prototype 1" },
  { id: "building01", type: "image", src: "/validation/building01-web.jpg", aspect: 2048 / 1536, title: "Building Prototype 1" },
  { id: "soldering01", type: "image", src: "/validation/soldering01-web.jpg", aspect: 1024 / 768, title: "Soldering the electronics" },
  { id: "soldering02", type: "image", src: "/validation/soldering02-web.jpg", aspect: 1024 / 768, title: "Soldering the electronics" },
];

// Recognitions, in order. `placeholder: true` rows hold the place until there's another.
export const RECOGNITIONS = [
  {
    id: "siteguardian",
    name: "SiteGuardian",
    logo: "/validation/siteguardian_logo.jpeg",
    cover: "/validation/siteguardian_cover.jpeg",
    tagline: "Plug-and-play monitoring for operations caught in the middle.",
    people: [["CEO", "Jeffrey Johnston"]],
    intro:
      "SiteGuardian is a plug-and-play monitoring platform for operations caught in the middle: too big to wing it, too small for a full supervisory control and data acquisition build-out.",
    sections: [
      {
        title: "How it works",
        text: "Wireless, battery-powered sensors connect over Wi-Fi and report to one dashboard. Install in minutes: no rewiring, no specialist crews.",
      },
      {
        title: "What it monitors",
        chips: [
          "Air temperature & humidity",
          "Pressure",
          "Smoke & vape detection, including THC",
          "Ambient noise levels",
          "Thermocouple temperature",
          "Hazardous gas",
          "Air quality",
        ],
      },
      {
        title: "Privacy by design",
        text: "It monitors environments, not people: no conversations, no images or video, no location tracking. Device-level end-to-end encryption comes standard, so data stays safe and teams never feel watched.",
      },
      {
        title: "Who it's built for",
        text: "Facilities with 3–50 employees, cold storage, warehouses, commercial kitchens, manufacturers, and climate-controlled spaces.",
      },
      {
        title: "The outcomes that matter",
        list: [
          "Catch problems before they cause downtime",
          "Cut energy and maintenance waste you didn't know existed",
          "Prove compliance when auditors come calling",
        ],
      },
      {
        title: "Start free",
        text: "Every purchase comes with three months of the premium service: full access to the online dashboard to remotely manage how a SiteGuardian system behaves. After that it's $5 USD per month, per device, and two free modes of operation keep the basic features with no fees.",
      },
    ],
    motto: "Because oversight should not feel like overwork.",
    links: [
      { label: "siteguardian.us", href: "https://www.siteguardian.us/", primary: true },
      { label: "LinkedIn", href: "https://www.linkedin.com/company/siteguardian/" },
      { label: "YouTube", href: "https://www.youtube.com/@SiteGuardian-US" },
      { label: "Email", href: "mailto:support@siteguardian.us" },
    ],
  },
  { id: "placeholder-1", placeholder: true, name: "Placeholder", tagline: "Another recognition will go here." },
  { id: "placeholder-2", placeholder: true, name: "Placeholder", tagline: "Another recognition will go here." },
];
