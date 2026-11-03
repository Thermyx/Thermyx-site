import { ArrowUpRight, BellRing, CircleSlash, HandHelping, HeartPulse, LayoutGrid, Link2, MessageCircleQuestion, Newspaper, ShieldCheck, Thermometer, Trash2, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Link } from "react-router-dom";
import AnimatedContent from "../components/AnimatedContent.jsx";
import RotatingText from "../components/RotatingText.jsx";
import SpotlightCard from "../components/SpotlightCard.jsx";
import { useReducedMotion } from "../lib/useReducedMotion.js";
import SectionHead from "../ui/SectionHead.jsx";

// Sources: the app README (navigation, safety behaviour, relay access model, Apple Health, widgets,
// Learn), ThermalControlBar.swift (one button: Auto → Cool → Heat → Off), and the firmware (Auto
// target 26 to 38 °C; fan only while cooling; 40 °C burn limit).
const MODES = [
  { name: "Auto", tone: "auto", body: "Holds the target you set beside the button, anywhere from 26 to 38 °C." },
  { name: "Cool", tone: "cool", body: "The Peltier pulls heat away from your foot, and the fan and heat sink in the power pack carry it off." },
  { name: "Heat", tone: "hot", body: "Warms your foot, and stops at 40 °C foot contact whatever you ask for." },
  { name: "Off", tone: "off", body: "The Peltier and fan stop. The insoles keep sensing and reporting." },
];

const FEATURES = [
  { icon: CircleSlash, title: "Never a made-up number", body: "When a value is missing, the screen shows an empty state, never an estimate." },
  {
    icon: MessageCircleQuestion,
    title: "Why am I seeing this?",
    body: "Every level from Caution up explains itself: the signal, its value and rule, which foot, and how old the data is.",
  },
  {
    icon: HeartPulse,
    title: "A personal baseline",
    body: "Calibrates over 10 calm minutes, then learns slowly. It can add Caution, but never lowers a level the fixed rules set.",
  },
  {
    icon: Link2,
    title: "Stays connected, never frozen",
    body: "Keeps both Bluetooth links with the screen locked, and clears an insole that stops sending for 5 seconds.",
  },
  {
    icon: Newspaper,
    title: "Learn",
    body: "Eight short reads on heat, cold, and your feet, each with its sources. The app suggests the one that fits right now.",
  },
  {
    icon: Users,
    title: "Trusted members",
    body: "People you approve see your level and how fresh it is. They can call you, but can't control your insoles.",
  },
  {
    icon: BellRing,
    title: "Alerts that escalate",
    body: "You're notified when the level rises. A critical alert offers Call 911 and “I'm OK” right away.",
  },
  {
    icon: ShieldCheck,
    title: "Apple Health, if you want it",
    body: "Off by default. Reads steps, walking steadiness, and workouts, and never writes body temperature.",
  },
  { icon: Trash2, title: "Delete my data", body: "Removes everything on the phone, and your record on the relay." },
  {
    icon: Thermometer,
    title: "Thermal Recovery Test",
    body: "From Caution up: stop, cool down, then hold still for 3 minutes while Thermyx checks whether the warmer foot is cooling.",
  },
  {
    icon: HandHelping,
    title: "Ask my circle for help",
    body: "Need water, can't walk well, come get me, or feeling unwell: help from the people you trust, without calling 911.",
  },
  {
    icon: LayoutGrid,
    title: "Widgets and Live Activity",
    body: "Both soles on the Home Screen, Lock Screen, and Dynamic Island, with Auto, Cool, Heat, and Off one press away.",
  },
];

export default function AppSection() {
  return (
    <section id="app" className="section" aria-labelledby="app-title">
      <div className="section__inner">
        <SectionHead
          index="03"
          label="The app"
          titleId="app-title"
          title="One app for both feet."
          lede="Four tabs: Home, Insights, Learn, and Safety. The thermal control sits above them on every screen: one button steps through Auto, Cool, Heat, and Off."
        />

        <div className="app-grid">
          <ModeDemo />
          <ul className="features">
            {FEATURES.map(({ icon: Icon, title, body }, i) => (
              <li key={title}>
                <AnimatedContent distance={36} duration={0.7} delay={(i % 3) * 0.06} ease="power3.out" threshold={0.15}>
                  <SpotlightCard className="feature" spotlightColor="rgb(91 210 255 / 0.12)">
                    <Icon className="feature__icon" size={20} strokeWidth={1.75} aria-hidden="true" />
                    <h3 className="feature__title">{title}</h3>
                    <p className="feature__body">{body}</p>
                  </SpotlightCard>
                </AnimatedContent>
              </li>
            ))}
          </ul>
        </div>

        <Link to="/app" className="text-link">
          More about the app
          <ArrowUpRight size={16} aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}

// The thermal control's four settings, in the order one tap steps through them, with the headline word.
function ModeDemo() {
  const reducedMotion = useReducedMotion();
  const [index, setIndex] = useState(0);
  const mode = MODES[index];

  return (
    <SpotlightCard className="tile mode-demo" spotlightColor="rgb(255 106 19 / 0.12)">
      <p className="tile__kicker eyebrow">The thermal control · tap to step, hold for the list</p>
      <p className="mode-demo__headline">
        Set it to{" "}
        <RotatingText
          texts={MODES.map((m) => m.name)}
          mainClassName="mode-demo__word"
          elementLevelClassName="mode-demo__char"
          data-tone={mode.tone}
          staggerFrom="first"
          staggerDuration={0.025}
          rotationInterval={2600}
          auto={!reducedMotion}
          transition={{ type: "spring", damping: 26, stiffness: 320 }}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-110%", opacity: 0 }}
          onNext={setIndex}
        />
        .
      </p>
      <div className="control-bar" role="presentation">
        {MODES.map((m, i) => (
          <span key={m.name} className="control-bar__segment" data-active={i === index || undefined} data-tone={m.tone}>
            {i === index && <motion.span layoutId="control-bar-thumb" className="control-bar__thumb" transition={{ type: "spring", stiffness: 420, damping: 36 }} />}
            <span className="control-bar__label">{m.name}</span>
          </span>
        ))}
      </div>
      <p className="mode-demo__body">
        <strong>{mode.name}.</strong> {mode.body}
      </p>
      <p className="mode-demo__note">Taps reach the insoles only once you stop tapping, so stepping past Heat never sends heat. Watchers get no control at all.</p>
    </SpotlightCard>
  );
}
