import BlurText from "../components/BlurText.jsx";
import WordRise from "../ui/WordRise.jsx";

// A section's opening on the app page: a numbered label, a serif title whose second half is set
// in italic, and a lede beside it. The title rises in a word at a time as it scrolls into view.
export default function AppHead({ index, label, title: [plain, italic], titleId, lede }) {
  return (
    <header className="app-head">
      <p className="app-head__label">
        <span className="mono app-head__index">{index}</span>
        <span style={{ width: '40px', height: '1px', background: 'linear-gradient(90deg, var(--display-blue), var(--display-orange))' }} aria-hidden="true" />
        <span className="eyebrow">{label}</span>
      </p>
      <h2 id={titleId} className="app-head__title">
        <WordRise text={plain} inView stagger={0.06} />{" "}
        <WordRise as="em" text={italic} inView delay={0.18} stagger={0.06} />
      </h2>
      {lede && <BlurText text={lede} className="app-head__lede" animateBy="words" direction="bottom" delay={20} stepDuration={0.28} />}
    </header>
  );
}
