import { useThree } from "@react-three/fiber";
import { useEffect } from "react";
import { PMREMGenerator } from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

// The lighting rig that works with the CAD materials (§3.12): a PMREM-filtered RoomEnvironment
// for reflections, plus a hemisphere fill and one directional key.
export default function Lighting() {
  const get = useThree((state) => state.get);

  useEffect(() => {
    const { gl, scene } = get();
    const pmrem = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const envMap = pmrem.fromScene(room).texture;
    room.dispose();
    scene.environment = envMap;

    return () => {
      if (scene.environment === envMap) scene.environment = null;
      envMap.dispose();
      pmrem.dispose();
    };
  }, [get]);

  return (
    <>
      <hemisphereLight args={[0xdfe8ff, 0x1a1f2b, 0.5]} />
      <directionalLight position={[3, 5, 4]} intensity={1.3} />
    </>
  );
}
