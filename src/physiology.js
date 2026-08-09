// CardioLab physiology engine — intentionally simplified educational model.
// Core relationships are based on standard cardiovascular physiology:
// CO = HR × SV; MAP is approximated from CO × SVR; SV = EDV − ESV.

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
  hematocrit: 45,
};

const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

export function simulate(v) {
  const contractileFactor = v.contractility / 100;
  const afterloadFactor = v.afterload / 100;
  const preloadFactor = v.preload / 100;
  const volumeFactor = v.bloodVolume / 5;

  const venousReturn = clamp(5.0 * preloadFactor * volumeFactor * (100 / afterloadFactor), 1, 12);
  const esv = clamp(v.esv * (1 / contractileFactor) * (0.75 + 0.25 * afterloadFactor), 20, 130);
  const edv = clamp(v.edv * preloadFactor * (0.90 + 0.10 * volumeFactor), 50, 220);
  const sv = clamp(edv - esv, 15, 160);
  const co = (v.hr * sv) / 1000;
  const ef = clamp((sv / edv) * 100, 10, 90);

  const map = clamp(75 + (co - 5) * 9 + (v.svr - 1400) * 0.012, 35, 180);
  const pulsePressure = clamp(40 * (sv / 70) * (1400 / v.svr), 18, 110);
  const sbp = clamp(map + pulsePressure * 0.65, 45, 230);
  const dbp = clamp(map - pulsePressure * 0.35, 25, 150);

  const lvSys = clamp(95 * afterloadFactor + 12 * (contractileFactor - 1), 55, 220);
  const rvSys = clamp(25 * (v.pvr / 150) + 3 * (preloadFactor - 1), 10, 100);
  const papMean = clamp(15 * (v.pvr / 150) * (co / 5), 5, 70);
  const coronaryPerfusion = clamp(dbp - 8, 10, 140);

  return {
    ...v,
    edv, esv, sv, co, ef, map, sbp, dbp, pulsePressure,
    venousReturn, lvSys, rvSys, papMean, coronaryPerfusion,
    rr: 60000 / v.hr,
  };
}

export function ecgCycle(heartRate, samples = 720) {
  const points = [];
  for (let i = 0; i <= samples; i += 3) {
    const phase = ((i / samples) * 3 * heartRate / 60) % 1;
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
