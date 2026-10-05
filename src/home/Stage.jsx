import { ArrowDown, ArrowRight } from "lucide-react";
import { useEffect, useRef, useSyncExternalStore } from "react";
import { Link } from "react-router-dom";
import BlurText from "../components/BlurText.jsx";
import DecryptedText from "../components/DecryptedText.jsx";
import ShinyText from "../components/ShinyText.jsx";
import SplitText from "../components/SplitText.jsx";
import StarBorder from "../components/StarBorder.jsx";
import { COMPONENTS, PRODUCT_NAMES } from "../data/components.js";
import CalloutLayer from "../explorer/CalloutLayer.jsx";
import { useCallouts } from "../explorer/callouts.js";
import { STAGE } from "../explorer/constants.js";
import { loadProgress } from "../explorer/loadProgress.js";
import { reloadAssembly } from "../explorer/model.js";
import { useModel, useStage } from "../explorer/story.js";
import { useStageScroll } from "../explorer/useStageScroll.js";
import { useViewInsets } from "../explorer/useViewInsets.js";
import { useReducedMotion } from "../lib/useReducedMotion.js";
import { WAITLIST_HREF } from "../site/pages.js";
import Chapters from "./Chapters.jsx";
import "./Stage.css";

// The hero and the 3D product on one pinned stage, over the fixed canvas (the model is drawn
// there; this layer is the copy around it, transparent to the pointer except where it has
// something to press). At the top: the hero copy on the left, the assembled insole and power pack
// on the right. Scrolling hands the left column to the chapters while the model turns and comes
// apart beside them, each chapter lighting up the parts it is about. Fully exploded, the model
// slides to the middle and holds to be explored: hover a part for its card, click to pin (any
// number), drag cards anywhere, drag the model to turn it. Then the page moves on.
export default function Stage() {
  const sectionRef = useRef(null);
  const stageRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const mode = useStage((s) => s.mode);
  const status = useModel((s) => s.status);

  useStageScroll(sectionRef, stageRef, reducedMotion);
  useViewInsets(stageRef);

  // Esc unpins every card.
  useEffect(() => {
    const onKeyDown = (event) => event.key === "Escape" && useCallouts.getState().clear();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <section
      ref={sectionRef}
      id="inside"
      className="stage"
      data-mode={mode}
      style={{
        "--hero-length": STAGE.heroLength,
        "--scrub-length": STAGE.scrubLength,
        "--center-length": STAGE.centerLength,
        "--play-length": STAGE.playLength,
      }}
      aria-labelledby="hero-title"
    >
      {/* Scroll target for "See inside": the start of the explorable hold. */}
      <span id="explore" className="stage__explore-anchor" aria-hidden="true" />

      <div ref={stageRef} className="stage__pin">
        <div className="stage__header-space" data-view-inset="hero:top chapters:top play:top" aria-hidden="true" />
        <div className="stage__model" role="img" aria-label="3D model of the Thermyx insole and its external power pack." />

        <Hero />
        <Chapters />
        <PlayBar />

        {status === "ready" && mode === "play" && <CalloutLayer stageRef={stageRef} />}
        <StageStatus status={status} />
        <PartsList />
      </div>
    </section>
  );
}

function Hero() {
  const reducedMotion = useReducedMotion();
  return (
    <div className="hero" data-view-inset="hero">
      <div className="hero__content">
        <p className="hero__pill">
          <span className="hero__pill-dot" aria-hidden="true" />
          <ShinyText
            text="Prototype 1 · in supervised field evaluation"
            disabled={reducedMotion}
            speed={3.2}
            color="#a4b1c2"
            shineColor="#ffffff"
            spread={110}
          />
        </p>

        <h1 id="hero-title" className="hero__title">
          {reducedMotion ? (
            "Climate control for your feet."
          ) : (
            <SplitText
              tag="span"
              text="Climate control for your feet."
              className="hero__split"
              splitType="words, chars"
              delay={22}
              duration={1.05}
              ease="power4.out"
              from={{ opacity: 0, y: "0.55em" }}
              to={{ opacity: 1, y: 0 }}
              threshold={0}
              rootMargin="0px"
              textAlign="left"
            />
          )}
        </h1>

        <BlurText
          text="Smart insoles that sense temperature, pressure, and movement, then heat or cool each foot within hard safety limits."
          className="hero__lede"
          animateBy="words"
          direction="bottom"
          delay={26}
          stepDuration={0.3}
        />

        <div className="hero__actions">
          <StarBorder
            as={Link}
            to={WAITLIST_HREF}
            className="hero__cta"
            color="#5bd2ff"
            speed="4.5s"
            thickness={1}
            backgroundColor="var(--signal)"
            borderColor="transparent"
            textColor="var(--on-signal)"
          >
            Join the waitlist
            <ArrowRight size={17} strokeWidth={2.2} aria-hidden="true" />
          </StarBorder>
          <a className="button button--ghost hero__secondary" href="#explore">
            See inside
            <ArrowDown size={16} strokeWidth={2} aria-hidden="true" />
          </a>
        </div>

        <dl className="hero__specs">
          {[
            ["Modes", "Cool · Auto · Heat"],
            ["Burn limit", "40 °C, in firmware"],
            ["Pair", "2 insoles · BLE"],
          ].map(([term, value], i) => (
            <div key={term} className="hero__spec">
              <dt className="eyebrow">{term}</dt>
              <dd>
                {reducedMotion ? (
                  <span className="hero__spec-value">{value}</span>
                ) : (
                  <DecryptedText
                    text={value}
                    animateOn="view"
                    sequential
                    speed={28 + i * 6}
                    revealDirection="start"
                    characters="0123456789·°ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                    className="hero__spec-value"
                    encryptedClassName="hero__spec-value hero__spec-value--scrambled"
                  />
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <p className="hero__scroll" aria-hidden="true">
        <span className="hero__scroll-line" />
        Scroll to take it apart
      </p>
    </div>
  );
}

// Fully exploded: what to do, and how many parts there are to find.
function PlayBar() {
  return (
    // Its band is kept clear in every phase, so the free area never grows taller mid-transition
    // (the model would swell, then shrink back).
    <div className="playbar" data-view-inset="play hero:bottom chapters:bottom">
      <div className="playbar__title">
        <span className="eyebrow">Explore it yourself</span>
        <p>
          <span className="mono playbar__count">{COMPONENTS.length}</span> parts across the insole and its power pack.
        </p>
      </div>
      <p className="playbar__hint">
        <span className="playbar__hint--fine">
          <kbd>Hover</kbd> a part to see what it does <span aria-hidden="true">·</span> <kbd>Click</kbd> to pin{" "}
          <span aria-hidden="true">·</span> <kbd>Drag</kbd> to turn <span aria-hidden="true">·</span> <kbd>Esc</kbd> clears
        </span>
        <span className="playbar__hint--coarse">Tap a part for details · Drag cards to move them</span>
      </p>
    </div>
  );
}

function StageStatus({ status }) {
  const retry = () => {
    reloadAssembly();
    useModel.setState((s) => ({ status: "loading", attempt: s.attempt + 1 }));
  };
  if (status === "ready") return null;
  return (
    <div className="stage__status" data-status={status}>
      {status === "loading" && <LoadingReadout />}
      {status === "error" && (
        <Notice title="The 3D model didn't load" body="Check your connection, then try again.">
          <button type="button" className="button button--primary" onClick={retry}>
            Try again
          </button>
        </Notice>
      )}
      {status === "unsupported" && (
        <Notice
          title="3D view unavailable"
          body="This browser couldn't start WebGL, which the 3D model needs. A current version of Chrome, Safari, Firefox, or Edge will work."
        />
      )}
    </div>
  );
}

function LoadingReadout() {
  const { loaded, total } = useSyncExternalStore(loadProgress.subscribe, loadProgress.getSnapshot);
  const fraction = total ? Math.min(loaded / total, 1) : 0;
  const percent = Math.round(fraction * 100);

  return (
    <div className="readout-plate">
      <span className="eyebrow">Loading model</span>
      <div
        className="progress"
        role="progressbar"
        aria-label="Loading 3D model"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={total ? percent : undefined}
      >
        <div className="progress__fill" style={{ transform: `scaleX(${fraction})` }} data-indeterminate={!total || undefined} />
      </div>
      <span className="mono readout-plate__value" aria-hidden="true">
        {total ? `${String(percent).padStart(3, " ")}%` : loaded ? `${Math.round(loaded / 1024)} KB` : "—"}
      </span>
    </div>
  );
}

function Notice({ title, body, children }) {
  return (
    <div className="notice" role="alert">
      <p className="notice__title">{title}</p>
      <p className="notice__body">{body}</p>
      {children}
    </div>
  );
}

// The same part descriptions as the cards, for screen readers (the cards are pointer-driven).
function PartsList() {
  return (
    <div className="visually-hidden">
      <h2>What's inside</h2>
      {["insole", "pack"].map((product) => (
        <section key={product}>
          <h3>{PRODUCT_NAMES[product]}</h3>
          <dl>
            {COMPONENTS.filter((c) => c.product === product).map((c) => (
              <div key={c.match}>
                <dt>{c.label}</dt>
                <dd>
                  {c.role}
                  {c.part && ` (${c.part})`}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  );
}
