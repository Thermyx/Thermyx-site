import { motion } from "motion/react";
import { useId } from "react";

// A row of filter pills with a thumb that slides to the chosen one, and a count on each.
// `options`: [{ id, label, count }].
export default function Pills({ options, value, onChange, label }) {
  const thumb = useId();
  return (
    <div className="pills" role="group" aria-label={label}>
      {options.map(({ id, label: text, count }) => (
        <button key={id} type="button" className="pill" aria-pressed={id === value} onClick={() => onChange(id)}>
          {id === value && <motion.span layoutId={thumb} className="pill__thumb" transition={{ type: "spring", stiffness: 460, damping: 36 }} />}
          <span className="pill__label">{text}</span>
          {count !== undefined && <span className="pill__count">{count}</span>}
        </button>
      ))}
    </div>
  );
}
