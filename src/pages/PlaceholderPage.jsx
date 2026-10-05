import { useDocumentTitle } from "../lib/useDocumentTitle.js";

// Scaffolding for a page whose content hasn't been written yet: its title (for the tab and
// screen readers) and the word "placeholder".
export default function PlaceholderPage({ title }) {
  useDocumentTitle(title);
  return (
    <section className="page page--placeholder" aria-labelledby="page-title">
      <h1 id="page-title" className="page__title">
        Placeholder
      </h1>
    </section>
  );
}
