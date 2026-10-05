import CountUp from "../components/CountUp.jsx";
import { COMPONENTS } from "../data/components.js";

// Counts that are facts: the firmware (sensors), the CAD (parts, battery), and the app README
// (one Bluetooth link per insole; hour buckets kept 180 days).
const STATS = [
  { value: 2, label: "insoles, each with its own Bluetooth link to the app" },
  { value: 3, label: "force sensors under each foot: heel, arch, and forefoot" },
  { value: COMPONENTS.length, label: "parts across the insole and its power pack" },
  { value: 10000, unit: "mAh", label: "power bank in a removable bay, outside the shoe" },
  { value: 180, unit: "days", label: "of hour-by-hour history, kept on your phone" },
];

export default function Stats() {
  return (
    <section className="stats" aria-label="Thermyx in numbers">
      <ul className="stats__list">
        {STATS.map(({ value, unit, label }, i) => (
          <li key={label} className="stats__item">
            <p className="stats__value">
              <span className="visually-hidden">
                {value.toLocaleString("en-US")}
                {unit && ` ${unit}`}
              </span>
              <span aria-hidden="true">
                <CountUp to={value} duration={1.6} delay={i * 0.08} separator="," className="stats__number" />
                {unit && <span className="stats__unit">{unit}</span>}
              </span>
            </p>
            <p className="stats__label">{label}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
