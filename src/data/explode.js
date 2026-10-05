// Exploded-view offsets (CLAUDE.md §5), in mm along Fusion +Z (scene +Y). Starting values;
// tune visually. Every part lifts at once: offset × explode, with explode ∈ [0, 1].
// Keys are prefixes of the sanitized body names, matched longest-first like the manifest.
// Per body, not per manifest entry: Enclosure_Base and Enclosure_Lid separate.
export const EXPLODE_OFFSETS_MM = {
  // ── Insole ──
  Outsole_Layer: -30,
  Insole_Base: 0,
  Enclosure_Base: 20,
  MCU_: 38,
  IMU_: 38,
  Peltier_Driver_: 38,
  Enclosure_Lid: 55,
  Comfort_Top_Layer: 95,
  "Pressure_Sensor_-_": 70,
  Peltier_Module: 30,
  "Temperature_Sensor_-_": 45,
  Fuse_Holder_: 35,
  // ── Power pack ──
  External_Compartment_Shell: 0,
  Battery_Bay_Lid: 70,
  Battery_: 30,
  Heat_Sink_: 30,
  Cooling_Fan_: 50,
};

const BY_SPECIFICITY = Object.keys(EXPLODE_OFFSETS_MM).sort((a, b) => b.length - a.length);

// Offset in mm for a sanitized body name, or null if no prefix matches.
export function findExplodeOffsetMm(nodeName) {
  const key = BY_SPECIFICITY.find((prefix) => nodeName.startsWith(prefix));
  return key === undefined ? null : EXPLODE_OFFSETS_MM[key];
}
