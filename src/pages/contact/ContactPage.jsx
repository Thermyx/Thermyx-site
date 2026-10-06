import "@fontsource/instrument-serif/400-italic.css";
import { ArrowRight, Check, Copy, Mail, RotateCcw } from "lucide-react";
import { AnimatePresence, motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { useId, useState } from "react";
import Magnet from "../../components/Magnet.jsx";
import TextType from "../../components/TextType.jsx";
import { CONTACT_EMAIL, SOCIALS } from "../../data/socials.js";
import { useDocumentTitle } from "../../lib/useDocumentTitle.js";
import { useMediaQuery } from "../../lib/useMediaQuery.js";
import { useReducedMotion } from "../../lib/useReducedMotion.js";
import SocialChip from "../../ui/SocialChip.jsx";
import "./contact.css";

// Messages post as JSON to VITE_CONTACT_ENDPOINT (or, failing that, the waitlist's endpoint):
// Formspree and FormSubmit both take it as-is (see the README). With neither set, sending opens
// the visitor's own email app with the card filled in, so a message is never lost.
const ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT || import.meta.env.VITE_WAITLIST_ENDPOINT;

const TOPICS = [
  { id: "hello", label: "Say hello", stamp: "Hello", color: "#2c9cf0" },
  { id: "press", label: "Press", stamp: "Press", color: "#ff9b3d" },
  { id: "partners", label: "Partnerships", stamp: "Partners", color: "#ff6a13" },
  { id: "research", label: "Research", stamp: "Research", color: "#5bd2ff" },
];
const GREETINGS = ["Dear Thermyx,", "A question about the insole:", "Hello from…", "About the app:"];
const MAX_MESSAGE = 2000;

// Contact, as a postcard: fill in the form and the card beside it writes itself (your words in
// a hand-set serif, a stamp for the topic, a postmark for today), then it's mailed off.
export default function ContactPage() {
  useDocumentTitle("Contact");
  const [fields, setFields] = useState({ topic: "hello", name: "", email: "", message: "" });
  const [status, setStatus] = useState({ state: "idle", note: "" }); // idle | sending | sent | handoff | error
  const [focus, setFocus] = useState(null);
  const set = (key) => (event) => setFields((f) => ({ ...f, [key]: event.target.value }));
  const topic = TOPICS.find((t) => t.id === fields.topic);

  async function onSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (new FormData(form).get("company")) return setStatus({ state: "sent", note: "" }); // honeypot: bots only
    const subject = `Thermyx contact · ${topic.label}`;
    if (!ENDPOINT) {
      const body = `${fields.message}\n\n${fields.name}\n${fields.email}`;
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
    setFields({ topic: fields.topic, name: "", email: "", message: "" });
    setStatus({ state: "idle", note: "" });
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
        <p className="contact__lede">Questions, press, partnerships, or research. Fill in the card; it writes itself as you go.</p>
      </header>

      <div className="contact__desk">
        <div className="contact__form-wrap">
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
              <motion.form key="form" className="contact-form" onSubmit={onSubmit} exit={{ opacity: 0, transition: { duration: 0.2 } }}>
                <fieldset className="contact-form__topics">
                  <legend className="contact-form__label">What's it about?</legend>
                  <div className="topic-row">
                    {TOPICS.map((t) => (
                      <label key={t.id} className="topic" style={{ "--topic": t.color }}>
                        <input type="radio" name="topic" value={t.id} checked={fields.topic === t.id} onChange={set("topic")} />
                        <span>{t.label}</span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <input className="contact-form__honeypot" type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                <div className="contact-form__pair">
                  <Field label="Your name" name="name" value={fields.name} onChange={set("name")} onFocus={setFocus} autoComplete="name" required />
                  <Field label="Your email" name="email" type="email" value={fields.email} onChange={set("email")} onFocus={setFocus} autoComplete="email" required />
                </div>
                <Field
                  label="Message"
                  name="message"
                  multiline
                  value={fields.message}
                  onChange={set("message")}
                  onFocus={setFocus}
                  maxLength={MAX_MESSAGE}
                  required
                  hint={`${fields.message.length} / ${MAX_MESSAGE}`}
                />
                <div className="contact-form__send">
                  <Magnet padding={50} magnetStrength={6}>
                    <button type="submit" className="contact-form__submit" disabled={status.state === "sending"}>
                      {status.state === "sending" ? "Mailing…" : "Mail the card"}
                      <ArrowRight size={18} aria-hidden="true" />
                    </button>
                  </Magnet>
                  <p className="contact-form__status" role="status" data-state={status.state}>
                    {status.note}
                  </p>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <Postcard fields={fields} topic={topic} focus={focus} sent={sent} />
      </div>

      <section className="contact__elsewhere" aria-labelledby="elsewhere-title">
        <div className="contact__elsewhere-head">
          <h2 id="elsewhere-title">Or find us</h2>
          <EmailLine />
        </div>
        <ul className="contact__stamps">
          {SOCIALS.filter((s) => s.id !== "email").map((social) => (
            <li key={social.id}>
              <SocialChip social={social} size="loop" />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Field({ label, name, multiline = false, hint, onFocus, ...input }) {
  const id = useId();
  const Control = multiline ? "textarea" : "input";
  return (
    <div className="field" data-multiline={multiline || undefined}>
      <label className="contact-form__label" htmlFor={id}>
        {label}
      </label>
      <Control id={id} name={name} className="field__control" rows={multiline ? 6 : undefined} onFocus={() => onFocus(name)} onBlur={() => onFocus(null)} {...input} />
      {hint && (
        <span className="field__hint mono" aria-hidden="true">
          {hint}
        </span>
      )}
    </div>
  );
}

// The address, with a copy button.
function EmailLine() {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard blocked: the address is on screen to select.
    }
  };
  return (
    <p className="email-line">
      <a href={`mailto:${CONTACT_EMAIL}`}>
        <Mail size={16} aria-hidden="true" />
        {CONTACT_EMAIL}
      </a>
      <button type="button" onClick={copy} aria-label="Copy the email address">
        {copied ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
      </button>
      <span className="visually-hidden" role="status">
        {copied ? "Email address copied" : ""}
      </span>
    </p>
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
            <p data-focus={focus === "name" || undefined}>
              <span>From</span> {fields.name || "…"}
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
