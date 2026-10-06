'use client';

// Thermyx patches (marked below) on React Bits' BounceCards:
//   - `items` + `renderCard(item, index)` render any card face (the original took image URLs only;
//     `images` still works); `getId(item)` keys the cards so they keep their identity.
//   - the cards' transforms are owned by GSAP (not inline styles), so when the order of `items`
//     changes the cards gather into a deck and deal out to their new places, instead of jumping.
//   - the entrance deals the fan out of a deck (the original scaled each card up from 0).
//   - cards are keyboard-operable buttons (`getLabel`, `onCardClick`); focus fans the hand like hover.
//   - `hiddenIndex` hides one card (the one drawn out of the hand); `pushDistance` sets how far
//     the neighbours step aside; class names are scoped (the original used a global `.card`).

import { useEffect, useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import './BounceCards.css';

export default function BounceCards({
  className = '',
  images = [],
  items,
  renderCard,
  getId = (item, i) => i,
  getLabel,
  onCardClick,
  hiddenIndex = -1,
  pushDistance = 160,
  reducedMotion = false,
  containerWidth = 400,
  containerHeight = 400,
  animationDelay = 0.5,
  animationStagger = 0.06,
  easeType = 'elastic.out(1, 0.8)',
  transformStyles = [
    'rotate(10deg) translate(-170px)',
    'rotate(5deg) translate(-85px)',
    'rotate(-3deg)',
    'rotate(-10deg) translate(85px)',
    'rotate(2deg) translate(170px)'
  ],
  enableHover = false
}) {
  const containerRef = useRef(null);
  const list = items ?? images;
  const order = list.map((item, i) => String(getId(item, i))).join('|');
  const styles = transformStyles.join('|');
  const lastOrder = useRef(null);
  const lastStyles = useRef(null);
  const stylesRef = useRef(transformStyles);
  const dealRef = useRef(null);

  useLayoutEffect(() => {
    stylesRef.current = transformStyles;
  });

  // Thermyx patch: GSAP places every card. First run: deal out of a deck. Later runs (the order
  // changed): gather into the deck, then deal to the new places. The deal starts a tick later so
  // StrictMode's throwaway first run cancels before anything moves. Cleanup only cancels a deal
  // that hasn't started: React can disconnect and reconnect these effects after the deal is under
  // way (StrictMode does), and killing it there left the cards dealt but still invisible.
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const cards = list.map((item, i) => container.querySelector(`[data-card-id="${CSS.escape(String(getId(item, i)))}"]`));
    const place = i => stylesRef.current[i] ?? 'none';
    const deck = i => `rotate(${(i % 2 ? 1 : -1) * (2 + i)}deg) translate(0px)`;
    const first = lastOrder.current === null;
    const changed = !first && lastOrder.current !== order;

    if (reducedMotion) {
      dealRef.current?.kill();
      lastOrder.current = order;
      cards.forEach((card, i) => gsap.set(card, { transform: place(i), opacity: 1, y: 0 }));
      return;
    }
    if (!first && !changed) return;
    if (first) cards.forEach((card, i) => gsap.set(card, { transform: deck(i), opacity: 0, y: 40 }));

    const timer = setTimeout(() => {
      lastOrder.current = order;
      dealRef.current?.kill();
      const tl = (dealRef.current = gsap.timeline());
      if (first) {
        tl.to(cards, { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: 'power2.out', delay: animationDelay });
      } else {
        tl.to(cards, { transform: deck, opacity: 1, duration: 0.38, stagger: 0.03, ease: 'power3.in' });
        tl.to({}, { duration: 0.14 });
      }
      tl.addLabel('deal');
      cards.forEach((card, i) => {
        tl.to(card, { transform: place(i), duration: 0.9, ease: easeType }, `deal+=${i * animationStagger * 2}`);
      });
    });
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order, reducedMotion]);

  // Thermyx patch: keep the transforms right if the layout (transformStyles) changes size. Only on
  // a real change, not when React reconnects the effect (that tween would fight the deal).
  useEffect(() => {
    const container = containerRef.current;
    const previous = lastStyles.current;
    lastStyles.current = styles;
    if (!container || previous === null || previous === styles || lastOrder.current === null) return;
    dealRef.current?.progress(1);
    list.forEach((item, i) => {
      const card = container.querySelector(`[data-card-id="${CSS.escape(String(getId(item, i)))}"]`);
      gsap.to(card, { transform: transformStyles[i] ?? 'none', opacity: 1, duration: reducedMotion ? 0 : 0.4, ease: 'power2.out' });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [styles]);

  const getNoRotationTransform = transformStr => {
    const hasRotate = /rotate\([\s\S]*?\)/.test(transformStr);
    if (hasRotate) {
      return transformStr.replace(/rotate\([\s\S]*?\)/, 'rotate(0deg)');
    } else if (transformStr === 'none') {
      return 'rotate(0deg)';
    } else {
      return `${transformStr} rotate(0deg)`;
    }
  };

  const getPushedTransform = (baseTransform, offsetX) => {
    const translateRegex = /translate\(([-0-9.]+)px\)/;
    const match = baseTransform.match(translateRegex);
    if (match) {
      const currentX = parseFloat(match[1]);
      const newX = currentX + offsetX;
      return baseTransform.replace(translateRegex, `translate(${newX}px)`);
    } else {
      return baseTransform === 'none' ? `translate(${offsetX}px)` : `${baseTransform} translate(${offsetX}px)`;
    }
  };

  // Thermyx patch: hover kills every tween on a card, the entrance fade included, so the hover
  // tweens also bring the card to full opacity (a hover mid-deal can't leave a card invisible).
  const pushSiblings = hoveredIdx => {
    if (!enableHover || !containerRef.current || reducedMotion) return;

    const q = gsap.utils.selector(containerRef);

    list.forEach((_, i) => {
      const target = q(`.bounce-card-${i}`);
      gsap.killTweensOf(target);

      const baseTransform = transformStyles[i] || 'none';

      if (i === hoveredIdx) {
        const noRotationTransform = getNoRotationTransform(baseTransform);
        gsap.to(target, {
          transform: noRotationTransform,
          opacity: 1,
          duration: 0.4,
          ease: 'back.out(1.4)',
          overwrite: 'auto'
        });
      } else {
        const offsetX = i < hoveredIdx ? -pushDistance : pushDistance;
        const pushedTransform = getPushedTransform(baseTransform, offsetX);

        const distance = Math.abs(hoveredIdx - i);
        const delay = distance * 0.05;

        gsap.to(target, {
          transform: pushedTransform,
          opacity: 1,
          duration: 0.4,
          ease: 'back.out(1.4)',
          delay,
          overwrite: 'auto'
        });
      }
    });
  };

  const resetSiblings = () => {
    if (!enableHover || !containerRef.current || reducedMotion) return;

    const q = gsap.utils.selector(containerRef);

    list.forEach((_, i) => {
      const target = q(`.bounce-card-${i}`);
      gsap.killTweensOf(target);
      const baseTransform = transformStyles[i] || 'none';
      gsap.to(target, {
        transform: baseTransform,
        opacity: 1,
        duration: 0.4,
        ease: 'back.out(1.4)',
        overwrite: 'auto'
      });
    });
  };

  return (
    <div
      className={`bounce-cards ${className}`.trim()}
      ref={containerRef}
      style={{
        position: 'relative',
        width: containerWidth,
        height: containerHeight
      }}
      onMouseLeave={resetSiblings}
    >
      {list.map((item, idx) => (
        <div
          key={getId(item, idx)}
          data-card-id={getId(item, idx)}
          className={`bounce-card bounce-card-${idx}`}
          data-hidden={idx === hiddenIndex || undefined}
          role={onCardClick ? 'button' : undefined}
          tabIndex={onCardClick ? 0 : undefined}
          aria-label={getLabel?.(item, idx)}
          onClick={e => onCardClick?.(idx, e.currentTarget)}
          onKeyDown={e => {
            if (!onCardClick || (e.key !== 'Enter' && e.key !== ' ')) return;
            e.preventDefault();
            onCardClick(idx, e.currentTarget);
          }}
          onMouseEnter={() => pushSiblings(idx)}
          onFocus={() => pushSiblings(idx)}
          onBlur={resetSiblings}
        >
          {renderCard ? renderCard(item, idx) : <img className="bounce-card__image" src={item} alt={`card-${idx}`} />}
        </div>
      ))}
    </div>
  );
}
