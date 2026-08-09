// CardioLab — educational cardiovascular model layer.
// Combines transparent Guyton-style venous return, Frank-Starling,
// pressure-volume and simplified Windkessel relationships.

export const BASELINE = {
  hr: 72,
  edv: 120,
  esv: 50,
  contractility: 100,
  preload: 100,
  afterload: 100,
  svr: 1400,
  pvr: 150,
  bloodVolume: 5,
  cvp: 5,
  arterialCompliance: 1.6,
  venousCompliance: 100,
  respiratoryPressure: -4,
  sympathetic: 20,
};

const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

export function simulate(v) {
  const contractileFactor = v.contractility / 100;
  const afterloadFactor = v.afterload / 100;
  const preloadFactor = v.preload / 100;
  const volumeFactor = v.bloodVolume / 5;
  const sympatheticFactor = v.sympathetic / 20;
  const pms = clamp(5.8 * volumeFactor * (100 / v.venousCompliance), 2, 18);
  const rvResistance = clamp(1 + (v.svr / 1400 - 1) * 0.22, 0.55, 1.8);
  const venousReturn = clamp((pms - v.cvp) / rvResistance * 1.05 * preloadFactor, 0, 12);
  const edv = clamp(v.edv * preloadFactor * (0.90 + 0.10 * volumeFactor), 50, 240);
  const esv = clamp(v.esv * (1 / contractileFactor) * (0.76 + 0.24 * afterloadFactor), 20, 150);
  const sv = clamp(edv - esv, 15, 180);
  const co = (v.hr * sv) / 1000;
  const ef = clamp((sv / edv) * 100, 5, 90);
  const map = clamp(75 + (co - 5) * 8.5 + (v.svr - 1400) * 0.012 + (v.cvp - 5) * 0.3, 30, 190);
  const pulsePressure = clamp(38 * (sv / 70) * (1400 / v.svr) * (1.6 / v.arterialCompliance), 15, 120);
  const sbp = clamp(map + pulsePressure * 0.65, 45, 240);
  const dbp = clamp(map - pulsePressure * 0.35, 25, 160);
  const lvSys = clamp(95 * afterloadFactor + 15 * (contractileFactor - 1), 55, 240);
  const rvSys = clamp(25 * (v.pvr / 150) + 3 * (preloadFactor - 1), 10, 110);
  const papMean = clamp(15 * (v.pvr / 150) * (co / 5), 5, 90);
  const coronaryPerfusion = clamp(dbp - v.cvp, 10, 160);
  return { ...v, edv, esv, sv, co, ef, map, sbp, dbp, pulsePressure, pms, venousReturn, venousGradient: pms - v.cvp, rvResistance, lvSys, rvSys, papMean, coronaryPerfusion, rr: 60000 / v.hr, cycle: 60 / v.hr, sympatheticFactor };
}

export function guytonCurves(p) {
  const cardiac = [], venous = [];
  const maxCO = clamp(7 * (0.72 + 0.55 * (p.contractility / 100)), 4.5, 12);
  for (let rap = -4; rap <= 12; rap += 0.25) {
    const filling = clamp((rap + 4) / 8, 0, 1);
    const co = clamp(maxCO * (1 - Math.exp(-2.3 * filling)), 0, maxCO);
    const vr = rap >= p.pms ? 0 : clamp((p.pms - rap) / p.rvResistance * 1.05, 0, 12);
    cardiac.push({ x: rap, y: co });
    venous.push({ x: rap, y: vr });
  }
  return { cardiac, venous };
}

export function pvLoop(p) {
  const points = [];
  const edv = p.edv, esv = p.esv;
  const eMax = 2.1 * (p.contractility / 100);
  const diastolic = v => 4 + 0.045 * Math.exp((v - 70) / 35);
  const systolic = v => clamp(eMax * (v - 10), 5, 190);
  for (let v = esv; v <= edv; v += 2) points.push({ x: v, y: diastolic(v) });
  for (let v = edv; v >= esv; v -= 2) points.push({ x: v, y: systolic(v) });
  return points;
}

export function arterialWave(p, samples = 240) {
  const points = [];
  const period = 60 / p.hr;
  const tau = clamp(p.arterialCompliance * (p.svr / 1400) * 0.55, 0.18, 1.4);
  for (let i = 0; i < samples; i += 1) {
    const t = (i / samples) * period;
    const phase = t / period;
    const systole = 0.33;
    let pressure;
    if (phase < systole) {
      const u = phase / systole;
      pressure = p.dbp + (p.sbp - p.dbp) * Math.sin(Math.PI * Math.pow(u, 0.65));
    } else {
      const d = (phase - systole) / (1 - systole);
      pressure = p.dbp + (p.sbp - p.dbp) * Math.exp(-d * (1.8 / tau));
      pressure += 3.5 * Math.exp(-(((d - 0.08) / 0.035) ** 2));
    }
    points.push({ x: t * 1000, y: pressure });
  }
  return points;
}

export function ecgCycle(heartRate, samples = 720) {
  const points = [];
  for (let i = 0; i <= samples; i += 3) {
    const phase = ((i / samples) * 3 * heartRate) / 60 % 1;
    const gaussian = (center, width, amp) => amp * Math.exp(-(((phase - center) / width) ** 2));
    let y = 50;
    y -= gaussian(0.16, 0.035, 10);
    y += gaussian(0.375, 0.012, 7);
    y -= gaussian(0.395, 0.009, 40);
    y += gaussian(0.42, 0.014, 13);
    y -= gaussian(0.68, 0.065, 15);
    points.push(`${i},${y}`);
  }
  return points.join(' ');
}
