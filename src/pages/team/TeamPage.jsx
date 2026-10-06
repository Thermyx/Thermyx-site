import { ArrowLeft, ArrowRight, ArrowUpRight, Shuffle as ShuffleIcon, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import ProfileCard from "../../components/ProfileCard.jsx";
import { TEAM } from "../../data/team.js";
import { useModel } from "../../explorer/story.js";
import { useDocumentTitle } from "../../lib/useDocumentTitle.js";
import { useReducedMotion } from "../../lib/useReducedMotion.js";
import { DRAW_TIME, POINT_ANGLES, shuffleStar, starDom, starLayout, useStar } from "./star.js";
import "./team.css";

const PATTERN = "/team/mark-pattern.png"; // white on black: the ProfileCard masks its shine by brightness
const INNER = "linear-gradient(150deg, rgba(44, 156, 240, 0.5) 0%, rgba(10, 46, 88, 0.35) 45%, rgba(255, 106, 19, 0.42) 100%)";
const pad = (n) => String(n).padStart(2, "0");
const numberOf = (person) => TEAM.indexOf(person) + 1;
const byId = (id) => TEAM.find((person) => person.id === id);

// The team as five crystal cards at the points of a slowly turning pentagram, which turns further
// as the page scrolls. The cards are 3D, drawn in the shared scene (TeamStar.jsx; the layout and
// state are in star.js); this page lays a button over each one. Hover a card and the star stops,
// the card leans toward you and its seal peels; pick it and it's drawn out into a big holographic
// card (React Bits' ProfileCard) with everything about that person beside it. "Shuffle" sends
// every card along the star's lines to a new point.
export default function TeamPage() {
  useDocumentTitle("Team");
  const reducedMotion = useReducedMotion();
  const flat = useModel((s) => s.status === "unsupported"); // no WebGL: plain cards, standing still
  const slots = useStar((s) => s.slots);
  const shuffling = useStar((s) => s.moves !== null);
  const [drawn, setDrawn] = useState(null); // { id, stepped? }
  const stageRef = useRef(null);
  const fieldRef = useRef(null);

  // The scene draws the star while this page is open, positioning the buttons in the field.
  useEffect(() => {
    starDom.field = fieldRef.current;
    useStar.setState({ active: true, hover: null, drawn: null, moves: null });
    return () => {
      starDom.field = null;
      useStar.setState({ active: false, hover: null, drawn: null, moves: null });
    };
  }, []);

  // The open card leaves the star while the dialog shows it.
  useEffect(() => {
    useStar.setState({ drawn: drawn?.id ?? null, hover: null });
  }, [drawn]);

  // Without WebGL nothing positions the buttons: lay them out as a still star, as plain cards.
  useLayoutEffect(() => {
    const field = fieldRef.current;
    if (!flat || !field) return;
    const place = () => placeFlat(field);
    place();
    const observer = new ResizeObserver(place);
    observer.observe(field);
    const unsubscribe = useStar.subscribe(place);
    return () => {
      observer.disconnect();
      unsubscribe();
    };
  }, [flat]);

  const draw = (id) => setDrawn({ id });
  const shuffle = () => {
    if (shuffling) return;
    setDrawn(null);
    shuffleStar(performance.now() / 1000, reducedMotion || flat);
  };
  // Step to the previous or next card round the star without putting this one back.
  const step = (direction) => {
    const index = slots.indexOf(drawn.id);
    const next = slots[(index + direction + slots.length) % slots.length];
    setDrawn({ id: next, stepped: true });
  };
  // Close, and once the crystal has flown home, put focus back on its card.
  const putBack = () => {
    const id = drawn?.id;
    setDrawn(null);
    setTimeout(
      () => stageRef.current?.querySelector(`[data-card-id="${id}"]`)?.focus({ preventScroll: true }),
      reducedMotion || flat ? 0 : DRAW_TIME * 1000,
    );
  };
  const person = drawn && byId(drawn.id);

  return (
    <div className="team">
      <section className="team-star" aria-labelledby="team-title" inert={Boolean(person) || undefined}>
        <header className="team-star__head">
          <p className="team-star__label">
            <span className="team-star__dot" aria-hidden="true" />
            Team
          </p>
          <h1 id="team-title" className="team-star__title">
            Five people, one pair of insoles.
          </h1>
          <div className="team-star__cue">
            <p className="team-star__hint">Pick a card. Any card.</p>
            <button
              type="button"
              className="team-star__shuffle"
              onClick={shuffle}
              aria-disabled={shuffling || undefined}
            >
              <ShuffleIcon size={16} aria-hidden="true" />
              Shuffle the star
            </button>
          </div>
        </header>

        <div ref={stageRef} className="team-star__stage">
          <div
            ref={fieldRef}
            className="team-star__field"
            role="group"
            aria-label="The team: five cards on a turning star"
            data-flat={flat || undefined}
          >
            {slots.map((id) => (
              <StarCard key={id} person={byId(id)} flat={flat} onDraw={draw} />
            ))}
          </div>
        </div>
      </section>

      <AnimatePresence>
        {person && (
          <Drawn
            key="drawn"
            person={person}
            drawn={drawn}
            onClose={putBack}
            onStep={step}
            flat={flat}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// A card's button: invisible over its crystal (the scene moves it there every frame), or, without
// WebGL, a plain card of its own.
function StarCard({ person, flat, onDraw }) {
  const { id } = person;
  const register = (element) => {
    starDom.cards.set(id, element);
    return () => starDom.cards.delete(id);
  };
  const enter = () => useStar.setState({ hover: id });
  const leave = () => {
    if (useStar.getState().hover === id) useStar.setState({ hover: null });
  };
  return (
    <button
      ref={register}
      type="button"
      className="star-card"
      data-card-id={id}
      aria-label={`${person.name}, ${person.role}. Open their card.`}
      onPointerEnter={enter}
      onPointerLeave={leave}
      onFocus={enter}
      onBlur={leave}
      onClick={() => onDraw(id)}
    >
      {flat && (
        <span className="star-card__flat" aria-hidden="true">
          <b className="mono">{pad(numberOf(person))}</b>
          <span className="star-card__name">{person.name}</span>
          <span className="star-card__role">{person.role}</span>
        </span>
      )}
    </button>
  );
}

// The still star for the no-WebGL fallback: the same layout the scene uses, unturned.
function placeFlat(field) {
  const { slots } = useStar.getState();
  const { width, height } = field.getBoundingClientRect();
  const { radius, cardW, cardH } = starLayout(width, height);
  slots.forEach((id, slot) => {
    const button = starDom.cards.get(id);
    if (!button) return;
    const x = width / 2 + radius * Math.cos(POINT_ANGLES[slot]);
    const y = height / 2 + radius * Math.sin(POINT_ANGLES[slot]);
    button.style.width = `${cardW}px`;
    button.style.height = `${cardH}px`;
    button.style.transform = `translate(${x - cardW / 2}px, ${y - cardH / 2}px)`;
  });
}

// The open card: the crystal itself flies out of the star (turning once) to the card spot here,
// grows to full size, and leans toward the pointer; the person's story is beside it. The scene
// draws the crystal (it's behind the page), so the backdrop keeps a soft window open over it (the
// scene moves the window with the card). Esc, the close button, or the backdrop sends it back.
// Without WebGL, the spot shows React Bits' ProfileCard instead.
function Drawn({ person, drawn, onClose, onStep, flat }) {
  const closeRef = useRef(null);
  const leaving = useRef(false);

  // Tell the scene where the card spot and the backdrop are.
  const spotRef = (element) => {
    starDom.spot = element;
    return () => {
      if (starDom.spot === element) starDom.spot = null;
    };
  };
  const backdropRef = (element) => {
    starDom.backdrop = element;
    return () => {
      if (starDom.backdrop === element) starDom.backdrop = null;
    };
  };

  // Focus the dialog and keep the page still underneath while it's open.
  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
    document.documentElement.dataset.dialogOpen = "";
    return () => {
      delete document.documentElement.dataset.dialogOpen;
    };
  }, []);

  // Back onto the star: the crystal flies home while the dialog fades.
  const close = () => {
    if (leaving.current) return;
    leaving.current = true;
    onClose();
  };

  // Esc puts the card back; the arrow keys step round the star. Rebound each render, so it
  // always acts on the person showing now.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") close();
      else if (event.key === "ArrowRight") onStep(1);
      else if (event.key === "ArrowLeft") onStep(-1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  });

  return (
    <motion.div
      className="drawn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawn-name"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.35 } }}
    >
      <motion.div
        ref={backdropRef}
        className="drawn__backdrop"
        onClick={close}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35 }}
      />
      <div className="drawn__layout">
        {flat ? (
          <motion.div
            className="drawn__card"
            key={person.id}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
          >
            <ProfileCard
              name={person.name}
              title={person.role}
              handle={null}
              showUserInfo={false}
              avatarUrl={person.photo}
              iconUrl={PATTERN}
              grainUrl={null}
              innerGradient={INNER}
              behindGlowColor="rgba(91, 210, 255, 0.55)"
              behindGlowSize="50%"
              enableTilt
            />
          </motion.div>
        ) : (
          <div ref={spotRef} className="drawn__card drawn__card--crystal" aria-hidden="true" />
        )}

        <motion.article
          key={`info-${person.id}`}
          className="drawn__info"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          // In once the crystal has crossed under it (the scene draws it behind the page).
          transition={{ duration: 0.5, delay: flat ? 0.1 : drawn.stepped ? 0.3 : 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="drawn__top">
            <p className="drawn__number mono">
              {pad(numberOf(person))} <span>/ {pad(TEAM.length)}</span>
            </p>
            <button ref={closeRef} type="button" className="drawn__close" onClick={close}>
              <X size={18} aria-hidden="true" />
              <span>Back to the star</span>
            </button>
          </div>
          <p className="drawn__role">{person.role}</p>
          <h2 id="drawn-name" className="drawn__name">
            {person.name}
          </h2>
          <div className="drawn__scroll">
            {person.bio.map((paragraph) => (
              <p key={paragraph} className="drawn__bio">
                {paragraph}
              </p>
            ))}
            {person.focus.length > 0 && (
              <>
                <p className="drawn__label">Focus</p>
                <ul className="drawn__chips">
                  {person.focus.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </>
            )}
            {person.background.length > 0 && (
              <dl className="drawn__facts">
                {person.background.map(([term, value]) => (
                  <div key={term}>
                    <dt>{term}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            )}
            {person.links.length > 0 && (
              <ul className="drawn__links">
                {person.links.map(({ label, href }) => (
                  <li key={href}>
                    <a href={href} target="_blank" rel="noreferrer noopener">
                      {label}
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
            {person.example && <span className="example-tag">Example</span>}
          </div>
          <div className="drawn__nav">
            <button type="button" onClick={() => onStep(-1)}>
              <ArrowLeft size={16} aria-hidden="true" />
              Previous
            </button>
            <button type="button" onClick={() => onStep(1)}>
              Next
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          </div>
        </motion.article>
      </div>
    </motion.div>
  );
}
