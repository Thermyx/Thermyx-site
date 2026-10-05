import { Menu, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import StarBorder from "../components/StarBorder.jsx";
import { useMediaQuery } from "../lib/useMediaQuery.js";
import { useReducedMotion } from "../lib/useReducedMotion.js";
import { PAGES, WAITLIST_HREF } from "./pages.js";
import "./Header.css";

// The glass header over every page: the wordmark (home), the pages, and Join waitlist. Below the
// desktop breakpoint the pages move into a full-height menu.
export default function Header() {
  const [hovered, setHovered] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const scrolled = useScrolled();
  const desktop = useMediaQuery("(min-width: 920px)");
  const location = useLocation();

  // Navigating closes the menu (the pathname and hash change together on a link press).
  const [lastLocation, setLastLocation] = useState(location.key);
  if (location.key !== lastLocation) {
    setLastLocation(location.key);
    setMenuOpen(false);
  }
  const open = menuOpen && !desktop;

  return (
    <header className="site-header" data-scrolled={scrolled || open || undefined}>
      <div className="site-header__bar">
        <Link to="/" className="site-header__brand" aria-label="Thermyx home">
          <img src="/brand/thermyx-logo-light.png" alt="" width="2004" height="567" decoding="async" />
        </Link>

        <nav className="site-nav" aria-label="Main" onPointerLeave={() => setHovered(null)}>
          {PAGES.map(({ path, label }) => (
            <NavLink key={path} to={path} className="site-nav__link" onPointerEnter={() => setHovered(path)}>
              {({ isActive }) => (
                <>
                  {hovered === path && (
                    <motion.span
                      layoutId="nav-hover"
                      className="site-nav__hover"
                      transition={{ type: "spring", stiffness: 520, damping: 40 }}
                    />
                  )}
                  <span className="site-nav__label">{label}</span>
                  {isActive && <motion.span layoutId="nav-active" className="site-nav__active" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="site-header__actions">
          <StarBorder
            as={Link}
            to={WAITLIST_HREF}
            className="site-header__cta"
            color="#5bd2ff"
            speed="5s"
            backgroundColor="rgb(8 10 14 / 0.9)"
            borderColor="rgb(255 255 255 / 0.14)"
            textColor="var(--text)"
          >
            Join waitlist
          </StarBorder>
          <button
            type="button"
            className="site-header__menu-button"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setMenuOpen((value) => !value)}
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            <span className="visually-hidden">{open ? "Close menu" : "Menu"}</span>
          </button>
        </div>
      </div>

      <MobileMenu open={open} onClose={() => setMenuOpen(false)} />
    </header>
  );
}

function MobileMenu({ open, onClose }) {
  const reducedMotion = useReducedMotion();

  // Esc closes; the page underneath doesn't scroll while the menu covers it.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKeyDown);
    document.documentElement.dataset.menuOpen = "";
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      delete document.documentElement.dataset.menuOpen;
    };
  }, [open, onClose]);

  const item = {
    hidden: { opacity: 0, y: reducedMotion ? 0 : 28, filter: reducedMotion ? "none" : "blur(8px)" },
    shown: { opacity: 1, y: 0, filter: "blur(0px)" },
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.nav
          id="site-menu"
          className="site-menu"
          aria-label="Main"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.16 } }}
          transition={{ duration: 0.24 }}
        >
          <motion.ul
            className="site-menu__list"
            initial="hidden"
            animate="shown"
            transition={{ staggerChildren: reducedMotion ? 0 : 0.05, delayChildren: 0.06 }}
          >
            {[{ path: "/", label: "Home" }, ...PAGES].map(({ path, label }, i) => (
              <motion.li key={path} variants={item} transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}>
                <NavLink to={path} end className="site-menu__link">
                  <span className="mono site-menu__index">{String(i).padStart(2, "0")}</span>
                  {label}
                </NavLink>
              </motion.li>
            ))}
          </motion.ul>
          <motion.div variants={item} initial="hidden" animate="shown" transition={{ delay: 0.36, duration: 0.4 }}>
            <Link to={WAITLIST_HREF} className="button button--primary site-menu__cta">
              Join the waitlist
            </Link>
          </motion.div>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}

// Whether the page has scrolled at all (the header firms up its glass once content is under it).
function useScrolled() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return scrolled;
}
