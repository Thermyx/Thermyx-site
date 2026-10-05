import CountUp from "../components/CountUp.jsx";
import SpotlightCard from "../components/SpotlightCard.jsx";
import SectionHead from "../ui/SectionHead.jsx";

// Source: the app README, "Thermyx is a pair" and "What the pair makes possible".
const GAPS = [
  { title: "Temperature gap", body: "How far apart your feet run, over time." },
  { title: "Load gap", body: "How much more of your weight one forefoot carries than the other." },
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
              <span className="visually-hidden">2 minutes</span>
              <span aria-hidden="true">
                <CountUp to={2} duration={1.2} className="tile__big-number" />
                <span className="tile__big-unit">min</span>
              </span>
            </p>
            <p className="tile__text">
              A gap that holds for two minutes raises a caution. Shorter ones are ordinary walking noise, and are ignored.
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

// A left and a right sole, medial edges facing as the app draws them, with the three force
// sensors under each (heel, arch, forefoot) and the comparisons running between them. A diagram,
// not data: there are no readings in it.
const SOLE = "M50 256C31 256 22 241 22 216C22 188 18 160 14 128C10 98 7 74 10 52C14 24 34 4 60 4C82 4 95 22 94 48C93 74 84 96 78 118C72 140 71 162 75 186C79 210 75 256 50 256Z";
// Sensor positions on the left sole, and where its inner (medial) edge is at that height.
const ZONES = [
  { name: "Forefoot", x: 62, y: 66, edge: 93 },
  { name: "Arch", x: 36, y: 150, edge: 73 },
  { name: "Heel", x: 49, y: 222, edge: 78 },
];

function SoleDiagram() {
  return (
    <figure className="soles" role="img" aria-label="Diagram: a left and a right insole, each with sensors at the heel, arch, and forefoot, compared side to side.">
      <svg viewBox="-20 -10 300 280" role="presentation" aria-hidden="true">
        <defs>
          <linearGradient id="sole-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#5bd2ff" stopOpacity="0.16" />
            <stop offset="1" stopColor="#ff6a13" stopOpacity="0.1" />
          </linearGradient>
        </defs>
        {ZONES.map(({ name, y, edge }, i) => (
          <line
            key={name}
            className="soles__link"
            x1={edge + 8}
            y1={y}
            x2={260 - edge - 8}
            y2={y}
            style={{ animationDelay: `${i * 0.4}s` }}
          />
        ))}
        {[false, true].map((mirrored) => (
          <g key={String(mirrored)} transform={mirrored ? "translate(260 0) scale(-1 1)" : undefined}>
            <path d={SOLE} className="soles__outline" fill="url(#sole-fill)" />
            {ZONES.map(({ name, x, y }, i) => (
              <g key={name} transform={`translate(${x} ${y})`}>
                <circle className="soles__halo" r="11" style={{ animationDelay: `${i * 0.4 + (mirrored ? 0.2 : 0)}s` }} />
                <circle className="soles__dot" r="4" />
              </g>
            ))}
          </g>
        ))}
        <text x="50" y="276" className="soles__label" textAnchor="middle">
          L
        </text>
        <text x="210" y="276" className="soles__label" textAnchor="middle">
          R
        </text>
        {ZONES.map(({ name, y }) => (
          <text key={name} x="130" y={y - 8} className="soles__zone" textAnchor="middle">
            {name}
          </text>
        ))}
      </svg>
    </figure>
  );
}
