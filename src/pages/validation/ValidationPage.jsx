import { ArrowUpRight, ChevronDown, Maximize2, Play } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useId, useState } from "react";
import Masonry from "../../components/Masonry.jsx";
import SpotlightCard from "../../components/SpotlightCard.jsx";
import StarBorder from "../../components/StarBorder.jsx";
import { GALLERY, RECOGNITIONS } from "../../data/validation.js";
import { useDocumentTitle } from "../../lib/useDocumentTitle.js";
import { useReducedMotion } from "../../lib/useReducedMotion.js";
import FloatingCardLayer from "../../ui/FloatingCards.jsx";
import { useFloatingCards } from "../../ui/floatingCards.js";
import PageHero from "../../ui/PageHero.jsx";
import "./validation.css";

const ITEMS = GALLERY.map((item) => ({ ...item, label: `${item.title}: open larger` }));
const COLUMNS = [3, 3, 2, 2];
const EASE = [0.22, 1, 0.36, 1];

// Validation: photos and video from building Prototype 1 in React Bits' Masonry (videos play,
// muted and looping, in their tiles; any tile opens larger in a draggable card), then who has
// recognized Thermyx, as a dropdown list of React Bits SpotlightCards.
export default function ValidationPage() {
  useDocumentTitle("Validation");
  const reducedMotion = useReducedMotion();

  return (
    <div className="page-shell validation">
      <PageHero label="Validation" title="Built by hand." lede="Photos and video from building Prototype 1. Open any of them to see it larger." />

      <p className="validation__hint">
        <Maximize2 size={14} aria-hidden="true" />
        Open any tile for a closer look
      </p>
      <Masonry
        items={ITEMS}
        renderItem={(item) => <Tile item={item} reducedMotion={reducedMotion} />}
        onItemClick={(item, element) => useFloatingCards.getState().open(item, element)}
        animateFrom="bottom"
        stagger={0.06}
        scaleOnHover
        hoverScale={0.97}
        blurToFocus
        reducedMotion={reducedMotion}
        columnCounts={COLUMNS}
        className="validation__grid"
      />
      <FloatingCardLayer render={(item, titleId) => <Detail item={item} titleId={titleId} reducedMotion={reducedMotion} />} />

      <Recognized />
    </div>
  );
}

// ── The gallery ──

function Media({ item, reducedMotion, className }) {
  if (item.type === "video") {
    return (
      <video
        className={className}
        src={item.src}
        muted
        loop
        playsInline
        autoPlay={!reducedMotion}
        preload="metadata"
        aria-hidden="true"
      />
    );
  }
  return <img className={className} src={item.src} alt="" loading="lazy" decoding="async" draggable="false" />;
}

function Tile({ item, reducedMotion }) {
  return (
    <div className="g-tile">
      <Media item={item} reducedMotion={reducedMotion} className="g-tile__media" />
      <div className="g-tile__shade">
        {item.type === "video" && (
          <span className="g-tile__badge">
            <Play size={11} fill="currentColor" aria-hidden="true" />
            Video
          </span>
        )}
        <p className="g-tile__title">{item.title}</p>
      </div>
    </div>
  );
}

function Detail({ item, titleId, reducedMotion }) {
  return (
    <figure className="g-detail">
      {item.type === "video" ? (
        <video className="g-detail__media" src={item.src} muted loop playsInline autoPlay={!reducedMotion} controls />
      ) : (
        <img className="g-detail__media" src={item.src} alt={item.title} />
      )}
      <figcaption id={titleId} className="g-detail__caption">
        {item.title}
      </figcaption>
    </figure>
  );
}

// ── Recognized by ──

function Recognized() {
  const [open, setOpen] = useState(null); // all closed until one is picked
  return (
    <section className="recognized" aria-labelledby="recognized-title">
      <h2 id="recognized-title" className="recognized__title">
        Recognized by<span>.</span>
      </h2>
      <ul className="recognized__list">
        {RECOGNITIONS.map((entry) => (
          <li key={entry.id}>
            <Recognition entry={entry} open={open === entry.id} onToggle={() => setOpen(open === entry.id ? null : entry.id)} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function Recognition({ entry, open, onToggle }) {
  const panelId = useId();
  if (entry.placeholder) {
    return (
      <div className="recognition recognition--placeholder">
        <div className="recognition__head">
          <span className="recognition__logo recognition__logo--empty" aria-hidden="true" />
          <span className="recognition__names">
            <span className="recognition__name">{entry.name}</span>
            <span className="recognition__tagline">{entry.tagline}</span>
          </span>
          <span className="recognition__soon">Coming soon</span>
        </div>
      </div>
    );
  }
  return (
    <SpotlightCard className="recognition" spotlightColor="rgb(91 210 255 / 0.14)">
      <button type="button" className="recognition__head" aria-expanded={open} aria-controls={panelId} onClick={onToggle}>
        <img className="recognition__logo" src={entry.logo} alt="" />
        <span className="recognition__names">
          <span className="recognition__name">{entry.name}</span>
          <span className="recognition__tagline">{entry.tagline}</span>
        </span>
        <ChevronDown className="recognition__chevron" size={22} aria-hidden="true" />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            className="recognition__panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <div className="recognition__body">
              <img className="recognition__cover" src={entry.cover} alt={`${entry.name} banner`} />
              <div className="recognition__intro">
                <p>{entry.intro}</p>
                <dl className="recognition__people">
                  {entry.people.map(([role, name]) => (
                    <div key={role}>
                      <dt>{role}</dt>
                      <dd>{name}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="recognition__sections">
                {entry.sections.map((section) => (
                  <div key={section.title} className="recognition__section">
                    <h3>{section.title}</h3>
                    {section.text && <p>{section.text}</p>}
                    {section.chips && (
                      <ul className="recognition__chips">
                        {section.chips.map((chip) => (
                          <li key={chip}>{chip}</li>
                        ))}
                      </ul>
                    )}
                    {section.list && (
                      <ul className="recognition__points">
                        {section.list.map((point) => (
                          <li key={point}>{point}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
              <p className="recognition__motto">{entry.motto}</p>
              <div className="recognition__links">
                {entry.links.map(({ label, href, primary }) =>
                  primary ? (
                    <StarBorder
                      key={href}
                      as="a"
                      href={href}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="recognition__visit"
                      color="#5bd2ff"
                      speed="5s"
                      backgroundColor="#0b1626"
                      borderColor="rgb(91 210 255 / 0.35)"
                      textColor="#f1f4f8"
                    >
                      {label}
                      <ArrowUpRight size={16} aria-hidden="true" />
                    </StarBorder>
                  ) : (
                    <a
                      key={href}
                      className="recognition__link"
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel={href.startsWith("http") ? "noreferrer noopener" : undefined}
                    >
                      {label}
                      <ArrowUpRight size={15} aria-hidden="true" />
                    </a>
                  ),
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </SpotlightCard>
  );
}
