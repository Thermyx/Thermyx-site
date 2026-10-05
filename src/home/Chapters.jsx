import { AnimatePresence, motion } from "motion/react";
import { CHAPTERS } from "../data/chapters.js";
import { componentById } from "../data/components.js";
import { HEAT_PATH_PREFIXES } from "../explorer/constants.js";
import { useStage } from "../explorer/story.js";
import { CHAPTER_SPAN, chapterStart } from "../explorer/useStageScroll.js";
import WordRise from "../ui/WordRise.jsx";

const EASE = [0.22, 1, 0.36, 1];
const pad = (n) => String(n).padStart(2, "0");

// The left column while the model turns and comes apart: an index of the five chapters (the
// current one fills as it is scrolled through), and the current chapter, which animates in each
// time it changes. The parts a chapter names light up in the model beside it (PartVisuals), and
// the chapter lists them by name in the same colors. The animated copy is hidden from screen
// readers, which get every chapter at once instead.
export default function Chapters() {
  const chapter = useStage((s) => s.chapter);
  const index = Math.max(chapter, 0);

  return (
    <div className="chapters" data-view-inset="chapters">
      <ol className="chapters__rail" aria-hidden="true">
        {CHAPTERS.map((c, i) => (
          <li
            key={c.id}
            className="chapters__step"
            data-state={i < index ? "done" : i === index ? "active" : undefined}
            style={{ "--start": chapterStart(i), "--span": CHAPTER_SPAN }}
          >
            <span className="mono chapters__step-index">{pad(i + 1)}</span>
            <span className="chapters__step-label">{c.label}</span>
            <span className="chapters__step-track">
              <span className="chapters__step-fill" />
            </span>
          </li>
        ))}
      </ol>

      <div className="chapters__current" aria-hidden="true">
        <AnimatePresence mode="wait" initial={false}>
          <Chapter key={CHAPTERS[index].id} chapter={CHAPTERS[index]} index={index} />
        </AnimatePresence>
      </div>

      <div className="visually-hidden">
        <h2>How it works</h2>
        {CHAPTERS.map((c) => (
          <section key={c.id}>
            <h3>
              {c.label}: {c.title}
            </h3>
            <p>{c.body}</p>
          </section>
        ))}
      </div>
    </div>
  );
}

function Chapter({ chapter, index }) {
  const lit = chapter.highlight.map((id) => ({ id, label: componentById(id)?.label, hot: HEAT_PATH_PREFIXES.includes(id) }));

  return (
    <motion.article
      className="chapter"
      initial="hidden"
      animate="shown"
      exit="gone"
      variants={{
        hidden: {},
        shown: { transition: { staggerChildren: 0.06 } },
        gone: { opacity: 0, y: -14, filter: "blur(6px)", transition: { duration: 0.18, ease: "easeIn" } },
      }}
    >
      <div className="chapter__index">
        <span className="chapter__num-mask">
          <motion.span
            className="mono chapter__num"
            variants={{ hidden: { y: "100%" }, shown: { y: "0%" } }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            {pad(index + 1)}
          </motion.span>
        </span>
        <span className="mono chapter__of">/ {pad(CHAPTERS.length)}</span>
        <motion.span
          className="eyebrow chapter__label"
          variants={{ hidden: { opacity: 0, x: -10 }, shown: { opacity: 1, x: 0 } }}
          transition={{ duration: 0.45, ease: EASE }}
        >
          {chapter.label}
        </motion.span>
      </div>

      <WordRise as="h3" text={chapter.title} className="chapter__title" delay={0.05} stagger={0.05} />

      <motion.p
        className="chapter__body"
        variants={{ hidden: { opacity: 0, y: 12, filter: "blur(8px)" }, shown: { opacity: 1, y: 0, filter: "blur(0px)" } }}
        transition={{ duration: 0.6, delay: 0.18, ease: EASE }}
      >
        {chapter.body}
      </motion.p>

      <motion.ul
        className="chapter__chips"
        variants={{ hidden: {}, shown: { transition: { staggerChildren: 0.05, delayChildren: 0.3 } } }}
      >
        {chapter.chips.map((chip) => (
          <motion.li
            key={chip}
            className="mono chapter__chip"
            variants={{ hidden: { opacity: 0, y: 10, scale: 0.96 }, shown: { opacity: 1, y: 0, scale: 1 } }}
            transition={{ duration: 0.4, ease: EASE }}
          >
            {chip}
          </motion.li>
        ))}
      </motion.ul>

      <motion.div
        className="chapter__lit"
        variants={{ hidden: { opacity: 0 }, shown: { opacity: 1 } }}
        transition={{ duration: 0.5, delay: 0.45 }}
      >
        <span className="eyebrow">Lit in the model</span>
        <ul>
          {lit.map(({ id, label, hot }) => (
            <li key={id} data-tone={hot ? "hot" : "cool"}>
              {label}
            </li>
          ))}
        </ul>
      </motion.div>
    </motion.article>
  );
}
