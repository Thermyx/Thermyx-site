import { ChartSpline, House, Newspaper, ShieldCheck, Users } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import BlurText from "../components/BlurText.jsx";
import { useMediaQuery } from "../lib/useMediaQuery.js";
import { useReducedMotion } from "../lib/useReducedMotion.js";
import { WAITLIST_HREF } from "../site/pages.js";
import WordRise from "../ui/WordRise.jsx";
import { HERO_FACTS, TOUR } from "./appContent.js";
import AppStoreBadge from "./AppStoreBadge.jsx";
import PhoneCanvas from "./phone/PhoneCanvas.jsx";

const TAB_ICONS = { home: House, insights: ChartSpline, learn: Newspaper, safety: ShieldCheck, watch: Users };
const STOPS = [{ id: "welcome", label: "Welcome" }, ...TOUR.map(({ id, tab }) => ({ id, label: tab }))];
const SCREEN_LABEL = {
  welcome: "the welcome screen",
  home: "the Home tab",
  insights: "the Insights tab",
  learn: "the Learn tab",
  safety: "the Safety tab",
  watch: "a watcher's Watch tab",
};
// Short facts that float beside the phone for each screen (wide screens).
const CHIPS = {
  welcome: [["iOS 17 or later", "cool"], ["Continue with Google", "hot"]],
  home: [["One Bluetooth link per foot", "cool"], ["Never averaged into one line", "hot"]],
  insights: [["7 days by the minute", "cool"], ["180 days by the hour", "hot"]],
  learn: [["8 sourced articles", "cool"], ["Picked for right now", "hot"]],
  safety: [["Heat locks out from High risk", "hot"], ["Every alert explains itself", "cool"]],
  watch: [["A heartbeat every minute", "cool"], ["Can call · can't control", "hot"]],
};
const CYCLE_MS = 4200;

// The top of the app page: the hero and a tour of the app, with the phone beside them. On wide
// screens the phone stays put while the copy scrolls, and its screen follows the panel in the
// middle of the window; on narrow ones it sits under the hero and steps through the screens by
// itself (or when a stop is tapped).
export default function AppTour() {
  const wide = useMediaQuery("(min-width: 960px)");
  const reducedMotion = useReducedMotion();
  const copyRef = useRef(null);
  const [scrolled, setScrolled] = useState("welcome");
  const [cycled, setCycled] = useState({ index: 0, held: false });

  // Wide: the panel crossing the middle of the window picks the screen.
  useEffect(() => {
    if (!wide) return;
    const panels = [...copyRef.current.querySelectorAll("[data-tour]")];
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setScrolled(entry.target.dataset.tour);
      },
      { rootMargin: "-50% 0px -50% 0px" },
    );
    panels.forEach((panel) => observer.observe(panel));
    return () => observer.disconnect();
  }, [wide]);

  // Narrow: step through the screens until someone picks one.
  useEffect(() => {
    if (wide || reducedMotion || cycled.held) return;
    const timer = setInterval(() => setCycled((c) => ({ ...c, index: (c.index + 1) % STOPS.length })), CYCLE_MS);
    return () => clearInterval(timer);
  }, [wide, reducedMotion, cycled.held]);

  const active = wide ? scrolled : STOPS[cycled.index].id;
  const goTo = (id) => {
    if (wide) {
      copyRef.current.querySelector(`[data-tour="${id}"]`)?.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
    } else {
      setCycled({ index: STOPS.findIndex((stop) => stop.id === id), held: true });
    }
  };
  const phone = <PhoneStage active={active} onPick={goTo} chips={wide} />;

  return (
    <section className="app-tour" aria-labelledby="app-title">
      <div ref={copyRef} className="app-tour__copy">
        <Hero />
        {!wide && <div className="app-tour__phone-inline">{phone}</div>}
        {TOUR.map((panel, i) => (
          <TourPanel key={panel.id} panel={panel} index={i} />
        ))}
      </div>
      {wide && <div className="app-tour__stage">{phone}</div>}
    </section>
  );
}

