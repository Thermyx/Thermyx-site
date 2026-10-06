import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import { ArrowUpRight } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { FaInstagram, FaLinkedinIn, FaTiktok, FaYoutube } from "react-icons/fa6";
import { useSearchParams } from "react-router-dom";
import FlowingMenu from "../../components/FlowingMenu.jsx";
import ScrollVelocity from "../../components/ScrollVelocity.jsx";
import { CHANNELS, MEDIA_SECTIONS, POSTS, SOURCES } from "../../data/media.js";
import { SOCIALS } from "../../data/socials.js";
import { useDocumentTitle } from "../../lib/useDocumentTitle.js";
import { useReducedMotion } from "../../lib/useReducedMotion.js";
import "./media.css";

const EASE = [0.22, 1, 0.36, 1];
const ICONS = { youtube: FaYoutube, instagram: FaInstagram, tiktok: FaTiktok, linkedin: FaLinkedinIn };
const TICKER = ["Thermyx Media ✦ Selected Sources ✦ Video ✦ Press ✦ Research ✦ Field notes ✦ "];
const pad = (n) => String(n).padStart(2, "0");

// Media as a press room: a masthead, a dateline, a ticker, and two sections. Thermyx Media is our
// channels and our posts and press (React Bits' FlowingMenu rows: hover one and it floods with a
// marquee); Selected Sources is a bibliography of what we read and cite. The section is in the
// address (/media?section=sources).
export default function MediaPage() {
  useDocumentTitle("Media");
  const reducedMotion = useReducedMotion();
  const [params, setParams] = useSearchParams();
  const section = params.get("section") === "sources" ? "sources" : "thermyx";
  const counts = { thermyx: POSTS.length + CHANNELS.length, sources: SOURCES.length };
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="press">
      <header className="press__masthead">
        <p className="press__dateline mono">
          <span>Thermyx</span>
          <span>{today}</span>
          <span>{counts.thermyx + counts.sources} entries</span>
        </p>
        <h1 className="press__title">
          <span className="visually-hidden">Media</span>
          {["M", "E", "D", "I", "A"].map((letter, i) => (
            <motion.span
              key={letter}
              aria-hidden="true"
              initial={reducedMotion ? false : { y: "100%", opacity: 0 }}
              animate={{ y: "0%", opacity: 1 }}
              transition={{ duration: 0.9, delay: 0.08 * i, ease: EASE }}
            >
              {letter}
            </motion.span>
          ))}
        </h1>
        <div className="press__rules" aria-hidden="true" />
        <div className="press__ticker" aria-hidden="true">
          {reducedMotion ? (
            <p className="press-ticker__row">{TICKER[0]}</p>
          ) : (
            <ScrollVelocity texts={TICKER} velocity={40} className="press-ticker__text" parallaxClassName="press-ticker" scrollerClassName="press-ticker__row" numCopies={4} />
          )}
        </div>
      </header>

      <div className="press__switch" role="group" aria-label="Section">
        {MEDIA_SECTIONS.map(({ id, label, blurb }, i) => (
          <button
            key={id}
            type="button"
            className="press__tab"
            data-section={id}
            aria-pressed={section === id}
            onClick={() => setParams(id === "thermyx" ? {} : { section: id }, { replace: true, preventScrollReset: true })}
          >
            <span className="press__tab-index mono">{pad(i + 1)}</span>
            <span className="press__tab-label">{label}</span>
            <span className="press__tab-count mono">{pad(counts[id])}</span>
            <span className="press__tab-blurb">{blurb}</span>
            {section === id && <motion.span layoutId="press-tab" className="press__tab-bar" transition={{ type: "spring", stiffness: 380, damping: 34 }} />}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={section}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12, transition: { duration: 0.18 } }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          {section === "thermyx" ? <ThermyxMedia /> : <SelectedSources />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ── Thermyx Media: channels, then posts and press ──

function ThermyxMedia() {
  return (
    <section className="press__section" aria-label="Thermyx Media">
      <ul className="channels">
        {CHANNELS.map(({ id, action }, i) => {
          const social = SOCIALS.find((s) => s.id === id);
          const Icon = ICONS[id];
          return (
            <motion.li
              key={id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.07, ease: EASE }}
            >
              <a
                className="channel"
                data-social={id}
                href={social.href}
                target="_blank"
                rel="noreferrer noopener"
                style={{ "--brand": social.color, "--brand-2": social.accent ?? social.color, "--brand-fill": social.gradient ?? social.color }}
              >
                <span className="channel__icon" aria-hidden="true">
                  <Icon />
                </span>
                <span className="channel__name">{social.name}</span>
                <span className="channel__handle mono">{social.handle}</span>
                <span className="channel__action">
                  {action}
                  <ArrowUpRight size={16} aria-hidden="true" />
                </span>
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            </motion.li>
          );
        })}
      </ul>

      <div className="posts">
        <div className="posts__head">
          <h2 className="posts__title">Posts, press, and recognition</h2>
          <p className="posts__note">Hover a row.</p>
        </div>
        <FlowingMenu
          className="posts__list"
          label="Posts, press, and recognition"
          items={POSTS.map((post, i) => ({
            ...post,
            index: i,
            link: post.example ? null : post.href,
            external: true,
            text: post.title,
            marqueeText: `${post.type} · ${post.source}`,
          }))}
          renderLabel={renderPost}
          speed={18}
          textColor="var(--text)"
          bgColor="transparent"
          marqueeBgColor="#5bd2ff"
          marqueeTextColor="#03121f"
          borderColor="rgb(255 255 255 / 0.12)"
        />
      </div>
    </section>
  );
}

function renderPost(post) {
  return (
    <span className="post-row">
      <span className="post-row__index mono">{pad(post.index + 1)}</span>
      <span className="post-row__type" data-type={post.type.toLowerCase()}>
        {post.type}
      </span>
      <span className="post-row__title">{post.title}</span>
      <span className="post-row__meta">
        {post.example ? <span className="example-tag">Example</span> : <span className="mono">{post.source}</span>}
        {post.date && <time className="mono">{post.date}</time>}
        {!post.example && <ArrowUpRight size={20} aria-hidden="true" />}
      </span>
    </span>
  );
}

// ── Selected Sources: a bibliography ──

function SelectedSources() {
  const types = [...new Set(SOURCES.map((s) => s.type))];
  return (
    <section className="press__section sources" aria-label="Selected Sources">
      <aside className="sources__intro">
        <h2 className="sources__title">
          Selected
          <br />
          <em>Sources</em>
        </h2>
        <p className="sources__lede">
          The research, guidance, and reading behind Thermyx, and the people we build with. The first five are what the
          app's own Learning Center cites.
        </p>
        <ul className="sources__legend">
          {types.map((type) => (
            <li key={type} data-type={type.toLowerCase()}>
              <span>{type}</span>
              <span className="mono">{pad(SOURCES.filter((s) => s.type === type).length)}</span>
            </li>
          ))}
        </ul>
      </aside>
      <ol className="sources__list">
        {SOURCES.map((source, i) => (
          <motion.li
            key={source.id}
            className="source"
            data-type={source.type.toLowerCase()}
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "0px 0px -8% 0px" }}
            transition={{ duration: 0.55, delay: Math.min(i, 5) * 0.06, ease: EASE }}
          >
            <span className="source__index mono">[{pad(i + 1)}]</span>
            <div className="source__body">
              <p className="source__type">{source.type}</p>
              <h3 className="source__title">
                {source.href ? (
                  <a href={source.href} target="_blank" rel="noreferrer noopener">
                    {source.title}
                    <ArrowUpRight className="source__arrow" size={18} aria-hidden="true" />
                    <span className="visually-hidden"> (opens in a new tab)</span>
                  </a>
                ) : (
                  source.title
                )}
              </h3>
              <p className="source__cite mono">{[source.authors, source.venue, source.year].filter(Boolean).join(" · ")}</p>
              {source.citedIn && (
                <p className="source__note">
                  Cited in the app: <em>“{source.citedIn}”</em>
                </p>
              )}
              {source.example && <span className="example-tag">Example</span>}
            </div>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}
