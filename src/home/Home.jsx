import { useDocumentTitle } from "../lib/useDocumentTitle.js";
import AppSection from "./AppSection.jsx";
import Join from "./Join.jsx";
import Pair from "./Pair.jsx";
import PartsTicker from "./PartsTicker.jsx";
import Safety from "./Safety.jsx";
import Stage from "./Stage.jsx";
import Stats from "./Stats.jsx";
import "./home.css";

// The landing page: the product on its stage, then what it is, what the app does, how it stays
// safe, and the waitlist.
export default function Home() {
  useDocumentTitle(null);
  return (
    <div className="home">
      <Stage />
      <PartsTicker />
      <Stats />
      <Pair />
      <Safety />
      <AppSection />
      <Join />
    </div>
  );
}
