// The team: five cards in a ring. Every entry here is an EXAMPLE; replace each field, and add a
// photo as `photo: "/team/first-last.png"` (a portrait with a transparent background suits the
// card best: it stands in front of the holographic finish). Until then the card shows a skeleton.
// The back of each card holds everything below; it scrolls if there's a lot.
//   name, role      the front of the card
//   bio             paragraphs
//   focus           what they work on (chips)
//   background      [label, value] pairs (studies, before Thermyx, ...)
//   links           [{ label, href }] (LinkedIn, email, a site)
const BIO = [
  "A paragraph on who they are and what they own at Thermyx: the part of the insole, the firmware, or the app that is theirs.",
  "A second paragraph on how they came to it, what they did before, and what they want Thermyx to become.",
];
const BACKGROUND = [
  ["Studies", "School, program, year"],
  ["Before Thermyx", "A line on previous work"],
  ["Based in", "City"],
];

export const TEAM = [
  { id: "one", name: "Member One", role: "Hardware", photo: null, bio: BIO, focus: ["Insole", "Power pack", "CAD"], background: BACKGROUND, links: [], example: true },
  { id: "two", name: "Member Two", role: "Firmware", photo: null, bio: BIO, focus: ["ESP32-C3", "Safety limits", "Bluetooth"], background: BACKGROUND, links: [], example: true },
  { id: "three", name: "Member Three", role: "iOS app", photo: null, bio: BIO, focus: ["SwiftUI", "Risk engine", "Alerts"], background: BACKGROUND, links: [], example: true },
  { id: "four", name: "Member Four", role: "Design", photo: null, bio: BIO, focus: ["Brand", "Site", "App design"], background: BACKGROUND, links: [], example: true },
  { id: "five", name: "Member Five", role: "Research", photo: null, bio: BIO, focus: ["Heat stress", "Field evaluation", "Sources"], background: BACKGROUND, links: [], example: true },
];
