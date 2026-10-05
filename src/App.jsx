import { MotionConfig } from "motion/react";
import { Route, Routes } from "react-router-dom";
import GradualBlur from "./components/GradualBlur.jsx";
import SceneCanvas from "./explorer/SceneCanvas.jsx";
import Home from "./home/Home.jsx";
import NotFound from "./pages/NotFound.jsx";
import PlaceholderPage from "./pages/PlaceholderPage.jsx";
import Footer from "./site/Footer.jsx";
import Header from "./site/Header.jsx";
import { PAGES } from "./site/pages.js";
import ScrollManager from "./site/ScrollManager.jsx";
import SiteGlow from "./site/SiteGlow.jsx";
import "./site/site.css";

// Every page shares the fixed 3D canvas (the Topography backdrop, and the model on home), the glass
// header, the footer, the cursor glow, and the soft blur at the top and bottom of the window.
export default function App() {
  return (
    // reducedMotion="user": Motion drops transform animations for people who ask for less motion.
    <MotionConfig reducedMotion="user">
      <a className="skip-link" href="#content">
        Skip to content
      </a>
      <SceneCanvas />
      <ScrollManager />
      <Header />
      <main id="content" className="site-main">
        <Routes>
          <Route index element={<Home />} />
          {PAGES.map(({ path, label }) => (
            <Route key={path} path={path} element={<PlaceholderPage title={label} />} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <GradualBlur target="page" position="top" height="7rem" strength={2} divCount={5} curve="bezier" zIndex={20} />
      <GradualBlur target="page" position="bottom" height="4.5rem" strength={2} divCount={5} curve="bezier" zIndex={20} />
      <SiteGlow />
    </MotionConfig>
  );
}
