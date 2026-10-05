import { Link } from "react-router-dom";
import { useDocumentTitle } from "../lib/useDocumentTitle.js";

export default function NotFound() {
  useDocumentTitle("Page not found");
  return (
    <section className="page page--placeholder" aria-labelledby="page-title">
      <h1 id="page-title" className="page__title">
        Page not found
      </h1>
      <Link to="/" className="button button--ghost">
        Back to home
      </Link>
    </section>
  );
}
