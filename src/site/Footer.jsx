import { Link } from "react-router-dom";
import { CONTACT_EMAIL } from "../data/socials.js";
import SocialLoop from "../ui/SocialLoop.jsx";
import { PAGES, WAITLIST_HREF } from "./pages.js";

// Source for the note: the app README, "Prototype 1 deployment checklist".
const EXPLORE = [
  { href: "/#inside", label: "Inside the insole" },
  { href: "/#pair", label: "The pair" },
  { href: "/#app", label: "The app" },
  { href: "/#safety", label: "Safety" },
  { href: WAITLIST_HREF, label: "Waitlist" },
];

export default function Footer() {
  return (
    <footer className="site-footer">
      <section className="site-footer__follow" aria-labelledby="follow-title">
        <div className="site-footer__follow-head">
          <h2 id="follow-title" className="site-footer__follow-title">
            Follow the build<span aria-hidden="true">.</span>
          </h2>
          <p className="site-footer__follow-note">Videos, photos, and news, as they happen.</p>
        </div>
        <SocialLoop />
      </section>
      <div className="site-footer__inner">
        <div className="site-footer__brand">
          <img src="/brand/thermyx-badge.png" alt="" width="478" height="476" loading="lazy" decoding="async" />
          <p className="site-footer__tagline">Climate control for your feet.</p>
          <a className="site-footer__email" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
        </div>
        <nav className="site-footer__nav" aria-label="Footer">
          <div>
            <p className="eyebrow">Product</p>
            <ul>
              {EXPLORE.map(({ href, label }) => (
                <li key={href}>
                  <Link to={href}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow">Thermyx</p>
            <ul>
              {PAGES.map(({ path, label }) => (
                <li key={path}>
                  <Link to={path}>{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>
      <p className="site-footer__wordmark" aria-hidden="true">
        Thermyx
      </p>
      <div className="site-footer__legal">
        <p>
          Thermyx is an investigational prototype in supervised field evaluation. It is not a medical device and is not
          for emergency use.
        </p>
        <p>© {new Date().getFullYear()} Thermyx</p>
      </div>
    </footer>
  );
}
