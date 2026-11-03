// The chapters that play beside the model as it turns and comes apart. Facts only, from the app
// README, its part descriptions (InsoleStack.swift), and the firmware (firmware/README.md). `highlight` lists the
// manifest ids that light up in 3D while the chapter is on screen.
export const CHAPTERS = [
  {
    id: "sense",
    label: "Sense",
    title: "It feels every step.",
    body: "A force sensor under the arch feels how hard you press down. A contact sensor reads foot temperature, and a motion sensor counts each step and how steady it is.",
    chips: ["Arch FSR 402", "Contact temperature", "MPU-6050"],
    highlight: ["Pressure_Sensor_-_Arch", "Temperature_Sensor_-_Foot_Contact", "IMU_"],
  },
  {
    id: "decide",
    label: "Decide",
    title: "A brain in every insole.",
    body: "A Seeed XIAO ESP32-C3 reads every sensor once a second, streams it to the Thermyx app over Bluetooth, and enforces the safety limits on its own.",
    chips: ["ESP32-C3", "1 Hz telemetry", "Bluetooth LE"],
    highlight: ["MCU_", "Enclosure_"],
  },
  {
    id: "heat",
    label: "Heat or cool",
    title: "Moves heat both ways.",
    body: "A Peltier module under the heel heats or cools, driven in either direction by a DRV8833 H-bridge. When it cools, a fan and heat sink in the power pack carry the heat away.",
    chips: ["TEC1-04901", "DRV8833", "Auto · Cool · Heat · Off"],
    highlight: ["Peltier_Module", "Peltier_Driver_", "Heat_Sink_", "Cooling_Fan_"],
  },
  {
    id: "power",
    label: "Power",
    title: "Power rides outside the shoe.",
    body: "A 10,000 mAh power bank sits in the external pack, alongside the heat sink and fan. It lifts out of its bay to charge.",
    chips: ["INIU P55", "10,000 mAh", "Removable bay"],
    highlight: ["Battery_", "Battery_Bay_Lid", "External_Compartment_Shell"],
  },
  {
    id: "safety",
    label: "Safety",
    title: "Hard limits, in firmware.",
    body: "Heating stops at 40 °C foot contact and cooling at 15 °C, whatever the app sends. Without a foot reading it won't heat or cool, and an inline 2 A fuse guards the circuit.",
    chips: ["40 °C cutoff", "15 °C floor", "2 A fuse"],
    highlight: ["Temperature_Sensor_-_Foot_Contact", "Fuse_Holder_"],
  },
];
