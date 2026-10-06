import { GripHorizontal, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useId, useRef } from "react";
import { createPortal } from "react-dom";
import { clamp, MARGIN, TOP, useFloatingCards, WIDTH } from "./floatingCards.js";
import "./floating.css";

// The layer: renders every open card with `render(item, titleId)` for its body.
export default function FloatingCardLayer({ render }) {
  const cards = useFloatingCards((s) => s.cards);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      const { cards: open, close } = useFloatingCards.getState();
      if (!open.length) return;
      close(open.reduce((a, b) => (a.z > b.z ? a : b)).key);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Leaving the page closes them.
  useEffect(() => () => useFloatingCards.getState().closeAll(), []);

  return createPortal(
    <div className="floating-layer">
      <AnimatePresence>
        {cards.map((card) => (
          <FloatingCard key={card.key} card={card} render={render} />
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  );
}

function FloatingCard({ card, render }) {
  const titleId = useId();
  const ref = useRef(null);
  const closeRef = useRef(null);
  const drag = useRef(null);
  const { raise, move, close } = useFloatingCards.getState();

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
  }, []);

  const onPointerDown = (event) => {
    if (event.button !== 0 || event.target.closest("button")) return;
    raise(card.key);
    drag.current = { dx: event.clientX - card.x, dy: event.clientY - card.y, x: card.x, y: card.y };
    event.currentTarget.setPointerCapture(event.pointerId);
    ref.current.dataset.dragging = "";
  };
  const onPointerMove = (event) => {
    if (!drag.current) return;
    const { width, height } = ref.current.getBoundingClientRect();
    drag.current.x = clamp(event.clientX - drag.current.dx, MARGIN, window.innerWidth - width - MARGIN);
    drag.current.y = clamp(event.clientY - drag.current.dy, TOP, Math.max(TOP, window.innerHeight - Math.min(height, 120)));
    ref.current.style.left = `${drag.current.x}px`;
    ref.current.style.top = `${drag.current.y}px`;
  };
  const onPointerUp = () => {
    if (!drag.current) return;
    move(card.key, drag.current.x, drag.current.y);
    drag.current = null;
    delete ref.current.dataset.dragging;
  };

  return (
    <motion.section
      ref={ref}
      className="floating-card"
      role="dialog"
      aria-labelledby={titleId}
      style={{ left: card.x, top: card.y, zIndex: card.z, width: `min(${WIDTH}px, calc(100vw - ${MARGIN * 2}px))` }}
      initial={{ opacity: 0, scale: 0.94, y: 12, filter: "blur(6px)" }}
      animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.14 } }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      onPointerDownCapture={() => raise(card.key)}
    >
      <div
        className="floating-card__bar"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <GripHorizontal size={16} aria-hidden="true" className="floating-card__grip" />
        <span className="floating-card__drag">Drag to move</span>
        <button ref={closeRef} type="button" className="floating-card__close" onClick={() => close(card.key)} aria-label="Close">
          <X size={16} aria-hidden="true" />
        </button>
      </div>
      <div className="floating-card__body">{render(card.item, titleId)}</div>
    </motion.section>
  );
}

