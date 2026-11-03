import CountUp from "../components/CountUp.jsx";
import SpotlightCard from "../components/SpotlightCard.jsx";
import { ARCH_SITE, FOOT_HEIGHT, FOOT_WIDTH, footPath, footPoint } from "../data/foot.js";
import SectionHead from "../ui/SectionHead.jsx";

// Source: the app README, "Thermyx is a pair" and "What the pair makes possible", and
// Models/ML/AsymmetryMonitor.swift (3 of the last 5 minutes, against the wearer's own usual).
const GAPS = [
  { title: "Temperature gap", body: "How far apart your feet run, over time." },
  { title: "Arch load gap", body: "How much harder one arch presses down than the other. There is one pressure sensor, under the arch." },
  { title: "Gait-stability gap", body: "Whether one foot's steps are less steady than the other's." },
];

export default function Pair() {
  return (
    <section id="pair" className="section" aria-labelledby="pair-title">
      <div className="section__inner">
        <SectionHead
          index="01"
          label="The pair"
          titleId="pair-title"
          title="Two feet, compared in real time."
          lede="Each insole keeps its own Bluetooth link, so the app can compare your feet against each other, not just against their own past."
        />

        <div className="bento">
          <SpotlightCard className="tile tile--soles" spotlightColor="rgb(91 210 255 / 0.16)">
            <SoleDiagram />
            <div className="tile__foot">
              <p className="tile__kicker eyebrow">Never averaged</p>
              <p className="tile__text">
                No value from one foot is ever shown for the other, and no chart averages the two into one line. Averaging
                would erase the difference a pair exists to reveal.
              </p>
            </div>
          </SpotlightCard>

          <SpotlightCard className="tile tile--gaps" spotlightColor="rgb(91 210 255 / 0.14)">
            <p className="tile__kicker eyebrow">What the pair compares</p>
            <ul className="gaps">
              {GAPS.map(({ title, body }) => (
                <li key={title} className="gaps__row">
                  <span className="mono gaps__tag" aria-hidden="true">
                    L ⇄ R
                  </span>
                  <div>
                    <h3 className="gaps__title">{title}</h3>
                    <p className="gaps__body">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </SpotlightCard>

          <SpotlightCard className="tile tile--hold" spotlightColor="rgb(255 106 19 / 0.14)">
            <p className="tile__kicker eyebrow">Sustained, not momentary</p>
            <p className="tile__big">
              <span className="visually-hidden">3 of the last 5 minutes</span>
              <span aria-hidden="true">
                <CountUp to={3} duration={1.2} className="tile__big-number" />
                <span className="tile__big-unit">of 5 min</span>
              </span>
            </p>
            <p className="tile__text">
              Heavy leaning or a limp raises a caution only once it holds for 3 of the last 5 minutes, judged against your own
              usual. Ordinary walking, where weight swaps feet every step, never trips it, and it never goes past Caution on
              its own.
            </p>
          </SpotlightCard>

          <SpotlightCard className="tile tile--one" spotlightColor="rgb(91 210 255 / 0.14)">
            <p className="tile__kicker eyebrow">One foot is fine too</p>
            <h3 className="tile__title">One connected and one not is a normal state, not an error.</h3>
            <p className="tile__text">
              The live foot keeps the space it needs, and the missing one shrinks to a tab at the edge of the screen, one
              tap from pairing.
            </p>
          </SpotlightCard>
        </div>
      </div>
    </section>
  );
}

// A left and a right foot, the app's own outlines with medial edges facing, each with the one arch
// pressure sensor the app reads and the comparison running between them. Faint inner contours
// echo the app's foot maps. A diagram, not data: there are no readings in it.
const H = 236;
const FEET = [
  { foot: "left", x: 22, label: "L" },
  { foot: "right", x: 238 - (FOOT_WIDTH * H) / FOOT_HEIGHT, label: "R" },
];
const CONTOURS = [0.78, 0.56, 0.34];

function SoleDiagram() {
  const arches = FEET.map(({ foot, x }) => footPoint(foot, ARCH_SITE, { x, y: 12, height: H }));
  const [[ax1, ay], [ax2]] = arches;
  return (
    <figure className="soles" role="img" aria-label="Diagram: a left and a right insole, medial edges facing, each with one pressure sensor under the arch, compared side to side.">
      <svg viewBox="0 0 260 276" role="presentation" aria-hidden="true">
        <defs>
          <linearGradient id="sole-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5bd2ff" stopOpacity="0.22" />
            <stop offset="0.55" stopColor="#5bd2ff" stopOpacity="0.06" />
            <stop offset="1" stopColor="#ff6a13" stopOpacity="0.2" />
          </linearGradient>
        </defs>
        {FEET.map(({ foot, x, label }) => {
          const d = footPath(foot, { x, y: 12, height: H });
          const cx = x + (FOOT_WIDTH * H) / FOOT_HEIGHT / 2;
          return (
            <g key={foot}>
              <path d={d} className="soles__outline" fill="url(#sole-fill)" />
              {CONTOURS.map((k) => (
                <path
                  key={k}
                  d={d}
                  className="soles__contour"
                  style={{ transformOrigin: `${cx}px ${12 + H * 0.56}px`, transform: `scale(${k})` }}
                />
              ))}
              <text x={cx} y={270} className="soles__label" textAnchor="middle">
                {label}
              </text>
            </g>
          );
        })}
        <line className="soles__link" x1={ax1 + 10} y1={ay} x2={ax2 - 10} y2={ay} />
        <text x={(ax1 + ax2) / 2} y={ay - 9} className="soles__zone" textAnchor="middle">
          Arch
        </text>
        {arches.map(([cx, cy], i) => (
          <g key={i} transform={`translate(${cx} ${cy})`}>
            <circle className="soles__halo" r="11" style={{ animationDelay: `${i * 0.3}s` }} />
            <circle className="soles__dot" r="4" />
          </g>
        ))}
      </svg>
    </figure>
  );
}
