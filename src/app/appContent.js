// Copy for the app page. Facts only, from the app repo (~/VSProjects/Thermyx, github.com/Thermyx/Thermyx):
// README.md, ThermyxApp/Models/ThermyxRisk.swift (levels, ladder, heat lockout),
// ThermyxApp/Views (tab names, screen labels, onboarding), project.yml (iOS 17), and the firmware
// (Auto target 26 to 38 °C, 40 °C burn limit).

// The page's opening facts.
export const HERO_FACTS = [
  ["Roles", "Wearer or watcher"],
  ["Pairs", "Left, right, or both"],
  ["Apple Health", "Optional, off by default"],
];

// The tour: one panel per part of the app, each with the phone screen it shows.
export const TOUR = [
  {
    id: "home",
    screen: "home",
    tab: "Home",
    title: ["Both feet,", "side by side."],
    body: "Each insole gets its own sole on screen, inner edges facing, with its own zone readouts and its own history. One connected and one not is a normal state: the missing foot shrinks to a tab at the edge, one tap from pairing.",
    chips: ["Ambient", "Forefoot load", "L–R gap", "Steadiness"],
    note: "No value from one foot is ever shown for the other.",
  },
  {
    id: "insights",
    screen: "insights",
    tab: "Insights",
    title: ["History that", "waits for data."],
    body: "Readings fold into minute buckets kept for 7 days and hour buckets kept for 180. A chart needs at least three before it draws anything, so a trend is never a line through two points. Temperature, movement, and balance each get a closer look, with steps and workouts from Apple Health alongside if you turn it on.",
    chips: ["Day · Week · Month", "Temperature", "Movement", "Balance", "Learning center"],
    note: "Below three buckets, the chart shows an empty state instead.",
  },
  {
    id: "safety",
    screen: "safety",
    tab: "Safety",
    title: ["Four levels,", "each one explained."],
    body: "Normal, Caution, High risk, Critical. Every level from Caution up says why: each signal with its value and rule, which foot, how old the data is, a confidence rating, and the next step. From High risk up, heating is locked out.",
    chips: ["Escalation ladder", "SOS", "Trusted circle", "Advanced"],
    note: "Critical opens a full-screen alert with Call 911 and I'm OK.",
  },
  {
    id: "watch",
    screen: "watch",
    tab: "For watchers",
    title: ["For the people", "watching out."],
    body: "Choose “I'm watching someone” and the app becomes Watch, Insights, and Settings: the wearer's current level, how fresh it is, and a way to call. A heartbeat every minute means a quiet phone shows as “No update for N min”, never as all clear.",
    chips: ["Watch", "Insights", "Settings"],
    note: "Watchers can see and call. They can't control someone else's insoles.",
  },
];

// The thermal control bar's modes.
export const MODES = [
  { name: "Cool", tone: "cool", body: "The Peltier pulls heat away from your foot, and the fan and heat sink in the power pack carry it off." },
  { name: "Auto", tone: "auto", body: "Holds the target you set, anywhere from 26 to 38 °C." },
  { name: "Heat", tone: "hot", body: "Warms your foot, and stops at 40 °C foot contact whatever you ask for." },
];

export const CONTROL_FACTS = [
  "Above Home, Insights, Safety, and Advanced. Screens with charts drop it, so the charts get the height.",
  "Heating is locked out from High risk up. A heat-strained wearer can't command more heat.",
  "Watchers get no control bar at all.",
];

// The pair, as the app draws it (README, "Thermyx is a pair").
export const PAIR_STATES = [
  {
    id: "both",
    title: "Both connected",
    body: "Equal soles side by side, inner edges facing, each with its own zone readouts and its own history.",
  },
  {
    id: "one",
    title: "One connected",
    body: "The live foot keeps the space it needs. The missing one shrinks to a tab at the screen's edge, still tappable, one tap or a pull inward from pairing.",
  },
  {
    id: "none",
    title: "Neither",
    body: "Both soles at equal size under a single pairing prompt. No numbers until there is something to measure.",
  },
];

export const PAIR_GAPS = [
  ["Temperature gap", "How far apart your feet run, over time."],
  ["Load gap", "Forefoot share, in percentage points."],
  ["Gait-stability gap", "Whether one foot's steps are less steady."],
];

// The escalation ladder (ThermyxRisk.swift): each level's name and tint, what the app does at it
// (ladderDetail), and what it tells the wearer (explanation).
export const LADDER = [
  { level: "Normal", tone: "ice", action: "Monitoring quietly.", detail: "No abnormal pattern detected from the available signals." },
  { level: "Caution", tone: "amber", action: "Notify you on the phone.", detail: "Conditions or movement patterns deserve attention." },
  { level: "High risk", tone: "ember", action: "Stop, hydrate, cool down. Trusted circle notified.", detail: "Pause, hydrate, and move to a cooler environment." },
  { level: "Critical", tone: "ember", action: "Full-screen alert and emergency actions.", detail: "Stop activity and seek immediate help." },
];

// What "Why am I seeing this?" shows for every level from Caution up (README).
export const EXPLAIN = ["Each signal, with its value and rule", "Which foot", "How old the data is", "A confidence rating", "The next step"];

// Privacy, people, and trying it out (README: safety behaviour, relay access model, Apple Health,
// simulated insoles).
export const TRUST = [
  {
    icon: "users",
    title: "A circle you choose",
    body: "Watchers join with a one-time invite, see nothing until you approve them, and lose access after 90 days unless you renew. Remove anyone in one tap.",
  },
  {
    icon: "phone",
    title: "Readings stay on the phone",
    body: "The shared relay receives escalated risk events only. Location goes with your consent, only during a High, Critical, or SOS event, and expires after an hour.",
  },
  {
    icon: "list",
    title: "What leaves your phone?",
    body: "A screen under Advanced lists exactly what is shared, and Delete my data removes everything on the phone and your record on the relay.",
  },
  {
    icon: "health",
    title: "Apple Health, if you want it",
    body: "Off by default. Reads steps, walking steadiness, and workouts, and saves sessions as workouts. It never writes a body temperature: the insole measures contact temperature, not core.",
  },
  {
    icon: "baseline",
    title: "A personal baseline",
    body: "Calibrates over 10 calm minutes, then learns slowly. It can add Caution, but never lowers a level the fixed rules set, and never goes past Caution on its own.",
  },
  {
    icon: "demo",
    title: "Demo Mode",
    body: "Try the whole app without an insole: a simulated pair you can cool, heat, and walk up the risk ladder. Every screen says “Simulated — not live sensor data”, and nothing is saved or sent.",
  },
];
