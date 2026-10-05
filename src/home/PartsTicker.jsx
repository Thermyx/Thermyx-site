import { COMPONENTS } from "../data/components.js";

// The bill of materials as a slow ticker: every part with a named part number (dimension-only
// entries are left out). Two copies scroll end to end so the loop is seamless; the second is
// hidden from screen readers. Static under reduced motion.
const PARTS = [];
for (const { label, part } of COMPONENTS) {
  if (part && /[A-Za-z]{3,}/.test(part) && !PARTS.some((p) => p.part === part)) {
    PARTS.push({ label: part === "FSR 402" ? "Pressure sensors ×3" : label, part });
  }
}

export default function PartsTicker() {
  return (
    <section className="ticker" aria-labelledby="ticker-title">
      <h2 id="ticker-title" className="ticker__title eyebrow">
        Built from
      </h2>
      <div className="ticker__viewport">
        <div className="ticker__track">
          {[0, 1].map((copy) => (
            <ul key={copy} className="ticker__list" aria-hidden={copy === 1 || undefined}>
              {PARTS.map(({ label, part }) => (
                <li key={part} className="ticker__item">
                  <span className="ticker__label">{label}</span>
                  <span className="mono ticker__part">{part}</span>
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
