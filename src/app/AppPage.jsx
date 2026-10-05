import "@fontsource/instrument-serif/400.css";
import "@fontsource/instrument-serif/400-italic.css";
import { useDocumentTitle } from "../lib/useDocumentTitle.js";
import { AppCta, ControlSection, PairSection, SafetySection, TrustSection } from "./AppSections.jsx";
import AppTour from "./AppTour.jsx";
import PrismBackdrop from "./PrismBackdrop.jsx";
import "./app.css";

// The app page: its own cream world, set in Instrument Serif over React Bits' Prism, in the same
// blue and orange as the rest of the site. A tour of the app beside a 3D phone, then the control
// bar, the pair, safety, privacy, the app's founding rule, and the way to get it.
export default function AppPage() {
  useDocumentTitle("App");
  return (
    <div className="app-page">
      <PrismBackdrop />
      <AppTour />
      <ControlSection />
      <PairSection />
      <SafetySection />
      <TrustSection />
      <AppCta />
    </div>
  );
}
