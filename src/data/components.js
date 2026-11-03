// Component manifest: one entry per explorable part (CLAUDE.md §6). The owner reviews this copy.
//   match: prefix of the GLTFLoader-sanitized body name (matched longest-first)
//   role:  what the part does in Thermyx, following the app's own part descriptions
//          (ThermyxApp/Views/Onboarding/InsoleStack.swift) and the firmware; no invented specs
//   part:  part number / key spec, only where the CAD body name and firmware agree
export const COMPONENTS = [
  // ── Insole ──
  {
    match: "Comfort_Top_Layer",
    product: "insole",
    label: "Comfort top layer",
    role: "The soft layer your foot rests on, laid over the sensors.",
    part: "3 mm",
  },
  {
    match: "Pressure_Sensor_-_Heel",
    product: "insole",
    label: "Heel pressure sensor",
    role: "A spare spot for a pressure sensor under the heel. Thermyx doesn't read it yet: the arch sensor is the one in use.",
    part: null,
  },
  {
    match: "Pressure_Sensor_-_Arch",
    product: "insole",
    label: "Arch pressure sensor",
    role: "A force-sensing resistor that feels how hard you press down under your arch. Comparing your two feet shows when you lean on one side or limp.",
    part: "FSR 402",
  },
  {
    match: "Pressure_Sensor_-_Forefoot",
    product: "insole",
    label: "Forefoot pressure sensor",
    role: "A spare spot for a pressure sensor under the ball of the foot. Thermyx doesn't read it yet.",
    part: null,
  },
  {
    match: "Peltier_Module",
    product: "insole",
    label: "Peltier module",
    role: "A solid-state heat pump under the heel. Driven one way it cools the foot; reversed, it warms it. The firmware never heats at or above 40 °C.",
    part: "Dilwe TEC1-04901 · 25 × 25 × 4 mm",
  },
  {
    match: "Temperature_Sensor_-_Foot_Contact",
    product: "insole",
    label: "Foot temperature sensor",
    role: "Reads temperature where your foot meets the insole. Every heating and cooling decision, and the burn cutoff, runs off this reading.",
    part: null,
  },
  {
    match: "Temperature_Sensor_-_Peltier_Hot_Side",
    product: "insole",
    label: "Second temperature sensor",
    role: "Keeps an eye on the Peltier module so it can't run too hot.",
    part: null,
  },
  {
    match: "MCU_",
    product: "insole",
    label: "Microcontroller",
    role: "The insole's brain. It reads every sensor once a second, streams them to the app over Bluetooth, and enforces the safety limits whatever the app sends.",
    part: "Seeed XIAO ESP32-C3",
  },
  {
    match: "IMU_",
    product: "insole",
    label: "Motion sensor",
    role: "Feels each step, so the app knows when you're walking or standing still, how fast you walk, and how steady your steps are.",
    part: "GY-521 · MPU-6050",
  },
  {
    match: "Peltier_Driver_",
    product: "insole",
    label: "Peltier driver",
    role: "A dual H-bridge. One channel runs the Peltier in either direction to heat or cool; the other runs the cooling fan.",
    part: "NOYITO DRV8833",
  },
  {
    match: "Fuse_Holder_",
    product: "insole",
    label: "Inline fuse",
    role: "Cuts the circuit if current runs too high, protecting the wiring and electronics.",
    part: "BOJACK 5 × 20 mm · 2 A",
  },
  {
    match: "Enclosure_",
    product: "insole",
    label: "Electronics enclosure",
    role: "Houses the microcontroller, motion sensor, and Peltier driver inside the insole.",
    part: "68 × 28 mm",
  },
  {
    match: "Insole_Base",
    product: "insole",
    label: "Insole base",
    role: "The main structure of the insole. Every sensor and module is carried inside it.",
    part: "301 × 107 × 27 mm",
  },
  {
    match: "Outsole_Layer",
    product: "insole",
    label: "Outsole layer",
    role: "The bottom wear layer, where the insole meets the shoe.",
    part: "1.9 mm",
  },
  // ── Power pack ──
  {
    match: "Battery_",
    product: "pack",
    label: "Battery",
    role: "Powers the insole, the Peltier, and the fan. It lifts out of its bay to charge.",
    part: "INIU P55 · 10,000 mAh",
  },
  {
    match: "Heat_Sink_",
    product: "pack",
    label: "Heat sink",
    role: "Aluminum fins that shed the heat the Peltier pulls away from the foot.",
    part: "Awxlumv · 25 × 25 × 10 mm",
  },
  {
    match: "Cooling_Fan_",
    product: "pack",
    label: "Cooling fan",
    role: "Pushes air across the heat sink whenever the insole is cooling.",
    part: "Easycargo · 20 × 20 × 6 mm · 5 V",
  },
  {
    match: "Battery_Bay_Lid",
    product: "pack",
    label: "Battery bay lid",
    role: "The removable cover over the battery bay.",
    part: null,
  },
  {
    match: "External_Compartment_Shell",
    product: "pack",
    label: "Power pack shell",
    role: "Holds the battery, heat sink, and fan outside the insole.",
    part: "150 × 70 × 20 mm",
  },
];

export const PRODUCT_NAMES = { insole: "Insole", pack: "Power pack" };

// Longest prefix wins, so "Battery_Bay_Lid" never resolves to "Battery_".
const BY_SPECIFICITY = [...COMPONENTS].sort((a, b) => b.match.length - a.match.length);

export function findComponent(nodeName) {
  return BY_SPECIFICITY.find((c) => nodeName.startsWith(c.match)) ?? null;
}

export function componentById(id) {
  return COMPONENTS.find((c) => c.match === id) ?? null;
}
