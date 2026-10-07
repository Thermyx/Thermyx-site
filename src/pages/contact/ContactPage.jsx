import "@fontsource/instrument-serif/400-italic.css";
import { ArrowRight, Check, RotateCcw } from "lucide-react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useId, useRef, useState } from "react";
import Stepper, { Step } from "../../components/Stepper.jsx";
import TextType from "../../components/TextType.jsx";
import { CONTACT_EMAIL } from "../../data/socials.js";
import { useDocumentTitle } from "../../lib/useDocumentTitle.js";
import { useMediaQuery } from "../../lib/useMediaQuery.js";
import { useReducedMotion } from "../../lib/useReducedMotion.js";
import "./contact.css";

// Messages post as JSON to VITE_CONTACT_ENDPOINT (or, failing that, the waitlist's endpoint):
// Formspree and FormSubmit both take it as-is (see the README). With neither set, sending opens
// the visitor's own email app with the card filled in, so a message is never lost.
const ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT || import.meta.env.VITE_WAITLIST_ENDPOINT;

// What people write about. Each has a stamp for the postcard and a prompt for the message box.
const TOPICS = [
  { id: "hello", label: "Say hello", hint: "A question, a note, anything.", stamp: "Hello", color: "#2c9cf0", prompt: "What's on your mind?" },
  { id: "insole", label: "The insole", hint: "How it works, or how it's built.", stamp: "Insole", color: "#5bd2ff", prompt: "What would you like to know about the insole?" },
  { id: "app", label: "The app", hint: "Anything about the Thermyx app.", stamp: "App", color: "#7aa8ff", prompt: "What's your question about the app?" },
  { id: "field", label: "Field evaluation", hint: "The supervised evaluation.", stamp: "Field", color: "#4fd1a5", prompt: "What would you like to know about the field evaluation?" },
  { id: "press", label: "Press & media", hint: "Writing about, or filming, Thermyx.", stamp: "Press", color: "#ff9b3d", prompt: "Who are you writing for, and what's the story?" },
  { id: "partners", label: "Partnerships", hint: "A company, lab, or organization.", stamp: "Partners", color: "#ff6a13", prompt: "Who are you, and what do you have in mind?" },
  { id: "research", label: "Research", hint: "Studies, data, or the sources we cite.", stamp: "Research", color: "#38c3e8", prompt: "What's your research, and where might we fit?" },
  { id: "investing", label: "Investing", hint: "Backing Thermyx.", stamp: "Invest", color: "#e8c47c", prompt: "Tell us a little about you and what you invest in." },
  { id: "team", label: "Joining the team", hint: "Building this with us.", stamp: "Join us", color: "#a493ff", prompt: "What would you like to work on? Links to your work help." },
  { id: "events", label: "Schools & events", hint: "Competitions, demos, or talks.", stamp: "Events", color: "#ff7a9a", prompt: "What's the event, and when is it?" },
  { id: "feedback", label: "Feedback", hint: "On this site, or an idea.", stamp: "Feedback", color: "#9fb6ce", prompt: "What should we know?" },
  { id: "other", label: "Something else", hint: "Whatever it is.", stamp: "Hello", color: "#c9d3df", prompt: "What's on your mind?" },
];
const STEPS = ["Topic", "You", "Message"];
const GREETINGS = ["Dear Thermyx,", "A question about the insole:", "Hello from…", "About the app:"];
const MAX_MESSAGE = 2000;
const EMPTY = { name: "", email: "", organization: "", message: "" };

