// Where to find Thermyx. Handles are the accounts' own (the YouTube handle is the channel's
// @-name). `color` is each platform's brand color, used for the neon hover; TikTok and Instagram
// glow in their two-tone and gradient colors.
export const CONTACT_EMAIL = "thermyx.contact@gmail.com";

export const SOCIALS = [
  {
    id: "instagram",
    name: "Instagram",
    handle: "@thermyx.biz",
    href: "https://www.instagram.com/thermyx.biz/",
    color: "#ff2f8e",
    gradient: "linear-gradient(45deg, #feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5)",
  },
  {
    id: "tiktok",
    name: "TikTok",
    handle: "@thermyx2",
    href: "https://www.tiktok.com/@thermyx2",
    color: "#25f4ee",
    accent: "#fe2c55",
  },
  {
    id: "youtube",
    name: "YouTube",
    handle: "@Thermyx.business",
    href: "https://www.youtube.com/channel/UCPdu5kEXVWh3vCo8BFEqRXQ",
    color: "#ff1f3d",
  },
  {
    id: "linkedin",
    name: "LinkedIn",
    handle: "company/thermyx",
    href: "https://www.linkedin.com/company/thermyx",
    color: "#2f8fff",
  },
  {
    id: "email",
    name: "Email",
    handle: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
    color: "#5bd2ff",
    accent: "#ff6a13",
  },
];
