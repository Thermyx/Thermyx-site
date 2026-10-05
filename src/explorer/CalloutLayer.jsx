import { useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { componentById, PRODUCT_NAMES } from "../data/components.js";
import { calloutElements, calloutPositions, clampInto, selectVisible, useCallouts } from "./callouts.js";
import { ACCENT_CSS, HEAT_PATH_PREFIXES } from "./constants.js";
import "./Callouts.css";

// The cards and their leader lines. Each card is joined to its part by a line and a dot; the
// in-canvas tracker moves them every frame. A hovered part's card is a preview that ignores the
// pointer (so it can't steal the hover); pinned cards can be dragged anywhere on the stage.
export default function CalloutLayer({ stageRef }) {
  const visible = useCallouts(useShallow(selectVisible));
  const pinned = useCallouts((s) => s.pinned);

  return (
    <div className="callouts">
      <svg className="callouts__lines" aria-hidden="true">
        {visible.map((id) => (
          <g key={id} ref={register(id, "group")} style={{ "--accent": accentOf(id) }}>
            <line ref={register(id, "line")} />
            <g ref={register(id, "dot")}>
              <circle className="callouts__halo" r="9" />
              <circle className="callouts__dot" r="3.5" />
            </g>
            <circle ref={register(id, "end")} className="callouts__end" r="2.5" />
          </g>
        ))}
      </svg>
      {visible.map((id) => (
        <CalloutCard key={id} id={id} pinned={pinned.includes(id)} stageRef={stageRef} />
      ))}
    </div>
  );
}

function CalloutCard({ id, pinned, stageRef }) {
  const part = componentById(id);
  const drag = useRef(null);

  const onPointerDown = (event) => {
    const pos = calloutPositions.get(id);
    if (!pinned || !pos || event.button !== 0) return;
    const stage = stageRef.current.getBoundingClientRect();
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { stage, grabX: event.clientX - stage.left - pos.x, grabY: event.clientY - stage.top - pos.y };
    event.currentTarget.dataset.dragging = "";
  };
  const onPointerMove = (event) => {
    const pos = calloutPositions.get(id);
    if (!drag.current || !pos) return;
    const { stage, grabX, grabY } = drag.current;
    pos.x = event.clientX - stage.left - grabX;
    pos.y = event.clientY - stage.top - grabY;
    clampInto(pos, { width: stage.width, height: stage.height });
    event.currentTarget.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
  };
  const onPointerEnd = (event) => {
    drag.current = null;
    delete event.currentTarget.dataset.dragging;
  };

  return (
    <article
      ref={register(id, "box")}
      className="callout"
      data-pinned={pinned || undefined}
      style={{ "--accent": accentOf(id) }}
      aria-label={part.label}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerEnd}
      onPointerCancel={onPointerEnd}
    >
      <p className="callout__product">{PRODUCT_NAMES[part.product]}</p>
      <h3 className="callout__title">{part.label}</h3>
      <p className="callout__role">{part.role}</p>
      {part.part && <p className="callout__part">{part.part}</p>}
    </article>
  );
}

function accentOf(id) {
  return HEAT_PATH_PREFIXES.includes(id) ? ACCENT_CSS.hot : ACCENT_CSS.cool;
}

// Ref callback that files a card's DOM node under its id for the tracker (React 19 cleanup).
function register(id, key) {
  return (node) => {
    const entry = calloutElements.get(id) ?? {};
    entry[key] = node;
    calloutElements.set(id, entry);
    return () => {
      const current = calloutElements.get(id);
      if (!current) return;
      delete current[key];
      if (!Object.keys(current).length) calloutElements.delete(id);
    };
  };
}
