import { Canvas, useThree } from "@react-three/fiber";
import { Suspense, useEffect } from "react";
import { useReducedMotion } from "../lib/useReducedMotion.js";
import { usePageTheme } from "../site/theme.js";
import Assembly from "./Assembly.jsx";
import CameraRig from "./CameraRig.jsx";
import { useCallouts } from "./callouts.js";
import { BG, CAMERA, DPR, GL } from "./constants.js";
import ErrorBoundary from "./ErrorBoundary.jsx";
import Lighting from "./Lighting.jsx";
import TeamStar from "../pages/team/TeamStar.jsx";
import "./SceneCanvas.css";
import { stageScroll, useModel, useStage } from "./story.js";
import TopographyBackdrop from "./TopographyBackdrop.jsx";

const onReady = () => useModel.setState({ status: "ready" });
const onModelError = () => useModel.setState({ status: "error" });
const onCanvasError = () => useModel.setState({ status: "unsupported" });

// The one WebGL canvas, fixed behind every page: the Topography backdrop everywhere, on the home
// page the 3D model (CameraRig hides it elsewhere), and on the Team page its crystal cards. One canvas because the glass needs the
// backdrop inside its scene to refract it (see TopographyBackdrop), and one context is cheaper
// than two. The model streams in behind its own boundary, so a failed load leaves the backdrop up.
// Cream pages have their own backdrop: there the canvas is hidden and its loop stopped.
export default function SceneCanvas() {
  const attempt = useModel((s) => s.attempt);
  const reducedMotion = useReducedMotion();
  const hidden = usePageTheme() !== "dark";

  return (
    <div className="scene" aria-hidden="true" data-hidden={hidden || undefined}>
      <ErrorBoundary onError={onCanvasError}>
        <Canvas
          gl={GL}
          dpr={DPR}
          camera={CAMERA}
          frameloop={hidden ? "never" : reducedMotion ? "demand" : "always"}
          onCreated={exposeForDebugging}
        >
          {/* Opaque background: the glass refracts it (§3.3). */}
          <color attach="background" args={[BG]} />
          <TopographyBackdrop />
          <Lighting />
          {/* The Team page's crystal cards (drawn only while it's open). */}
          <TeamStar />
          <ErrorBoundary key={attempt} onError={onModelError}>
            <Suspense fallback={null}>
              <Assembly onReady={onReady} />
              <CameraRig />
            </Suspense>
          </ErrorBoundary>
          {reducedMotion && <RenderOnChange />}
        </Canvas>
      </ErrorBoundary>
    </div>
  );
}

// Reduced motion renders on demand: nothing moves by itself, so a frame is drawn only when the
// scroll position, the window, the pointer, or the stage's state changes.
function RenderOnChange() {
  const invalidate = useThree((state) => state.invalidate);
  useEffect(() => {
    const render = () => invalidate();
    const options = { passive: true };
    window.addEventListener("scroll", render, options);
    window.addEventListener("resize", render);
    window.addEventListener("pointermove", render, options);
    window.addEventListener("pointerup", render, options);
    const stores = [useCallouts, useStage, useModel].map((store) => store.subscribe(render));
    return () => {
      window.removeEventListener("scroll", render, options);
      window.removeEventListener("resize", render);
      window.removeEventListener("pointermove", render, options);
      window.removeEventListener("pointerup", render, options);
      stores.forEach((unsubscribe) => unsubscribe());
    };
  }, [invalidate]);
  return null;
}

// Dev-only handle for inspecting the live scene from the console or automated checks.
function exposeForDebugging(state) {
  if (import.meta.env.DEV) {
    window.__thermyx = { get: state.get, callouts: useCallouts, stage: useStage, model: useModel, stageScroll };
  }
}
