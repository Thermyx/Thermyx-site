import { Activity, ArrowUpRight, Check, FlameKindling, FlaskConical, HeartPulse, ListChecks, Smartphone, UserRoundCheck } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AnimatedContent from "../components/AnimatedContent.jsx";
import ScrollReveal from "../components/ScrollReveal.jsx";
import SpotlightCard from "../components/SpotlightCard.jsx";
import { useReducedMotion } from "../lib/useReducedMotion.js";
import { WAITLIST_HREF } from "../site/pages.js";
import WordRise from "../ui/WordRise.jsx";
import AppHead from "./AppHead.jsx";
import { CONTROL_FACTS, EXPLAIN, LADDER, MODES, PAIR_GAPS, PAIR_STATES, TRUST } from "./appContent.js";
import AppStoreBadge from "./AppStoreBadge.jsx";

const EASE = [0.22, 1, 0.36, 1];
const SPOT = "rgb(44 156 240 / 0.12)";

// ── 01 The control bar ──────────────────────────────────────────────────────

export function ControlSection() {
  return (
    <section className="app-section" aria-labelledby="control-title">
      <div className="app-section__inner">
        <AppHead
          index="01"
          label="The control bar"
          titleId="control-title"
          title={["Cool, Auto, Heat.", "One tap away."]}
          lede="The thermal control bar sits right above the tabs, so changing what your feet feel never takes more than a tap."
        />
        <div className="control-grid">
          <ControlBarDemo />
          <ul className="control-facts">
            {CONTROL_FACTS.map((fact, i) => (
              <motion.li
                key={fact}
                initial={{ opacity: 0, x: 18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                transition={{ duration: 0.55, delay: i * 0.08, ease: EASE }}
              >
                <span className="control-facts__mark" aria-hidden="true">
                  <Check size={15} strokeWidth={2.4} />
                </span>
                {fact}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// The bar as the app draws it. It steps through the modes on its own until you pick one.
function ControlBarDemo() {
  const reducedMotion = useReducedMotion();
  const [state, setState] = useState({ index: 1, held: false });
  useEffect(() => {
    if (reducedMotion || state.held) return;
    const timer = setInterval(() => setState((s) => ({ ...s, index: (s.index + 1) % MODES.length })), 2800);
    return () => clearInterval(timer);
  }, [reducedMotion, state.held]);
  const mode = MODES[state.index];

  return (
    <div className="control-demo" data-tone={mode.tone}>
      <div className="control-demo__glow" aria-hidden="true" />
      <p className="control-demo__kicker">Thermal control</p>
      <p className="control-demo__word" aria-hidden="true">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={mode.name}
            initial={{ y: "70%", opacity: 0, filter: "blur(8px)" }}
            animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
            exit={{ y: "-60%", opacity: 0, filter: "blur(8px)", transition: { duration: 0.18 } }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            {mode.name}.
          </motion.span>
        </AnimatePresence>
      </p>
      <div className="control-bar-app" role="group" aria-label="Thermal mode (a demo of the app's control bar)">
        {MODES.map((m, i) => (
          <button
            key={m.name}
            type="button"
            className="control-bar-app__segment"
            aria-pressed={i === state.index}
            data-tone={m.tone}
            onClick={() => setState({ index: i, held: true })}
          >
            {i === state.index && (
              <motion.span layoutId="control-bar-app-thumb" className="control-bar-app__thumb" transition={{ type: "spring", stiffness: 460, damping: 36 }} />
            )}
            <span className="control-bar-app__label">{m.name}</span>
          </button>
        ))}
      </div>
      <p className="control-demo__body" aria-live="polite">
        {mode.body}
      </p>
    </div>
  );
}

// ── 02 The pair ─────────────────────────────────────────────────────────────

export function PairSection() {
  return (
    <section className="app-section" aria-labelledby="pair-title">
      <div className="app-section__inner">
        <AppHead
          index="02"
          label="The pair"
          titleId="pair-title"
          title={["Made for two feet.", "Fine with one."]}
          lede="The app holds a separate link to each insole and shows whatever it has. One connected and one not is an ordinary state, not an error."
        />
        <div className="pair-states">
          {PAIR_STATES.map((state, i) => (
            <AnimatedContent key={state.id} distance={40} duration={0.8} delay={i * 0.08} threshold={0.15}>
              <SpotlightCard className="app-tile pair-state" spotlightColor={SPOT}>
                <PairDiagram state={state.id} />
                <h3 className="app-tile__title">{state.title}</h3>
                <p className="app-tile__text">{state.body}</p>
              </SpotlightCard>
            </AnimatedContent>
          ))}
          <SpotlightCard className="app-tile pair-gaps" spotlightColor={SPOT}>
            <div className="pair-gaps__lead">
              <p className="eyebrow">What two make possible</p>
              <h3 className="app-tile__title app-tile__title--serif">
                Your feet, compared with <em>each other.</em>
              </h3>
              <p className="app-tile__text">
                A gap that holds for two minutes raises a caution on its own. Shorter ones are ordinary walking noise, and are
                ignored. No chart averages the two feet into one line.
              </p>
            </div>
            <ul className="pair-gaps__list">
              {PAIR_GAPS.map(([title, body]) => (
                <li key={title}>
                  <span className="mono pair-gaps__tag" aria-hidden="true">
                    L ⇄ R
                  </span>
                  <div>
                    <p className="pair-gaps__title">{title}</p>
                    <p className="pair-gaps__body">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}

const SOLE =
  "M50 256C31 256 22 241 22 216C22 188 18 160 14 128C10 98 7 74 10 52C14 24 34 4 60 4C82 4 95 22 94 48C93 74 84 96 78 118C72 140 71 162 75 186C79 210 75 256 50 256Z";

// The three pairing states as the app lays them out (no readings: zones are just marked).
function PairDiagram({ state }) {
  const sole = (x, mirrored, kind) => (
    <g transform={`translate(${x} 18) ${mirrored ? "translate(100 0) scale(-1 1)" : ""}`}>
      <path d={SOLE} className={`pair-diagram__sole pair-diagram__sole--${kind}`} />
      {kind === "live" &&
        [
          [60, 64],
          [37, 148],
          [49, 218],
        ].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="9" className={`pair-diagram__zone pair-diagram__zone--${i === 2 ? "hot" : "cool"}`} />)}
    </g>
  );
  return (
    <svg className="pair-diagram" viewBox="0 0 320 300" aria-hidden="true">
      {state === "both" && (
        <>
          {sole(48, false, "live")}
          {sole(172, true, "live")}
        </>
      )}
      {state === "one" && (
        <>
          {sole(110, false, "live")}
          <rect x="268" y="110" width="44" height="74" rx="14" className="pair-diagram__tab" />
          <text x="290" y="142" className="pair-diagram__tab-label" textAnchor="middle">
            R
          </text>
          <path d="M283 160h14M290 153v14" className="pair-diagram__plus" />
        </>
      )}
      {state === "none" && (
        <>
          {sole(48, false, "empty")}
          {sole(172, true, "empty")}
          <rect x="40" y="124" width="240" height="48" rx="24" className="pair-diagram__prompt" />
          <text x="160" y="154" className="pair-diagram__prompt-label" textAnchor="middle">
            No insoles connected
          </text>
        </>
      )}
    </svg>
  );
}

// ── 03 Safety ───────────────────────────────────────────────────────────────

export function SafetySection() {
  return (
    <section className="app-section" aria-labelledby="safety-title">
      <div className="app-section__inner">
        <AppHead
          index="03"
          label="Safety"
          titleId="safety-title"
          title={["From Normal to Critical,", "one step at a time."]}
          lede="Four levels, each with its own instruction. The app keeps both links alive with the screen locked, and clears any insole that goes quiet for 5 seconds, so nothing frozen ever looks live."
        />
        <div className="ladder" role="list">
          {LADDER.map((rung, i) => (
            <motion.div
              key={rung.level}
              role="listitem"
              className="ladder__rung"
              data-tone={rung.tone}
              style={{ "--step": i }}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "0px 0px -8% 0px" }}
              transition={{ duration: 0.7, delay: i * 0.1, ease: EASE }}
            >
              <span className="ladder__dot" aria-hidden="true" />
              <p className="ladder__level">{rung.level}</p>
              <p className="ladder__guidance">{rung.action}</p>
              <p className="ladder__detail">{rung.detail}</p>
            </motion.div>
          ))}
          <div className="ladder__lockout">
            <FlameKindling size={15} strokeWidth={2} aria-hidden="true" />
            Heating locked out from High risk up
          </div>
        </div>

        <div className="safety-tiles">
          <SpotlightCard className="app-tile explain" spotlightColor={SPOT}>
            <p className="eyebrow">Why am I seeing this?</p>
            <h3 className="app-tile__title app-tile__title--serif">
              Every alert <em>shows its work.</em>
            </h3>
            <ul className="explain__list">
              {EXPLAIN.map((item, i) => (
                <motion.li
                  key={item}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: 0.1 + i * 0.07, ease: EASE }}
                >
                  <Check size={15} strokeWidth={2.4} aria-hidden="true" />
                  {item}
                </motion.li>
              ))}
            </ul>
          </SpotlightCard>
          <div className="critical">
            <p className="critical__kicker">Critical</p>
            <p className="critical__title">Stop activity and seek immediate help.</p>
            <div className="critical__actions" aria-hidden="true">
              <span className="critical__call">Call 911</span>
              <span className="critical__ok">I'm OK</span>
            </div>
            <p className="critical__note">
              A full-screen alert, with Call 911 and I'm OK right away. Thermyx is an investigational heat-risk warning aid: it
              doesn't measure core temperature or diagnose heat illness.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── 04 Privacy and people ───────────────────────────────────────────────────

const TRUST_ICONS = {
  users: UserRoundCheck,
  phone: Smartphone,
  list: ListChecks,
  health: HeartPulse,
  baseline: Activity,
  demo: FlaskConical,
};

export function TrustSection() {
  return (
    <section className="app-section" aria-labelledby="trust-title">
      <div className="app-section__inner">
        <AppHead
          index="04"
          label="Privacy and people"
          titleId="trust-title"
          title={["Your readings stay", "on your phone."]}
          lede="Readings live on the phone. Only escalated risk events reach the people you choose, and you can see, and delete, all of it."
        />
        <ul className="trust-grid">
          {TRUST.map(({ icon, title, body }, i) => {
            const Icon = TRUST_ICONS[icon];
            return (
              <li key={title}>
                <AnimatedContent distance={36} duration={0.7} delay={(i % 3) * 0.07} threshold={0.12}>
                  <SpotlightCard className="app-tile trust-tile" spotlightColor={SPOT}>
                    <span className="trust-tile__icon" data-tone={i % 2 ? "hot" : "cool"}>
                      <Icon size={19} strokeWidth={1.8} aria-hidden="true" />
                    </span>
                    <h3 className="app-tile__title">{title}</h3>
                    <p className="app-tile__text">{body}</p>
                  </SpotlightCard>
                </AnimatedContent>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

export function AppCta() {
  return (
    <section className="app-cta" aria-labelledby="app-cta-title">
      <motion.img
        className="app-icon app-cta__icon"
        src="/brand/thermyx-app-icon-256.png"
        width="256"
        height="256"
        alt=""
        initial={{ opacity: 0, y: 30, rotate: -6, scale: 0.9 }}
        whileInView={{ opacity: 1, y: 0, rotate: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: EASE }}
      />
      <h2 id="app-cta-title" className="app-cta__title">
        <WordRise text="Thermyx" inView /> <WordRise as="em" text="for iPhone." inView delay={0.12} />
      </h2>
      <p className="app-cta__text">
        Prototype 1 is in supervised field evaluation. Join the waitlist and we'll tell you when the app is ready to download.
      </p>
      <div className="app-cta__actions">
        <AppStoreBadge />
        <Link to={WAITLIST_HREF} className="app-cta__link">
          Join the waitlist
          <ArrowUpRight size={17} aria-hidden="true" />
        </Link>
      </div>
      <p className="app-cta__fine">Requires iOS 17 or later · Not a medical device</p>
    </section>
  );
}
