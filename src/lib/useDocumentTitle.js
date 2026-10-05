import { useEffect } from "react";

const SITE_TITLE = "Thermyx · Climate control for your feet";

// Sets the tab title for a page ("Team · Thermyx"); no title is the home page.
export function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · Thermyx` : SITE_TITLE;
  }, [title]);
}
