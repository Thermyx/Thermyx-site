import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import { ArrowRight, ArrowUpRight, Clock, Play } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { FaInstagram, FaLinkedinIn, FaTiktok, FaYoutube } from "react-icons/fa6";
import { Link, useSearchParams } from "react-router-dom";
import FlowingMenu from "../../components/FlowingMenu.jsx";
import ScrollVelocity from "../../components/ScrollVelocity.jsx";
import { ARTICLES, SOURCES } from "../../data/learn.js";
import { CHANNELS, MEDIA_SECTIONS, POSTS, VIDEOS } from "../../data/media.js";
import { SOCIALS } from "../../data/socials.js";
import { useDocumentTitle } from "../../lib/useDocumentTitle.js";
import { useReducedMotion } from "../../lib/useReducedMotion.js";
import Inline from "./Inline.jsx";
import "./media.css";

const EASE = [0.22, 1, 0.36, 1];
const ICONS = { youtube: FaYoutube, instagram: FaInstagram, tiktok: FaTiktok, linkedin: FaLinkedinIn };
const TICKER = ["Thermyx Media ✦ Pitches ✦ Learn ✦ Heat ✦ Cold ✦ Your feet ✦ Selected Sources ✦ Research ✦ "];
const pad = (n) => String(n).padStart(2, "0");

// Media as a press room: a masthead, a dateline, a ticker, and three sections. Thermyx Media is our
// channels, our videos, and our posts and press (React Bits' FlowingMenu rows: hover one and it
// floods with a marquee); Learn is the app's articles; Selected Sources is the bibliography they
// cite. The section is in the address (/media?section=learn).
export default function MediaPage() {
  useDocumentTitle("Media");
  const reducedMotion = useReducedMotion();
  const [params, setParams] = useSearchParams();
  const section = MEDIA_SECTIONS.some(({ id }) => id === params.get("section")) ? params.get("section") : "thermyx";
  const counts = { thermyx: CHANNELS.length + VIDEOS.length + POSTS.length, learn: ARTICLES.length, sources: SOURCES.length };
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  return (
    <div className="press">
      <header className="press__masthead">
        <p className="press__dateline mono">
          <span>Thermyx</span>
          <span>{today}</span>
          <span>{counts.thermyx + counts.learn + counts.sources} entries</span>
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
          {section === "thermyx" && <ThermyxMedia />}
          {section === "learn" && <LearnShelf />}
          {section === "sources" && <SelectedSources />}
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

      <Videos />

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

// ── Thermyx Media: videos ──

const thumb = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
const formatDate = (date) => new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

// One video large, the rest beside it. The player loads only when asked (a thumbnail until then),
// from YouTube's no-cookie domain.
function Videos() {
  const [current, setCurrent] = useState({ id: VIDEOS[0].id, playing: false });
  const video = VIDEOS.find((v) => v.id === current.id);
  const youtube = SOCIALS.find((s) => s.id === "youtube");

  return (
    <div className="videos">
      <div className="posts__head">
        <h2 className="posts__title">Pitches and submissions</h2>
        <a className="posts__note videos__channel" href={youtube.href} target="_blank" rel="noreferrer noopener">
          {youtube.handle}
          <ArrowUpRight size={14} aria-hidden="true" />
          <span className="visually-hidden"> on YouTube (opens in a new tab)</span>
        </a>
      </div>
      <div className="videos__grid">
        <figure className="video-stage">
          <div className="video-stage__frame">
            {current.playing ? (
              <iframe
                key={video.id}
                src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
                title={video.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            ) : (
              <button type="button" className="video-stage__poster" onClick={() => setCurrent({ id: video.id, playing: true })}>
                <img src={thumb(video.id)} alt="" loading="lazy" />
                <span className="video-stage__play" aria-hidden="true">
                  <Play size={26} fill="currentColor" />
                </span>
                <span className="visually-hidden">Play {video.title}</span>
              </button>
            )}
          </div>
          <figcaption className="video-stage__caption">
            <span className="post-row__type" data-type="video">
              {video.kind}
            </span>
            <span className="video-stage__title">{video.title}</span>
            <span className="video-stage__meta mono">
              {video.event} · <time dateTime={video.date}>{formatDate(video.date)}</time>
            </span>
          </figcaption>
        </figure>
        <ol className="video-list">
          {VIDEOS.map((v, i) => (
            <li key={v.id}>
              <button
                type="button"
                className="video-list__item"
                aria-pressed={v.id === current.id}
                onClick={() => setCurrent({ id: v.id, playing: v.id === current.id ? current.playing : false })}
              >
                <span className="video-list__thumb">
                  <img src={thumb(v.id)} alt="" loading="lazy" />
                </span>
                <span className="video-list__text">
                  <span className="video-list__index mono">{pad(i + 1)}</span>
                  <span className="video-list__title">{v.title}</span>
                  <span className="video-list__meta mono">{v.event}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

// ── Learn: the app's articles ──

function LearnShelf() {
  const [lead, ...rest] = ARTICLES;
  return (
    <section className="press__section learn-shelf" aria-label="Learn">
      <p className="learn-shelf__lede">
        The eight articles from the Learn tab in the Thermyx app, word for word: written for anyone, each with its sources.
        Educational, not a medical diagnosis tool.
      </p>
      <Link to={`/media/learn/${lead.id}`} className="learn-lead" data-learn-tone={lead.section.tone}>
        <span className="learn-lead__photo">
          <img src={lead.photo.src} alt={lead.photo.alt} />
        </span>
        <span className="learn-lead__body">
          <ArticleMeta article={lead} />
          <span className="learn-lead__title">{lead.title}</span>
          <span className="learn-lead__dek">{lead.dek}</span>
          <span className="learn-card__read">
            Read <ArrowRight size={16} aria-hidden="true" />
          </span>
        </span>
      </Link>
      <ul className="learn-grid">
        {rest.map((article, i) => (
          <motion.li
            key={article.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -8% 0px" }}
            transition={{ duration: 0.55, delay: (i % 3) * 0.06, ease: EASE }}
          >
            <Link to={`/media/learn/${article.id}`} className="learn-card" data-learn-tone={article.section.tone}>
              <span className="learn-card__photo">
                <img src={article.photo.src} alt={article.photo.alt} loading="lazy" />
              </span>
              <ArticleMeta article={article} />
              <span className="learn-card__title">{article.title}</span>
              <span className="learn-card__dek">{article.dek}</span>
            </Link>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}

export function ArticleMeta({ article }) {
  return (
    <span className="article-meta">
      <span className="article-meta__section">{article.section.label}</span>
      <span className="article-meta__time mono">
        <Clock size={12} aria-hidden="true" /> {article.minutes} min read
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
          Every reference the app's Learn articles cite, in APA 7, each checked against Crossref, PubMed, or the publisher
          before it was listed.
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
              <p className="source__type">
                {source.type}
                {source.year && <span className="source__year mono"> · {source.year}</span>}
              </p>
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
              <p className="source__cite">
                {source.authors}
                {source.venue && (
                  <>
                    {" · "}
                    <Inline text={source.venue} />
                  </>
                )}
              </p>
              <p className="source__note">
                Cited in{" "}
                {source.citedIn.map(({ id, title }, j) => (
                  <span key={id}>
                    {j > 0 && ", "}
                    <Link to={`/media/learn/${id}`}>“{title}”</Link>
                  </span>
                ))}
              </p>
            </div>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}
