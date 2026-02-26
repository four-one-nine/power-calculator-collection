'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Select } from '@/components/Input';
import { ResultDisplay } from '@/components/ResultDisplay';
import { Toggle } from '@/components/Toggle';
import { ampsToVA, vaToAmps, PhaseType, calculateVoltageDrop, getVoltageDropPercentage, generateVoltageDropCSV, VoltageDropInputs, WIRE_GAUGES } from '@/lib/calculations';
import { saveAs } from 'file-saver';
import table430248 from '@/data/430.248.json';
import table430250 from '@/data/430.250.json';

interface HpEntry {
  hp: number;
  [key: string]: number;
}

export default function Home() {
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  const copyToClipboard = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 2000);
  };

  return (
    <div className="space-y-6">
      <Card title="Amps to VA">
        <AmpsToVACard onCopy={copyToClipboard} copiedLabel={copiedLabel} />
      </Card>

      <Card title="VA to Amps">
        <VaToAmpsCard onCopy={copyToClipboard} copiedLabel={copiedLabel} />
      </Card>

      <Card title="HP to Amps">
        <HpToAmpsCard />
      </Card>

      <Card title="Voltage Drop Calculator">
        <VoltageDropCard />
      </Card>
    </div>
  );
}

function AmpsToVACard({ onCopy, copiedLabel }: { onCopy: (v: string, l: string) => void; copiedLabel: string | null }) {
  const [amps, setAmps] = useState('');
  const [volts, setVolts] = useState('120');
  const [phase, setPhase] = useState<PhaseType>('single');
  const [result, setResult] = useState<number | null>(null);

  useEffect(() => {
    const ampsNum = parseFloat(amps);
    const voltsNum = parseFloat(volts);
    if (!isNaN(ampsNum) && !isNaN(voltsNum) && voltsNum > 0) {
      setResult(ampsToVA(ampsNum, voltsNum, phase));
    } else {
      setResult(null);
    }
  }, [amps, volts, phase]);

  return (
    <>
      <Input label="Amperage" type="number" value={amps} onChange={(e) => setAmps(e.target.value)} placeholder="Enter amps" min="0" step="0.1" />
      <Input label="Voltage" type="number" value={volts} onChange={(e) => setVolts(e.target.value)} placeholder="Enter voltage" min="0" step="1" />
      <Toggle label="Phase" options={[{ value: 'single', label: 'Single-Phase' }, { value: 'three', label: 'Three-Phase' }]} value={phase} onChange={(v) => setPhase(v as PhaseType)} />
      {result !== null && (
        <ResultDisplay label="VA Result" value={result.toFixed(2)} unit="VA" />
      )}
    </>
  );
}

function VaToAmpsCard({ onCopy, copiedLabel }: { onCopy: (v: string, l: string) => void; copiedLabel: string | null }) {
  const [va, setVa] = useState('');
  const [volts, setVolts] = useState('120');
  const [phase, setPhase] = useState<PhaseType>('single');
  const [result, setResult] = useState<number | null>(null);

  useEffect(() => {
    const vaNum = parseFloat(va);
    const voltsNum = parseFloat(volts);
    if (!isNaN(vaNum) && !isNaN(voltsNum) && voltsNum > 0) {
      setResult(vaToAmps(vaNum, voltsNum, phase));
    } else {
      setResult(null);
    }
  }, [va, volts, phase]);

  return (
    <>
      <Input label="VA" type="number" value={va} onChange={(e) => setVa(e.target.value)} placeholder="Enter VA" min="0" step="1" />
      <Input label="Voltage" type="number" value={volts} onChange={(e) => setVolts(e.target.value)} placeholder="Enter voltage" min="0" step="1" />
      <Toggle label="Phase" options={[{ value: 'single', label: 'Single-Phase' }, { value: 'three', label: 'Three-Phase' }]} value={phase} onChange={(v) => setPhase(v as PhaseType)} />
      {result !== null && (
        <ResultDisplay label="Amps Result" value={result.toFixed(2)} unit="A" />
      )}
    </>
  );
}

