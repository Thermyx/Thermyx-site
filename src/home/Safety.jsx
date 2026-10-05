import { motion } from "motion/react";
import SpotlightCard from "../components/SpotlightCard.jsx";
import SectionHead from "../ui/SectionHead.jsx";

// Source: firmware/thermyx_insole.ino (BURN_LIMIT_C 40, HEAT_RESUME_C 38.5, COLD_LIMIT_C 15,
// TARGET_MIN_C 26, TARGET_MAX_C 38, WATCHDOG_MS 4000) and firmware/README.md "Safety behaviour"
// (enforced in firmware, whatever the app sends).
const LIMITS = [
  { value: "40 °C", tone: "hot", title: "Heating cutoff", body: "Heating stops when foot contact reaches 40 °C, and resumes only below 38.5 °C." },
  { value: "15 °C", tone: "cool", title: "Cooling floor", body: "Cooling stops at 15 °C." },
  { value: "Fan only", tone: "plain", title: "No reading, no heat", body: "Without a foot temperature, the insole won't heat or cool. It runs the fan alone." },
  { value: "Auto", tone: "plain", title: "No unsupervised heat", body: "If the phone drops while heating, the insole falls back to Auto, without heat." },
  { value: "4 s", tone: "plain", title: "Watchdog", body: "If the control loop ever hangs, the chip restarts with every output off." },
];

export default function Safety() {
  return (
    <section id="safety" className="section" aria-labelledby="safety-title">
      <div className="section__inner">
        <SectionHead
          index="02"
          label="Safety"
          titleId="safety-title"
          title="Hard limits, built into the insole."
          lede="The firmware enforces these on its own, whatever the app sends."
        />
        <div className="safety-grid">
          <SpotlightCard className="tile envelope-tile" spotlightColor="rgb(255 106 19 / 0.12)">
            <p className="tile__kicker eyebrow">The operating envelope · foot contact temperature</p>
            <h3 className="tile__title">Between 15 and 40 °C, whatever the app sends.</h3>
            <p className="tile__text">
              The limits live in the insole's own firmware, so a dropped connection or a bad command can't push it past them.
            </p>
            <Envelope />
          </SpotlightCard>
          <ul className="limits">
            {LIMITS.map(({ value, tone, title, body }, i) => (
              <motion.li
                key={title}
                className="limit"
                data-tone={tone}
                initial={{ opacity: 0, x: 24 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                transition={{ duration: 0.6, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="limit__value">{value}</p>
                <div>
                  <h3 className="limit__title">{title}</h3>
                  <p className="limit__body">{body}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

// The firmware's temperature rules on one scale, 10 to 45 °C. A diagram of limits, not readings.
const MIN = 10;
const MAX = 45;
const at = (c) => `${((c - MIN) / (MAX - MIN)) * 100}%`;
const TICKS = [10, 15, 20, 25, 30, 35, 40, 45];

function Envelope() {
  const grow = (delay) => ({
    initial: { scaleX: 0 },
    whileInView: { scaleX: 1 },
    viewport: { once: true },
    transition: { duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] },
  });
  return (
    <figure
      className="envelope"
      role="img"
      aria-label="Scale from 10 to 45 °C. At 15 °C and below the insole won’t cool. Auto holds a target between 26 and 38 °C. At 40 °C heating stops, resuming below 38.5 °C."
    >
      <div className="envelope__track" aria-hidden="true">
        <motion.span className="envelope__zone envelope__zone--cold" style={{ left: 0, width: at(15), originX: 0 }} {...grow(0.1)} />
        <motion.span
          className="envelope__zone envelope__zone--auto"
          style={{ left: at(26), width: `calc(${at(38)} - ${at(26)})`, originX: 0 }}
          {...grow(0.35)}
        />
        <motion.span
          className="envelope__zone envelope__zone--hot"
          style={{ left: at(40), right: 0, originX: 0 }}
          {...grow(0.6)}
        />
        <span className="envelope__mark envelope__mark--resume" style={{ left: at(38.5) }} />
      </div>
      <ol className="envelope__ticks" aria-hidden="true">
        {TICKS.map((c) => (
          <li key={c} style={{ left: at(c) }}>
            {c}°
          </li>
        ))}
      </ol>
      <ul className="envelope__legend" aria-hidden="true">
        <li data-tone="cool">
          <span className="mono">≤ 15 °C</span> No cooling
        </li>
        <li data-tone="auto">
          <span className="mono">26–38 °C</span> Auto target range
        </li>
        <li data-tone="resume">
          <span className="mono">38.5 °C</span> Heating may resume below
        </li>
        <li data-tone="hot">
          <span className="mono">≥ 40 °C</span> No heating
        </li>
      </ul>
    </figure>
  );
}
