import { MotionConfig } from "motion/react";
import { useLayoutEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppPage from "./app/AppPage.jsx";
import GradualBlur from "./components/GradualBlur.jsx";
import SceneCanvas from "./explorer/SceneCanvas.jsx";
import Home from "./home/Home.jsx";
import ContactPage from "./pages/contact/ContactPage.jsx";
import MediaPage from "./pages/media/MediaPage.jsx";
import NotFound from "./pages/NotFound.jsx";
import PlaceholderPage from "./pages/PlaceholderPage.jsx";
import TeamPage from "./pages/team/TeamPage.jsx";
import ValidationPage from "./pages/validation/ValidationPage.jsx";
import Footer from "./site/Footer.jsx";
import Header from "./site/Header.jsx";
import { PAGES, REDIRECTS } from "./site/pages.js";
import ScrollManager from "./site/ScrollManager.jsx";
import { THEMES, usePageTheme } from "./site/theme.js";
import "./site/site.css";

// Pages with content of their own; the rest are placeholders until theirs arrives.
const PAGE_ELEMENTS = {
  "/app": <AppPage />,
  "/team": <TeamPage />,
  "/validation": <ValidationPage />,
  "/media": <MediaPage />,
  "/contact": <ContactPage />,
};

// Every page shares the fixed 3D canvas (the Topography backdrop, and the model on home), the glass
// header, the footer, the cursor glow, and the soft blur at the top and bottom of the window.
// Each page's palette (src/site/pages.js) is applied to <html> before it paints.
export default function App() {
  const theme = usePageTheme();
  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", THEMES[theme].chrome);
  }, [theme]);

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
            <Route key={path} path={path} element={PAGE_ELEMENTS[path] ?? <PlaceholderPage title={label} />} />
          ))}
          {REDIRECTS.map(({ from, to }) => (
            <Route key={from} path={from} element={<Navigate to={to} replace />} />
          ))}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
      <GradualBlur target="page" position="top" height="7rem" strength={2} divCount={5} curve="bezier" zIndex={20} />
      <GradualBlur target="page" position="bottom" height="4.5rem" strength={2} divCount={5} curve="bezier" zIndex={20} />
    </MotionConfig>
  );
}
