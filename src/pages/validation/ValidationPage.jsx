import { ArrowUpRight, Camera, FlaskConical, Maximize2, Quote } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Masonry from "../../components/Masonry.jsx";
import { VALIDATION_ITEMS, VALIDATION_TAGS } from "../../data/validation.js";
import { useDocumentTitle } from "../../lib/useDocumentTitle.js";
import { useReducedMotion } from "../../lib/useReducedMotion.js";
import FloatingCardLayer from "../../ui/FloatingCards.jsx";
import { useFloatingCards } from "../../ui/floatingCards.js";
import PageHero from "../../ui/PageHero.jsx";
import Pills from "../../ui/Pills.jsx";
import "./validation.css";

const TAG_LABEL = Object.fromEntries(VALIDATION_TAGS.map(({ id, label }) => [id, label]));

// Validation: React Bits' Masonry (patched to hold any kind of tile) of test plans, results,
// photos, and notes. A tile opens a draggable card with the detail and links.
export default function ValidationPage() {
  useDocumentTitle("Validation");
  const reducedMotion = useReducedMotion();
  const [tag, setTag] = useState("all");
  const items = useMemo(
    () => VALIDATION_ITEMS.filter((item) => tag === "all" || item.tag === tag).map((item) => ({ ...item, label: `${item.title}: open details` })),
    [tag],
  );
  const options = [
    { id: "all", label: "All", count: VALIDATION_ITEMS.length },
    ...VALIDATION_TAGS.map(({ id, label }) => ({ id, label, count: VALIDATION_ITEMS.filter((item) => item.tag === id).length })),
  ];

  return (
    <div className="page-shell validation">
      <PageHero
        label="Validation"
        title="Tested, in the open."
        lede="Prototype 1 is in supervised field evaluation. Its test plans, bench results, and field notes will live here as they're ready; for now, every tile is an example of what's coming."
      />
      <div className="validation__bar">
        <Pills label="Show" options={options} value={tag} onChange={setTag} />
        <p className="validation__hint">
          <Maximize2 size={14} aria-hidden="true" />
          Open any tile for the detail
        </p>
      </div>
      <Masonry
        items={items}
        renderItem={renderTile}
        onItemClick={(item, element) => useFloatingCards.getState().open(item, element)}
        animateFrom="bottom"
        stagger={0.04}
        scaleOnHover
        hoverScale={0.97}
        blurToFocus
        reducedMotion={reducedMotion}
        columnCounts={COLUMNS}
        className="validation__grid"
      />
      <FloatingCardLayer render={renderDetail} />
    </div>
  );
}

const COLUMNS = [4, 4, 3, 2];

// ── Tiles: one look per type ──

function renderTile(item) {
  const Tile = TILES[item.type];
  return <Tile item={item} />;
}

function TileMeta({ item }) {
  return (
    <span className="v-tile__meta">
      <span className="v-tile__tag">{TAG_LABEL[item.tag]}</span>
      <span className="example-tag">Example</span>
    </span>
  );
}

const TILES = {
  image: ({ item }) => (
    <div className="v-tile v-tile--image">
      <img src={item.img} alt="" loading="lazy" decoding="async" draggable="false" />
      <div className="v-tile__shade">
        <TileMeta item={item} />
        <p className="v-tile__title">{item.title}</p>
      </div>
    </div>
  ),
  text: ({ item }) => (
    <div className="v-tile v-tile--text">
      <TileMeta item={item} />
      <FlaskConical className="v-tile__icon" size={20} aria-hidden="true" />
      <p className="v-tile__title">{item.title}</p>
      <p className="v-tile__body">{item.body}</p>
      <Status value={item.status} />
    </div>
  ),
  note: ({ item }) => (
    <div className="v-tile v-tile--note">
      <TileMeta item={item} />
      <Quote className="v-tile__quote-mark" size={28} aria-hidden="true" />
      <p className="v-tile__quote">{item.quote}</p>
      <p className="v-tile__title v-tile__title--small">{item.title}</p>
    </div>
  ),
  metric: ({ item }) => (
    <div className="v-tile v-tile--metric">
      <TileMeta item={item} />
      <p className="v-tile__value">{item.value}</p>
      <p className="v-tile__caption">{item.caption}</p>
      <p className="v-tile__title v-tile__title--small">{item.title}</p>
    </div>
  ),
  photo: ({ item }) => (
    <div className="v-tile v-tile--photo">
      <TileMeta item={item} />
      <div className="v-tile__placeholder">
        <Camera size={28} aria-hidden="true" />
        <span>Photo coming</span>
      </div>
      <p className="v-tile__title v-tile__title--small">{item.title}</p>
    </div>
  ),
};

function Status({ value }) {
  if (!value) return null;
  return (
    <span className="v-status" data-status={value.toLowerCase().replace(/\s+/g, "-")}>
      <span className="v-status__dot" aria-hidden="true" />
      {value}
    </span>
  );
}

// ── The card a tile opens ──

function renderDetail(item, titleId) {
  const { body = [], records = [], links = [] } = item.detail ?? {};
  return (
    <div className="v-detail">
      {item.img && <img className="v-detail__img" src={item.img} alt="" />}
      <p className="v-detail__meta">
        <span className="v-tile__tag">{TAG_LABEL[item.tag]}</span>
        <Status value={item.status} />
        <span className="example-tag">Example</span>
      </p>
      <h2 id={titleId} className="v-detail__title">
        {item.title}
      </h2>
      {body.map((paragraph) => (
        <p key={paragraph} className="v-detail__text">
          {paragraph}
        </p>
      ))}
      {records.length > 0 && (
        <>
          <p className="eyebrow v-detail__label">What gets recorded</p>
          <ul className="v-detail__records">
            {records.map((record) => (
              <li key={record}>{record}</li>
            ))}
          </ul>
        </>
      )}
      {links.length > 0 && (
        <ul className="v-detail__links">
          {links.map(({ label, href }) => (
            <li key={href}>
              {href.startsWith("http") ? (
                <a href={href} target="_blank" rel="noreferrer noopener">
                  {label}
                  <ArrowUpRight size={15} aria-hidden="true" />
                  <span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              ) : (
                <Link to={href}>
                  {label}
                  <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
