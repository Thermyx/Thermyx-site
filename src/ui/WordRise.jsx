import { motion } from "motion/react";
import { Fragment } from "react";

const EASE = [0.22, 1, 0.36, 1];

// Text that rises into place a word at a time, each word sliding up out of its own mask with a
// short blur. Plays on mount (key it to replay) or, with `inView`, when scrolled into view. The
// whole string stays readable to screen readers; the animated words are hidden from them.
// Motion's reducedMotion="user" (set in App) drops the slide and keeps the fade.
export default function WordRise({ text, as = "span", className, delay = 0, stagger = 0.045, duration = 0.7, inView = false }) {
  const Tag = motion[as];
  const words = text.split(" ");
  const trigger = inView
    ? { initial: "hidden", whileInView: "shown", viewport: { once: true, margin: "0px 0px -12% 0px" } }
    : { initial: "hidden", animate: "shown" };

  return (
    <Tag className={className} {...trigger} transition={{ staggerChildren: stagger, delayChildren: delay }}>
      <span className="visually-hidden word-rise__sr">{text}</span>
      {words.map((word, i) => (
        // The space sits between the masks: inside one, an inline-block would swallow it.
        <Fragment key={i}>
          <span className="word-rise" aria-hidden="true">
            <motion.span
              className="word-rise__inner"
              variants={{
                hidden: { y: "105%", opacity: 0, filter: "blur(6px)" },
                shown: { y: "0%", opacity: 1, filter: "blur(0px)" },
              }}
              transition={{ duration, ease: EASE }}
            >
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 && " "}
        </Fragment>
      ))}
    </Tag>
  );
}