// Contact, as a postcard: the form (React Bits' Stepper: what it's about, who's writing, the
// message) on a solid panel, and beside it the card, which writes itself as you go (your words in
// a hand-set serif, a stamp for the topic, a postmark for today), then it's mailed off.
export default function ContactPage() {
  useDocumentTitle("Contact");
  const [fields, setFields] = useState({ topic: "hello", ...EMPTY });
  const [status, setStatus] = useState({ state: "idle", note: "" }); // idle | sending | sent | handoff | error
  const [focus, setFocus] = useState(null);
  const [round, setRound] = useState(0); // bumps on "Write another", starting the steps over
  const formRef = useRef(null);
  const stepRef = useRef(1);
  const set = (key) => (event) => setFields((f) => ({ ...f, [key]: event.target.value }));
  const topic = TOPICS.find((t) => t.id === fields.topic);

  // Hold on a step until its fields are filled in properly (the browser says what's missing).
  const checkStep = (step) => {
    const controls = formRef.current?.querySelectorAll(`[data-step="${step}"] :is(input, textarea)`) ?? [];
    for (const control of controls) {
      if (!control.checkValidity()) {
        control.reportValidity();
        return false;
      }
    }
    return true;
  };

  // A new step: put focus on its first field (or the chosen topic), once it has slid in.
  const onStepChange = (step) => {
    stepRef.current = step;
    setTimeout(() => {
      const scope = formRef.current?.querySelector(`[data-step="${step}"]`);
      (scope?.querySelector("input:checked") ?? scope?.querySelector("input, textarea"))?.focus({ preventScroll: true });
    }, 420);
  };

  // Enter in a field before the last step means "Continue". (With several fields and no submit
  // button on those steps, the browser wouldn't submit the form on Enter at all.)
  const onKeyDown = (event) => {
    if (event.key !== "Enter" || event.target.tagName !== "INPUT" || stepRef.current >= STEPS.length) return;
    event.preventDefault();
    formRef.current?.querySelector(".next-button")?.click();
  };

  async function onSubmit(event) {
    event.preventDefault();
    if (!checkStep(STEPS.length)) return;
    if (new FormData(event.currentTarget).get("company")) return setStatus({ state: "sent", note: "" }); // honeypot: bots only
    const subject = `Thermyx contact · ${topic.label}`;
    const signature = [fields.name, fields.organization].filter(Boolean).join(", ");
    if (!ENDPOINT) {
      const body = `${fields.message}\n\n${signature}\n${fields.email}`;
      window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      return setStatus({ state: "handoff", note: "Your email app should open with the card filled in. Send it from there." });
    }
    setStatus({ state: "sending", note: "" });
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ ...fields, topic: topic.label, _subject: subject, _replyto: fields.email }),
      });
      if (!response.ok) throw new Error(String(response.status));
      setStatus({ state: "sent", note: "" });
    } catch {
      setStatus({ state: "error", note: `That didn't go through. Try again, or email ${CONTACT_EMAIL}.` });
    }
  }

  const reset = () => {
    setFields({ topic: fields.topic, ...EMPTY });
    setStatus({ state: "idle", note: "" });
    stepRef.current = 1;
    setRound((r) => r + 1);
  };
  const sent = status.state === "sent";

  return (
    <div className="contact">
      <header className="contact__head">
        <p className="contact__label">
          <span className="contact__dot" aria-hidden="true" />
          Contact
        </p>
        <h1 className="contact__title">
          Write to us<span>.</span>
        </h1>
        <p className="contact__lede">
          From a hello to press, research, or joining the team. Fill in the card; it writes itself as you go.
        </p>
      </header>

      <div className="contact__desk">
        <div className="contact-panel">
          <AnimatePresence mode="wait" initial={false}>
            {sent ? (
              <motion.div
                key="sent"
                className="contact__sent"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                role="status"
              >
                <span className="contact__sent-mark" aria-hidden="true">
                  <Check size={22} />
                </span>
                <h2>Mailed{fields.name ? `, ${fields.name.split(" ")[0]}` : ""}.</h2>
                <p>Your card is in our inbox, with {fields.email || "your address"} to reply to.</p>
                <button type="button" className="button button--ghost" onClick={reset}>
                  <RotateCcw size={16} aria-hidden="true" />
                  Write another
                </button>
              </motion.div>
            ) : (
              <motion.form
                key={`form-${round}`}
                ref={formRef}
                className="contact-form"
                onSubmit={onSubmit}
                onKeyDown={onKeyDown}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
              >
                <input className="contact-form__honeypot" type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                <Stepper
                  className="contact-stepper"
                  accentColor="#5bd2ff"
                  onStepChange={onStepChange}
                  beforeNext={checkStep}
                  nextButtonText="Continue"
                  renderStepIndicator={(props) => <StepTab {...props} />}
                  completeButton={
                    <button type="submit" className="contact-form__submit" disabled={status.state === "sending"}>
                      {status.state === "sending" ? "Mailing…" : "Mail the card"}
                      <ArrowRight size={18} aria-hidden="true" />
                    </button>
                  }
                >
                  <Step>
                    <fieldset className="contact-step" data-step="1">
                      <legend className="contact-step__title">What's it about?</legend>
                      <div className="topics">
                        {TOPICS.map((t) => (
                          <label key={t.id} className="topic" style={{ "--topic": t.color }}>
                            <input type="radio" name="topic" value={t.id} checked={fields.topic === t.id} onChange={set("topic")} />
                            <span className="topic__label">{t.label}</span>
                            <span className="topic__hint">{t.hint}</span>
                          </label>
                        ))}
                      </div>
                    </fieldset>
                  </Step>
                  <Step>
                    <fieldset className="contact-step" data-step="2">
                      <legend className="contact-step__title">Who's writing?</legend>
                      <div className="contact-form__pair">
                        <Field label="Your name" name="name" value={fields.name} onChange={set("name")} onFocus={setFocus} autoComplete="name" placeholder="First and last" required />
                        <Field label="Your email" name="email" type="email" value={fields.email} onChange={set("email")} onFocus={setFocus} autoComplete="email" placeholder="you@example.com" required />
                      </div>
                      <Field
                        label="Organization"
                        optional
                        name="organization"
                        value={fields.organization}
                        onChange={set("organization")}
                        onFocus={setFocus}
                        autoComplete="organization"
                        placeholder="A school, company, publication, or lab"
                      />
                    </fieldset>
                  </Step>
                  <Step>
                    <fieldset className="contact-step" data-step="3">
                      <legend className="contact-step__title">
                        Your message <span className="contact-step__topic" style={{ "--topic": topic.color }}>{topic.label}</span>
                      </legend>
                      <Field
                        label={topic.prompt}
                        name="message"
                        multiline
                        value={fields.message}
                        onChange={set("message")}
                        onFocus={setFocus}
                        maxLength={MAX_MESSAGE}
                        required
                        hint={`${fields.message.length} / ${MAX_MESSAGE}`}
                      />
                    </fieldset>
                  </Step>
                </Stepper>
                <p className="contact-form__status" role="status" data-state={status.state}>
                  {status.note}
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <Postcard fields={fields} topic={topic} focus={focus} sent={sent} />
      </div>
    </div>
  );
}

// A step in the stepper's header: its number (a check once done) and its name. Done steps can be
// gone back to; later ones open with Continue.
function StepTab({ step, currentStep, onStepClick }) {
  const state = step === currentStep ? "active" : step < currentStep ? "done" : "todo";
  return (
    <button
      type="button"
      className="step-tab"
      data-state={state}
      disabled={step > currentStep}
      aria-current={state === "active" ? "step" : undefined}
      onClick={() => step < currentStep && onStepClick(step)}
    >
      <span className="step-tab__dot">{state === "done" ? <Check size={13} strokeWidth={3} aria-hidden="true" /> : step}</span>
      <span className="step-tab__label">{STEPS[step - 1]}</span>
    </button>
  );
}

function Field({ label, name, multiline = false, optional = false, hint, onFocus, ...input }) {
  const id = useId();
  const Control = multiline ? "textarea" : "input";
  return (
    <div className="field" data-multiline={multiline || undefined}>
      <label className="field__label" htmlFor={id}>
        {label}
        {optional && <span className="field__optional"> (optional)</span>}
      </label>
      <Control
        id={id}
        name={name}
        className="field__control"
        rows={multiline ? 7 : undefined}
        onFocus={() => onFocus(name)}
        onBlur={() => onFocus(null)}
        {...input}
      />
      {hint && (
        <span className="field__hint mono" aria-hidden="true">
          {hint}
        </span>
      )}
    </div>
  );
}

// The card itself: a preview of the form, so it's hidden from screen readers. Tilts toward the
// pointer; when mailed, it lifts and flies off.
function Postcard({ fields, topic, focus, sent }) {
  const reducedMotion = useReducedMotion();
  const finePointer = useMediaQuery("(pointer: fine)");
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateY = useSpring(useTransform(mx, [-0.5, 0.5], [-7, 7]), { stiffness: 160, damping: 18 });
  const rotateX = useSpring(useTransform(my, [-0.5, 0.5], [6, -6]), { stiffness: 160, damping: 18 });
  const tilt = finePointer && !reducedMotion;
  const today = new Date().toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();

  return (
    <div
      className="postcard-stage"
      aria-hidden="true"
      onPointerMove={(event) => {
        if (!tilt) return;
        const r = event.currentTarget.getBoundingClientRect();
        mx.set((event.clientX - r.left) / r.width - 0.5);
        my.set((event.clientY - r.top) / r.height - 0.5);
      }}
      onPointerLeave={() => {
        mx.set(0);
        my.set(0);
      }}
    >
      <motion.div
        className="postcard"
        style={{ rotateX, rotateY, "--topic": topic.color }}
        animate={sent ? { y: -220, x: 160, rotate: 14, scale: 0.7, opacity: 0 } : { y: 0, x: 0, rotate: -2.5, scale: 1, opacity: 1 }}
        transition={sent ? { duration: 0.9, ease: [0.55, 0, 0.6, 0.2] } : { type: "spring", stiffness: 120, damping: 18 }}
      >
        <div className="postcard__message">
          <p className="postcard__greeting">
            {fields.message ? (
              "Dear Thermyx,"
            ) : reducedMotion ? (
              "Dear Thermyx,"
            ) : (
              <TextType as="span" text={GREETINGS} typingSpeed={55} deletingSpeed={28} pauseDuration={1800} cursorCharacter="|" />
            )}
          </p>
          <p className="postcard__body" data-focus={focus === "message" || undefined}>
            {fields.message || <span className="postcard__placeholder">Your message appears here, as you write it.</span>}
          </p>
          <p className="postcard__sign">{fields.name ? `— ${fields.name}` : "— You"}</p>
        </div>
        <div className="postcard__divider" />
        <div className="postcard__address">
          <motion.div
            key={topic.id}
            className="postcard__stamp"
            initial={reducedMotion ? false : { scale: 1.3, rotate: -12, opacity: 0 }}
            animate={{ scale: 1, rotate: 4, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 16 }}
          >
            <img src="/app/phone-back-mark.png" alt="" />
            <span>{topic.stamp}</span>
          </motion.div>
          <svg className="postcard__postmark" viewBox="0 0 120 120">
            <defs>
              <path id="postmark-ring" d="M60 60 m-44 0 a44 44 0 1 1 88 0 a44 44 0 1 1 -88 0" />
            </defs>
            <circle cx="60" cy="60" r="52" />
            <circle cx="60" cy="60" r="36" />
            <text>
              <textPath href="#postmark-ring">THERMYX ✦ CONTACT ✦ THERMYX ✦</textPath>
            </text>
            <text x="60" y="64" textAnchor="middle" className="postcard__postmark-date">
              {today}
            </text>
          </svg>
          <svg className="postcard__waves" viewBox="0 0 160 40" preserveAspectRatio="none">
            {[8, 18, 28].map((y) => (
              <path key={y} d={`M0 ${y} q10 -6 20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0 t20 0`} />
            ))}
          </svg>
          <div className="postcard__lines">
            <p>
              <span>To</span> Thermyx
            </p>
            <p className="postcard__mono">{CONTACT_EMAIL}</p>
            <p data-focus={focus === "name" || focus === "organization" || undefined}>
              <span>From</span> {[fields.name, fields.organization].filter(Boolean).join(", ") || "…"}
            </p>
            <p className="postcard__mono" data-focus={focus === "email" || undefined}>
              {fields.email || "…"}
            </p>
          </div>
        </div>
      </motion.div>
      <AnimatePresence>
        {sent && (
          <motion.p
            className="postcard-stage__sent"
            initial={{ opacity: 0, scale: 0.6, rotate: -18 }}
            animate={{ opacity: 1, scale: 1, rotate: -10 }}
            transition={{ delay: 0.6, type: "spring", stiffness: 260, damping: 14 }}
          >
            Mailed
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
