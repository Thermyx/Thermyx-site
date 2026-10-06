// The Validation page: test plans, bench and field results, photos, and notes, laid out in a
// masonry grid. Clicking an entry opens its card with the detail and links. Every entry below is
// an EXAMPLE (a template showing each kind of tile); replace them as real entries exist.
// Images are renders of the Prototype 1 CAD and the app from this site.
//   type     "image" | "text" (a test) | "note" (a quote) | "metric" (one result) | "photo" (a
//            photo still to come)
//   tag      one of VALIDATION_TAGS' ids (the pills)
//   aspect   the tile's height ÷ width
//   status   "Planned" | "In progress" | "Done" (text and metric tiles)
//   detail   what the card says: paragraphs, things recorded, and links
export const VALIDATION_TAGS = [
  { id: "bench", label: "Bench" },
  { id: "field", label: "Field" },
  { id: "firmware", label: "Firmware" },
  { id: "app", label: "App" },
];

const SAFETY = { label: "The limits, on the home page", href: "/#safety" };
const MODEL = { label: "Explore Prototype 1 in 3D", href: "/#explore" };
const APP = { label: "The app", href: "/app" };
const REPO = { label: "The app's code on GitHub", href: "https://github.com/Thermyx/Thermyx" };

export const VALIDATION_ITEMS = [
  {
    id: "exploded",
    type: "image",
    tag: "bench",
    title: "Prototype 1, taken apart",
    img: "/examples/render-exploded.webp",
    aspect: 0.76,
    detail: {
      body: ["The full assembly from the CAD: the insole and its power pack, 20 bodies in all. A photo of the built prototype would sit here."],
      links: [MODEL],
    },
  },
  {
    id: "burn-limit",
    type: "text",
    tag: "firmware",
    title: "Burn-limit check",
    body: "Warm the foot-contact sensor toward 40 °C and confirm heating stops there, resuming only below 38.5 °C.",
    status: "Planned",
    aspect: 0.95,
    detail: {
      body: ["The firmware never heats at or above 40 °C foot contact, whatever the app sends. This test would show it holding on the bench."],
      records: ["Contact temperature at cutoff", "Temperature where heating resumes", "Time from cutoff to output off"],
      links: [SAFETY],
    },
  },
  {
    id: "heat-path",
    type: "image",
    tag: "bench",
    title: "The heat path",
    img: "/examples/render-heat.webp",
    aspect: 0.875,
    detail: {
      body: ["Peltier module, driver, heat sink, and fan, lit in the CAD. Thermal images from the bench would go here."],
      links: [MODEL],
    },
  },
  {
    id: "field-note",
    type: "note",
    tag: "field",
    title: "Field note",
    quote: "Who wore it, where, for how long, and what they noticed. One note per session.",
    aspect: 0.82,
    detail: {
      body: ["Field notes from supervised sessions would go here, each with its date and conditions, and nothing from the wearer that they haven't agreed to share."],
      links: [],
    },
  },
  {
    id: "app-safety",
    type: "image",
    tag: "app",
    title: "The Safety tab",
    img: "/examples/render-app-safety.webp",
    aspect: 1.44,
    detail: {
      body: ["A preview of the app's Safety tab. Screen recordings from testing would replace it."],
      links: [APP, REPO],
    },
  },
  {
    id: "ble-range",
    type: "metric",
    tag: "app",
    title: "Bluetooth range",
    value: "—",
    caption: "Result pending",
    status: "Planned",
    aspect: 0.88,
    detail: {
      body: ["How far the phone can be from each insole before the link drops, indoors and out. A metric tile shows one number once there is one, never before."],
      records: ["Distance at first dropped reading", "Time to reconnect"],
      links: [APP],
    },
  },
  {
    id: "field-photo",
    type: "photo",
    tag: "field",
    title: "Field photo",
    aspect: 1.15,
    detail: {
      body: ["A photo from a field session would sit here, with a caption on where and when it was taken."],
      links: [],
    },
  },
  {
    id: "watchdog",
    type: "text",
    tag: "firmware",
    title: "Watchdog restart",
    body: "Hang the control loop on purpose and confirm the chip restarts within 4 seconds with every output off.",
    status: "Planned",
    aspect: 0.9,
    detail: {
      body: ["The firmware's 4-second watchdog restarts the chip with every output off if the control loop ever hangs."],
      records: ["Time from hang to restart", "Output state after restart"],
      links: [SAFETY],
    },
  },
  {
    id: "sensors",
    type: "image",
    tag: "bench",
    title: "The sensors",
    img: "/examples/render-sense.webp",
    aspect: 0.875,
    detail: {
      body: ["Three force sensors, the foot-contact temperature sensor, and the motion sensor, lit in the CAD."],
      links: [MODEL],
    },
  },
  {
    id: "stale-data",
    type: "text",
    tag: "app",
    title: "Stale-data clearing",
    body: "Stop an insole's telemetry while it stays connected; after 5 seconds the app should clear its readings.",
    status: "Planned",
    aspect: 0.9,
    detail: {
      body: ["An insole that stays connected but stops sending for 5 seconds has its readings cleared, so nothing frozen looks live."],
      records: ["Seconds until the readings clear", "What the screen shows instead"],
      links: [APP, REPO],
    },
  },
  {
    id: "power",
    type: "image",
    tag: "bench",
    title: "The power pack",
    img: "/examples/render-power.webp",
    aspect: 0.875,
    detail: {
      body: ["The external pack: battery in its removable bay, heat sink, and fan."],
      links: [MODEL],
    },
  },
  {
    id: "lab-photo",
    type: "photo",
    tag: "bench",
    title: "Bench photo",
    aspect: 0.9,
    detail: {
      body: ["A photo of the bench setup would sit here."],
      links: [],
    },
  },
  {
    id: "app-home",
    type: "image",
    tag: "app",
    title: "The Home tab",
    img: "/examples/render-app-home.webp",
    aspect: 1.44,
    detail: {
      body: ["A preview of the app's Home tab: both soles side by side, with skeletons where live readings go."],
      links: [APP],
    },
  },
  {
    id: "cooling-floor",
    type: "text",
    tag: "firmware",
    title: "Cooling floor",
    body: "Cool the foot-contact sensor toward 15 °C and confirm cooling stops there.",
    status: "Planned",
    aspect: 0.8,
    detail: {
      body: ["The firmware never cools at or below 15 °C foot contact."],
      records: ["Contact temperature at cutoff"],
      links: [SAFETY],
    },
  },
];
