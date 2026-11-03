import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";
import { motion } from "motion/react";
import { Link, useParams } from "react-router-dom";
import { ARTICLES, articleById } from "../../data/learn.js";
import { useDocumentTitle } from "../../lib/useDocumentTitle.js";
import NotFound from "../NotFound.jsx";
import Inline from "./Inline.jsx";
import { ArticleMeta } from "./MediaPage.jsx";
import "./article.css";

const EASE = [0.22, 1, 0.36, 1];
const LEARN_HREF = "/media?section=learn";

// One Learn article, laid out as the app's reader does: kicker and read time, title, dek, the
// photograph with its caption and credit, the blocks, the disclaimer, and APA references.
export default function ArticlePage() {
  const { id } = useParams();
  const article = articleById(id);
  useDocumentTitle(article?.title ?? "Page not found");
  if (!article) return <NotFound />;

  const index = ARTICLES.indexOf(article);
  const next = [1, 2].map((k) => ARTICLES[(index + k) % ARTICLES.length]);
  const { credit } = article.photo;

  return (
    <article className="reader" data-learn-tone={article.section.tone}>
      <Link to={LEARN_HREF} className="reader__back">
        <ArrowLeft size={16} aria-hidden="true" /> Learn
      </Link>

      <motion.header
        className="reader__head"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE }}
      >
        <ArticleMeta article={article} />
        <h1 className="reader__title">{article.title}</h1>
        <p className="reader__dek">{article.dek}</p>
      </motion.header>

      <motion.figure
        className="reader__photo"
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.1, ease: EASE }}
      >
        <img src={article.photo.src} alt={article.photo.alt} />
        <figcaption>
          {article.photo.caption}
          {credit && (
            <span className="reader__credit">
              {" "}
              Photo: {credit.author},{" "}
              {credit.licenseURL ? (
                <a href={credit.licenseURL} target="_blank" rel="noreferrer noopener">
                  {credit.license}
                </a>
              ) : (
                credit.license
              )}
              {credit.modified && ", cropped"} ·{" "}
              <a href={credit.source} target="_blank" rel="noreferrer noopener">
                Wikimedia Commons
              </a>
            </span>
          )}
        </figcaption>
      </motion.figure>

      <div className="reader__body">
        {article.blocks.map((block, i) => (
          <Block key={i} block={block} />
        ))}

        <p className="reader__disclaimer">
          Thermyx Learn is educational and is not a medical diagnosis tool. Talk to a clinician about your own health. In an
          emergency, call 911.
        </p>

        <section className="reader__refs" aria-labelledby="refs-title">
          <h2 id="refs-title" className="reader__refs-title">
            References
          </h2>
          <ol>
            {article.references.map((ref) => {
              const url = ref.match(/https?:\/\/\S+$/)?.[0];
              const text = url ? ref.slice(0, -url.length) : ref;
              return (
                <li key={ref}>
                  <Inline text={text} />
                  {url && (
                    <a href={url} target="_blank" rel="noreferrer noopener">
                      {url}
                    </a>
                  )}
                </li>
              );
            })}
          </ol>
        </section>
      </div>

      <nav className="reader__next" aria-label="More from Learn">
        <p className="eyebrow">Keep reading</p>
        <ul>
          {next.map((a) => (
            <li key={a.id}>
              <Link to={`/media/learn/${a.id}`} className="reader__next-card" data-learn-tone={a.section.tone}>
                <img src={a.photo.src} alt="" loading="lazy" />
                <span>
                  <ArticleMeta article={a} />
                  <span className="reader__next-title">{a.title}</span>
                </span>
                <ArrowRight className="reader__next-arrow" size={20} aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
        <Link className="reader__app-note" to="/app">
          These articles live in the Learn tab of the Thermyx app <ArrowUpRight size={14} aria-hidden="true" />
        </Link>
      </nav>
    </article>
  );
}

function Block({ block }) {
  switch (block.type) {
    case "lede":
      return (
        <p className="reader__lede">
          <Inline text={block.text} />
        </p>
      );
    case "h":
      return <h2 className="reader__h">{block.text}</h2>;
    case "quote":
      return (
        <blockquote className="reader__quote">
          <p>
            <Inline text={block.text} />
          </p>
          {block.source && <cite>{block.source}</cite>}
        </blockquote>
      );
    case "fact":
      return (
        <aside className="reader__fact">
          <p className="reader__fact-figure">{block.figure}</p>
          <p className="reader__fact-text">
            <Inline text={block.text} />
          </p>
          {block.source && <p className="reader__fact-source mono">{block.source}</p>}
        </aside>
      );
    case "note":
      return (
        <aside className="reader__note">
          {block.title && <p className="reader__note-title">{block.title}</p>}
          <p>
            <Inline text={block.text} />
          </p>
        </aside>
      );
    case "steps":
      return (
        <section className="reader__steps">
          {block.title && <p className="reader__steps-title">{block.title}</p>}
          <ol>
            {block.items.map((item) => (
              <li key={item}>
                <Inline text={item} />
              </li>
            ))}
          </ol>
        </section>
      );
    case "list":
      return (
        <ul className="reader__list">
          {block.items.map((item) => (
            <li key={item}>
              <Inline text={item} />
            </li>
          ))}
        </ul>
      );
    default:
      return (
        <p>
          <Inline text={block.text} />
        </p>
      );
  }
}
