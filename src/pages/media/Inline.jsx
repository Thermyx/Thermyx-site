// Text with the app's one inline mark, `*italics*` (journal names and volumes in APA references).
export default function Inline({ text }) {
  return text.split(/\*([^*]+)\*/).map((part, i) => (i % 2 ? <em key={i}>{part}</em> : part));
}
