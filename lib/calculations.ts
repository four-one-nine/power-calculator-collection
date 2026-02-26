export type PhaseType = 'single' | 'three';

export function ampsToVA(amps: number, volts: number, phase: PhaseType): number {
  if (phase === 'single') {
    return amps * volts;
  }
  return amps * volts * Math.sqrt(3);
}

export function vaToAmps(va: number, volts: number, phase: PhaseType): number {
  if (phase === 'single') {
    return va / volts;
  }
  return va / (volts * Math.sqrt(3));
}

export interface VoltageDropInputs {
  current: number;
  wireGauge: string;
  length: number;
  voltage: number;
  phases: number;
  material: 'copper' | 'aluminum';
  temperature: number;
}

export const WIRE_GAUGES: Record<string, { cmil: number; ohm_per_1000ft: number }> = {
  "14": { cmil: 4110, ohm_per_1000ft: 3.14 },
  "12": { cmil: 6530, ohm_per_1000ft: 1.98 },
  "10": { cmil: 10380, ohm_per_1000ft: 1.24 },
  "8": { cmil: 16510, ohm_per_1000ft: 0.778 },
  "6": { cmil: 26240, ohm_per_1000ft: 0.491 },
  "4": { cmil: 41740, ohm_per_1000ft: 0.308 },
  "3": { cmil: 52620, ohm_per_1000ft: 0.245 },
  "2": { cmil: 66360, ohm_per_1000ft: 0.194 },
  "1": { cmil: 83690, ohm_per_1000ft: 0.154 },
  "1/0": { cmil: 105600, ohm_per_1000ft: 0.122 },
  "2/0": { cmil: 133100, ohm_per_1000ft: 0.0967 },
  "3/0": { cmil: 167800, ohm_per_1000ft: 0.0766 },
  "4/0": { cmil: 211600, ohm_per_1000ft: 0.0608 },
};

export const TEMP_CORRECTION_FACTORS: Record<number, Record<number, number>> = {
  60: { 75: 1.08, 90: 1.18 },
  75: { 60: 0.93, 75: 1.05, 90: 1.14 },
  90: { 60: 0.85, 75: 0.88, 90: 1.00 },
};

export function calculateVoltageDrop(inputs: VoltageDropInputs): number {
  const { current, wireGauge, length, voltage, phases, material, temperature } = inputs;
  
  const wireData = WIRE_GAUGES[wireGauge];
  if (!wireData) return 0;

  const resistivity = wireData.ohm_per_1000ft;
  
  let tempFactor = 1;
  if (temperature > 60) {
    tempFactor = TEMP_CORRECTION_FACTORS[75]?.[temperature] ?? 1;
  }

  const resistance = (resistivity * length * 2 * tempFactor) / 1000;

  const materialFactor = material === 'aluminum' ? 1.64 : 1;
  const adjustedResistance = resistance * materialFactor;

  const phaseFactor = phases === 3 ? Math.sqrt(3) : 2;

  return current * adjustedResistance * phaseFactor;
}

export function getVoltageDropPercentage(inputs: VoltageDropInputs): number {
  const vd = calculateVoltageDrop(inputs);
  return (vd / inputs.voltage) * 100;
}

export function generateVoltageDropCSV(inputs: VoltageDropInputs): string {
  const vd = calculateVoltageDrop(inputs);
  const vdPercent = getVoltageDropPercentage(inputs);
  
  const headers = ['Parameter', 'Value'];
  const rows = [
    ['Current (A)', inputs.current.toString()],
    ['Wire Gauge', inputs.wireGauge.toString()],
    ['Length (ft)', inputs.length.toString()],
    ['Voltage (V)', inputs.voltage.toString()],
    ['Phases', inputs.phases.toString()],
    ['Material', inputs.material],
    ['Temperature (°C)', inputs.temperature.toString()],
    ['Voltage Drop (V)', vd.toFixed(2)],
    ['Voltage Drop (%)', vdPercent.toFixed(2)],
  ];

  return [headers, ...rows].map(row => row.join(',')).join('\n');
}
