import BlurText from "../components/BlurText.jsx";
import SplitText from "../components/SplitText.jsx";
import { useReducedMotion } from "../lib/useReducedMotion.js";

// A section's opening: a numbered label, the title (React Bits SplitText: characters rise in as it
// scrolls into view), and an optional lede (BlurText: words sharpen in). Under reduced motion the
// title is plain text.
export default function SectionHead({ index, label, title, titleId, lede, align = "left", children }) {
  const reducedMotion = useReducedMotion();
  return (
    <header className="section-head" data-align={align}>
      <p className="section-head__label">
        <span className="mono section-head__index">{index}</span>
        <span style={{ width: '40px', height: '1px', background: 'linear-gradient(90deg, var(--ice), var(--ember))' }} aria-hidden="true" />
        <span className="eyebrow">{label}</span>
      </p>
      <h2 id={titleId} className="section-head__title">
        {reducedMotion ? (
          title
        ) : (
          <SplitText
            tag="span"
            text={title}
            className="section-head__split"
            splitType="words, chars"
            delay={16}
            duration={0.9}
            ease="power4.out"
            from={{ opacity: 0, y: "0.6em" }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.2}
            rootMargin="-60px"
            textAlign={align}
          />
        )}
      </h2>
      {lede && (
        <BlurText text={lede} className="section-head__lede" animateBy="words" direction="bottom" delay={22} stepDuration={0.28} />
      )}
      {children}
    </header>
  );
}