function Hero() {
  return (
    <div className="app-hero" data-tour="welcome">
      <div className="app-hero__id">
        <img className="app-icon" src="/brand/thermyx-app-icon-256.png" width="256" height="256" alt="" />
        <div>
          <p className="app-hero__name">Thermyx</p>
          <p className="app-hero__platform">For iPhone · iOS 17 or later</p>
        </div>
      </div>
      <h1 id="app-title" className="app-hero__title">
        <WordRise text="Climate control" stagger={0.07} duration={0.8} />
        <em className="app-hero__accent">for every step.</em>
      </h1>
      <BlurText
        text="The iPhone app for the Thermyx insoles. It keeps its own Bluetooth link to each foot, puts Cool, Auto, and Heat one tap away, and explains every alert it raises."
        className="app-hero__lede"
        animateBy="words"
        direction="bottom"
        delay={22}
        stepDuration={0.3}
      />
      <div className="app-hero__actions">
        <AppStoreBadge />
        <Link to={WAITLIST_HREF} className="button button--ghost app-hero__waitlist">
          Join the waitlist
        </Link>
      </div>
      <dl className="app-hero__facts">
        {HERO_FACTS.map(([term, value]) => (
          <div key={term}>
            <dt className="eyebrow">{term}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function TourPanel({ panel, index }) {
  const Icon = TAB_ICONS[panel.id];
  return (
    <article className="tour-panel" data-tour={panel.id} aria-labelledby={`tour-${panel.id}`}>
      <p className="tour-panel__tab">
        <span className="tour-panel__icon">
          <Icon size={17} strokeWidth={1.9} aria-hidden="true" />
        </span>
        <span className="eyebrow">{panel.tab}</span>
        <span className="mono tour-panel__index">{String(index + 1).padStart(2, "0")}</span>
      </p>
      <h2 id={`tour-${panel.id}`} className="tour-panel__title">
        <WordRise text={panel.title[0]} inView stagger={0.06} /> <WordRise as="em" text={panel.title[1]} inView delay={0.16} stagger={0.06} />
      </h2>
      <BlurText text={panel.body} className="tour-panel__body" animateBy="words" direction="bottom" delay={8} stepDuration={0.24} />
      <ul className="tour-panel__chips">
        {panel.chips.map((chip, i) => (
          <motion.li
            key={chip}
            className="mono"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -10% 0px" }}
            transition={{ duration: 0.45, delay: 0.25 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            {chip}
          </motion.li>
        ))}
      </ul>
      <p className="tour-panel__note">{panel.note}</p>
    </article>
  );
}

// The phone, the facts floating beside it, and the stops of the tour beneath (a way to jump).
function PhoneStage({ active, onPick, chips }) {
  return (
    <div className="phone-stage">
      <div className="phone-stage__glow" aria-hidden="true" />
      <PhoneCanvas screen={active} label={`A phone showing a preview of the Thermyx app: ${SCREEN_LABEL[active]}.`} />
      {chips && (
        <div className="phone-stage__chips" aria-hidden="true">
          <AnimatePresence mode="popLayout">
            {CHIPS[active].map(([text, tone], i) => (
              <motion.span
                key={`${active}-${i}`}
                className="phone-chip"
                data-slot={i}
                data-tone={tone}
                initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -10, filter: "blur(6px)", transition: { duration: 0.2 } }}
                transition={{ duration: 0.5, delay: 0.15 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              >
                {text}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      )}
      <nav className="phone-stage__stops" aria-label="App tour">
        {STOPS.map(({ id, label }) => (
          <button key={id} type="button" className="phone-stop" aria-current={id === active || undefined} onClick={() => onPick(id)}>
            {id === active && <motion.span layoutId="phone-stop" className="phone-stop__thumb" transition={{ type: "spring", stiffness: 480, damping: 38 }} />}
            <span className="phone-stop__label">{label}</span>
          </button>
        ))}
      </nav>
      <p className="phone-stage__hint" aria-hidden="true">
        Drag to turn it
      </p>
    </div>
  );
}
