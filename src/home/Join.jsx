import { ArrowRight, ArrowUpRight, Check } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import SpotlightCard from "../components/SpotlightCard.jsx";
import { PAGES } from "../site/pages.js";
import WordRise from "../ui/WordRise.jsx";

// Posts { email } as JSON to VITE_WAITLIST_ENDPOINT (Formspree-compatible). Until that is set, the
// form says sign-ups aren't connected rather than pretending to succeed.
const ENDPOINT = import.meta.env.VITE_WAITLIST_ENDPOINT;

export default function Join() {
  return (
    <section id="waitlist" className="section section--join" aria-labelledby="waitlist-title">
      <div className="section__inner join">
        <SpotlightCard className="tile waitlist" spotlightColor="rgb(91 210 255 / 0.16)">
          <p className="section-head__label">
            <span className="mono section-head__index">04</span>
            <span style={{ width: '40px', height: '1px', background: 'linear-gradient(90deg, var(--ice), var(--ember))' }} aria-hidden="true" />
            <span className="eyebrow">Waitlist</span>
          </p>
          <h2 id="waitlist-title" className="waitlist__title">
            <WordRise text="Be first to wear it." inView stagger={0.07} />
          </h2>
          <p className="waitlist__lede">
            Prototype 1 is in supervised field evaluation. Leave your email and we'll let you know when there's more to share.
          </p>
          <WaitlistForm />
        </SpotlightCard>

        <nav className="elsewhere" aria-label="More from Thermyx">
          <p className="eyebrow">More from Thermyx</p>
          <ul>
            {PAGES.map(({ path, label }, i) => (
              <li key={path}>
                <Link to={path} className="elsewhere__link">
                  <span className="mono elsewhere__index">{String(i + 1).padStart(2, "0")}</span>
                  <span className="elsewhere__label">{label}</span>
                  <ArrowUpRight className="elsewhere__arrow" size={22} strokeWidth={1.75} aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </section>
  );
}

function WaitlistForm() {
  const [state, setState] = useState({ status: "idle", message: "" });

  async function onSubmit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const email = new FormData(form).get("email");
    if (!ENDPOINT) {
      setState({ status: "error", message: "Sign-ups aren't connected yet. Please check back soon." });
      return;
    }
    setState({ status: "sending", message: "" });
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error(String(response.status));
      setState({ status: "done", message: "You're on the list. We'll email you when there's news." });
      form.reset();
    } catch {
      setState({ status: "error", message: "That didn't go through. Check your connection and try again." });
    }
  }

  return (
    <form className="waitlist__form" onSubmit={onSubmit}>
      <label className="eyebrow waitlist__label" htmlFor="waitlist-email">
        Email
      </label>
      <div className="waitlist__row">
        <input
          id="waitlist-email"
          className="waitlist__input"
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          aria-describedby="waitlist-status"
          disabled={state.status === "sending"}
        />
        <button className="button button--primary waitlist__submit" type="submit" disabled={state.status === "sending"}>
          {state.status === "sending" ? "Joining…" : "Join the waitlist"}
          {state.status === "done" ? <Check size={16} aria-hidden="true" /> : <ArrowRight size={16} aria-hidden="true" />}
        </button>
      </div>
      <p id="waitlist-status" className="waitlist__status" data-status={state.status} role="status">
        {state.message}
      </p>
    </form>
  );
}
