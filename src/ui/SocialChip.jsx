import { ArrowUpRight, Mail } from "lucide-react";
import { FaInstagram, FaLinkedinIn, FaTiktok, FaYoutube } from "react-icons/fa6";
import "./social.css";

const ICONS = { instagram: FaInstagram, tiktok: FaTiktok, youtube: FaYoutube, linkedin: FaLinkedinIn, email: Mail };

// One channel: its mark, name, and handle. Lights up in the platform's own neon on hover or focus
// (TikTok in its cyan and pink, Instagram through its gradient). `size`: "md", "lg" (Contact), or
// "loop" (the footer band: bigger, and tinted in the platform's color even at rest). `tabIndex` -1
// keeps repeated copies out of the tab order.
export default function SocialChip({ social, size = "md", tabIndex }) {
  const Icon = ICONS[social.id];
  const external = !social.href.startsWith("mailto:");
  return (
    <a
      className="social-chip"
      data-social={social.id}
      data-size={size}
      href={social.href}
      tabIndex={tabIndex}
      {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}
      style={{
        "--brand": social.color,
        "--brand-2": social.accent ?? social.color,
        "--brand-fill": social.gradient ?? social.color,
      }}
    >
      <span className="social-chip__icon" aria-hidden="true">
        <Icon />
      </span>
      <span className="social-chip__text">
        <span className="social-chip__name">{social.name}</span>
        <span className="social-chip__handle">{social.handle}</span>
      </span>
      <ArrowUpRight className="social-chip__arrow" size={16} aria-hidden="true" />
      {external && <span className="visually-hidden"> (opens in a new tab)</span>}
    </a>
  );
}
