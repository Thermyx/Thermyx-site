import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { Mesh, Scene } from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import CalloutTracker from "./CalloutTracker.jsx";
import ExplodeMotion from "./ExplodeMotion.jsx";
import { disposeAssembly, useAssembly } from "./model.js";
import PartPicking from "./PartPicking.jsx";
import PartVisuals from "./PartVisuals.jsx";

export default function Assembly({ onReady }) {
  const assembly = useAssembly();

  useEffect(() => () => disposeAssembly(assembly), [assembly]);
  useEffect(() => {
    onReady(assembly);
  }, [assembly, onReady]);

  return (
    <>
      <primitive object={assembly.root} />
      <PartVisuals parts={assembly.parts} />
      <PartPicking parts={assembly.parts} />
      <ExplodeMotion assembly={assembly} />
      <CalloutTracker assembly={assembly} />
      <ShaderWarmUp parts={assembly.parts} />
    </>
  );
}

// Compiles the x-ray, dimmed, and highlight shaders up front (in a staging scene that is never
// drawn) so the first hover doesn't stall while they compile.
function ShaderWarmUp({ parts }) {
  const get = useThree((state) => state.get);

  useEffect(() => {
    // Deferred a tick so StrictMode's throwaway mount cancels it before it starts: compiling
    // materials that cleanup is about to dispose would poll deleted programs.
    const timer = setTimeout(() => {
      const { gl, scene, camera } = get();
      const staging = new Scene();
      for (const { mesh, alt, highlight } of parts) {
        staging.add(new Mesh(mesh.geometry, alt), new LineSegments2(highlight.geometry, highlight.material));
      }
      gl.compileAsync(staging, camera, scene)
        .catch(() => {}) // best effort; shaders compile on first use otherwise
        .finally(() => staging.clear());
    });
    return () => clearTimeout(timer);
  }, [get, parts]);

  return null;
}
