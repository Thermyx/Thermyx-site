import BlurText from "../components/BlurText.jsx";
import SplitText from "../components/SplitText.jsx";
import { useReducedMotion } from "../lib/useReducedMotion.js";
import "./page.css";

// The opening of an inner page: a label, the title (React Bits SplitText: characters rise in), a
// lede (BlurText), and anything the page wants beside them (`aside`).
export default function PageHero({ label, title, lede, aside }) {
  const reducedMotion = useReducedMotion();
  return (
    <header className="page-hero">
      <div className="page-hero__main">
        <p className="page-hero__label">
          <span className="page-hero__dot" aria-hidden="true" />
          <span className="eyebrow">{label}</span>
        </p>
        <h1 className="page-hero__title">
          {reducedMotion ? (
            title
          ) : (
            <SplitText
              tag="span"
              text={title}
              className="page-hero__split"
              splitType="words, chars"
              delay={18}
              duration={1}
              ease="power4.out"
              from={{ opacity: 0, y: "0.55em" }}
              to={{ opacity: 1, y: 0 }}
              threshold={0}
              rootMargin="0px"
              textAlign="left"
            />
          )}
        </h1>
        {lede && <BlurText text={lede} className="page-hero__lede" animateBy="words" direction="bottom" delay={18} stepDuration={0.26} />}
      </div>
      {aside && <div className="page-hero__aside">{aside}</div>}
    </header>
  );
}