function HpToAmpsCard() {
  const [tableType, setTableType] = useState<'430.248' | '430.250'>('430.250');
  const [voltage, setVoltage] = useState('230');
  const [hp, setHp] = useState('');
  const [result, setResult] = useState<number | null>(null);

  const currentTable = tableType === '430.248' ? table430248 : table430250;
  const hpOptions = currentTable.data.map((entry: HpEntry) => ({ value: entry.hp.toString(), label: `${entry.hp} HP` }));

  const voltageOptions = tableType === '430.248'
    ? [{ value: '115', label: '115V' }, { value: '230', label: '230V' }]
    : [{ value: '200', label: '200V' }, { value: '230', label: '230V' }, { value: '460', label: '460V' }, { value: '575', label: '575V' }];

  useEffect(() => {
    const hpNum = parseFloat(hp);
    if (isNaN(hpNum)) { setResult(null); return; }
    const entry = (currentTable.data as HpEntry[]).find((e) => e.hp === hpNum);
    if (entry) {
      const voltageKey = `amps_${voltage}v`;
      setResult(entry[voltageKey] !== undefined ? entry[voltageKey] : null);
    } else {
      setResult(null);
    }
  }, [hp, voltage, currentTable, tableType]);

  return (
    <>
      <Select label="NEC Table" options={[{ value: '430.248', label: 'Table 430.248 (Single-Phase)' }, { value: '430.250', label: 'Table 430.250 (Three-Phase)' }]} value={tableType} onChange={(e) => { setTableType(e.target.value as '430.248' | '430.250'); setHp(''); setResult(null); }} />
      <Select label="Voltage" options={voltageOptions} value={voltage} onChange={(e) => setVoltage(e.target.value)} />
      <Select label="Horsepower" options={hpOptions} value={hp} onChange={(e) => setHp(e.target.value)} />
      {result !== null && <ResultDisplay label="Full-Load Current" value={result.toFixed(1)} unit="A" />}
      <p className="text-gray-500 text-xs mt-4">Source: NEC Table {tableType}</p>
    </>
  );
}

function VoltageDropCard() {
  const [current, setCurrent] = useState('');
  const [wireGauge, setWireGauge] = useState('12');
  const [length, setLength] = useState('');
  const [voltage, setVoltage] = useState('120');
  const [phases, setPhases] = useState(1);
  const [material, setMaterial] = useState<'copper' | 'aluminum'>('copper');
  const [temperature, setTemperature] = useState(75);
  const [vdResult, setVdResult] = useState<number | null>(null);
  const [vdPercent, setVdPercent] = useState<number | null>(null);

  const WIRE_GAUGE_OPTIONS = Object.keys(WIRE_GAUGES).map((gauge) => ({ value: gauge, label: gauge.includes('/') ? gauge : `AWG ${gauge}` }));

  const inputs: VoltageDropInputs = { current: parseFloat(current) || 0, wireGauge, length: parseFloat(length) || 0, voltage: parseFloat(voltage) || 120, phases, material, temperature };

  useEffect(() => {
    if (inputs.current > 0 && inputs.length > 0 && inputs.voltage > 0) {
      setVdResult(calculateVoltageDrop(inputs));
      setVdPercent(getVoltageDropPercentage(inputs));
    } else {
      setVdResult(null);
      setVdPercent(null);
    }
  }, [inputs]);

  const handleExportCSV = () => {
    const csv = generateVoltageDropCSV(inputs);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'voltage-drop-calculation.csv');
  };

  return (
    <>
      <Input label="Current (A)" type="number" value={current} onChange={(e) => setCurrent(e.target.value)} placeholder="Enter current" min="0" step="0.1" />
      <Select label="Wire Gauge (AWG)" options={WIRE_GAUGE_OPTIONS} value={wireGauge} onChange={(e) => setWireGauge(e.target.value)} />
      <Input label="One-Way Length (ft)" type="number" value={length} onChange={(e) => setLength(e.target.value)} placeholder="Enter length" min="0" step="1" />
      <Input label="System Voltage (V)" type="number" value={voltage} onChange={(e) => setVoltage(e.target.value)} placeholder="Enter voltage" min="0" step="1" />
      <Select label="Phases" options={[{ value: '1', label: 'Single-Phase' }, { value: '3', label: 'Three-Phase' }]} value={phases.toString()} onChange={(e) => setPhases(parseInt(e.target.value))} />
      <Select label="Conductor Material" options={[{ value: 'copper', label: 'Copper' }, { value: 'aluminum', label: 'Aluminum' }]} value={material} onChange={(e) => setMaterial(e.target.value as 'copper' | 'aluminum')} />
      <Select label="Ambient Temperature (°C)" options={[{ value: '60', label: '60°C' }, { value: '75', label: '75°C' }, { value: '90', label: '90°C' }]} value={temperature.toString()} onChange={(e) => setTemperature(parseInt(e.target.value))} />
      {vdResult !== null && vdPercent !== null && (
        <>
          <ResultDisplay label="Voltage Drop" value={vdResult.toFixed(2)} unit="V" />
          <ResultDisplay label="Voltage Drop" value={vdPercent.toFixed(2)} unit="%" />
          <button onClick={handleExportCSV} className="w-full mt-4 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors">Export to CSV</button>
        </>
      )}
    </>
  );
}
