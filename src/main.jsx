import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, HeartPulse, Gauge, Wind, Droplets, RotateCcw, Play, Pause, Crosshair, ChevronDown } from 'lucide-react';
import './styles.css';

const DEFAULTS = {
  hr: 72,
  sv: 70,
  map: 93,
  cvp: 5,
  svr: 1400,
  pvr: 150,
  contractility: 100,
  bloodVolume: 5,
  preload: 100,
  afterload: 100,
};

function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }

function physiology(v) {
  const co = v.hr * v.sv / 1000;
  const ef = clamp(55 + (v.contractility - 100) * 0.16 - (v.afterload - 100) * 0.10, 20, 85);
  const sbp = v.map + 0.5 * (v.svr / 1400) * (v.hr / 72) * 60;
  const dbp = v.map - 0.5 * (v.svr / 1400) * (v.hr / 72) * 30;
  const lvPressure = 95 + (v.afterload - 100) * 0.45 + (v.contractility - 100) * 0.12;
  const rvPressure = 25 + (v.pvr - 150) * 0.045;
  const venousReturn = clamp(5.0 * (v.preload / 100) * (100 / v.afterload) * (v.bloodVolume / 5), 1, 12);
  return { co, ef, sbp, dbp, lvPressure, rvPressure, venousReturn };
}

function HeartModel({ playing, hr }) {
  const beatMs = 60000 / hr;
  const pulse = playing ? 0.5 + 0.5 * Math.sin((performance.now() % beatMs) / beatMs * Math.PI * 2) : 0.15;
  const scale = 1 + pulse * 0.055;
  return <div className="model-wrap">
    <div className="model-grid" />
    <div className="organ-label aorta-label">AORTA</div>
    <div className="organ-label lung-label left">LUNG</div>
    <div className="organ-label lung-label right">LUNG</div>
    <div className="organ-label liver-label">LIVER</div>
    <div className="organ-label spleen-label">SPLEEN</div>
    <div className="vessel aorta" />
    <div className="vessel carotid" />
    <div className="vessel renal" />
    <div className="vessel iliac" />
    <div className="organ lung left" />
    <div className="organ lung right" />
    <div className="organ liver" />
    <div className="organ spleen" />
    <div className="heart" style={{ transform: `translate(-50%, -50%) scale(${scale})` }}>
      <div className="atrium left" /><div className="atrium right" />
      <div className="ventricle left" /><div className="ventricle right" />
      <div className="septum" />
    </div>
    {playing && Array.from({ length: 12 }).map((_, i) => <span key={i} className="blood-particle" style={{ animationDelay: `${i * -0.28}s` }} />)}
    <div className="flow-legend"><span className="arterial-dot" /> arterial flow <span className="venous-dot" /> venous return</div>
  </div>;
}

function Slider({ label, value, min, max, step = 1, unit, onChange, hint }) {
  return <div className="slider-row">
    <div className="slider-top"><span>{label}</span><b>{value}{unit}</b></div>
    <input type="range" min={min} max={max} step={step} value={value} onChange={e => onChange(Number(e.target.value))} />
    {hint && <small>{hint}</small>}
  </div>;
}

function ECG({ hr, playing }) {
  const points = useMemo(() => {
    const out = [];
    for (let x = 0; x <= 720; x += 3) {
      const t = (x / 720) * 3;
      const phase = (t * hr / 60) % 1;
      let y = 50;
      const gauss = (c, w, a) => a * Math.exp(-Math.pow((phase - c) / w, 2));
      y -= gauss(0.16, 0.035, 10); // P
      y += gauss(0.375, 0.012, 7); // Q
      y -= gauss(0.395, 0.009, 40); // R
      y += gauss(0.42, 0.014, 13); // S
      y -= gauss(0.68, 0.065, 15); // T
      out.push(`${x},${y}`);
    }
    return out.join(' ');
  }, [hr]);
  return <div className="ecg-card">
    <div className="ecg-header"><span><Activity size={15}/> ECG • Lead II</span><span className="live"><i /> {playing ? 'LIVE' : 'PAUSED'}</span></div>
    <svg viewBox="0 0 720 100" preserveAspectRatio="none" className="ecg-svg">
      <defs><pattern id="ecgGrid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="1"/></pattern></defs>
      <rect width="720" height="100" fill="url(#ecgGrid)" />
      <polyline points={points} fill="none" stroke="#64e4b7" strokeWidth="2.2" />
    </svg>
    <div className="ecg-stats"><span>HR <b>{hr}</b> bpm</span><span>PR <b>160</b> ms</span><span>QRS <b>88</b> ms</span><span>QTc <b>410</b> ms</span></div>
  </div>;
}

function App() {
  const [v, setV] = useState(DEFAULTS);
  const [playing, setPlaying] = useState(true);
  const [tab, setTab] = useState('monitor');
  const p = physiology(v);
  const set = key => val => setV(old => ({ ...old, [key]: val }));
  const reset = () => setV(DEFAULTS);

  return <main className="app">
    <header className="topbar">
      <div className="brand"><div className="brand-mark"><HeartPulse size={20}/></div><div><strong>Cardio<span>Lab</span></strong><small>PHYSIOLOGY SIMULATOR</small></div></div>
      <div className="status"><span className="status-dot"/> MODEL ONLINE <span className="divider"/> NORMAL BASELINE</div>
      <button className="reset" onClick={reset}><RotateCcw size={15}/> Reset</button>
    </header>

    <section className="workspace">
      <aside className="left-panel panel">
        <div className="panel-title"><div><span className="eyebrow">PHYSIOLOGICAL CONTROLS</span><h2>Hemodynamics</h2></div><ChevronDown size={16}/></div>
        <div className="section-label">CARDIAC</div>
        <Slider label="Heart rate" value={v.hr} min={30} max={180} unit=" bpm" onChange={set('hr')} hint="Chronotropy" />
        <Slider label="Stroke volume" value={v.sv} min={20} max={150} unit=" mL" onChange={set('sv')} hint="SV = EDV − ESV" />
        <Slider label="Contractility" value={v.contractility} min={40} max={180} unit=" %" onChange={set('contractility')} hint="Inotropy" />
        <div className="section-label">VASCULAR</div>
        <Slider label="Preload" value={v.preload} min={40} max={180} unit=" %" onChange={set('preload')} />
        <Slider label="Afterload" value={v.afterload} min={40} max={220} unit=" %" onChange={set('afterload')} />
        <Slider label="Systemic vascular resistance" value={v.svr} min={400} max={3000} step={10} unit=" dyn·s/cm⁵" onChange={set('svr')} />
        <Slider label="Pulmonary vascular resistance" value={v.pvr} min={50} max={900} step={5} unit=" dyn·s/cm⁵" onChange={set('pvr')} />
        <div className="section-label">VOLUME</div>
        <Slider label="Blood volume" value={v.bloodVolume} min={2.5} max={8} step={0.1} unit=" L" onChange={set('bloodVolume')} />
        <Slider label="Central venous pressure" value={v.cvp} min={0} max={20} step={0.5} unit=" mmHg" onChange={set('cvp')} />
      </aside>

      <section className="center-panel">
        <div className="view-header"><div><span className="eyebrow">3D PHYSIOLOGICAL MODEL</span><h1>Cardiovascular System</h1></div><div className="view-actions"><button className="icon-btn"><Crosshair size={16}/></button><button className="play-btn" onClick={() => setPlaying(x => !x)}>{playing ? <Pause size={15}/> : <Play size={15}/>} {playing ? 'PAUSE' : 'RUN'}</button></div></div>
        <HeartModel playing={playing} hr={v.hr}/>
        <div className="model-bottom"><div><span>HEART RATE</span><b>{v.hr} <em>BPM</em></b></div><div><span>CARDIAC OUTPUT</span><b>{p.co.toFixed(1)} <em>L/MIN</em></b></div><div><span>MEAN ARTERIAL PRESSURE</span><b>{v.map} <em>MMHG</em></b></div><div><span>VENOUS RETURN</span><b>{p.venousReturn.toFixed(1)} <em>L/MIN</em></b></div></div>
      </section>

      <aside className="right-panel panel">
        <div className="tabs"><button className={tab === 'monitor' ? 'active' : ''} onClick={() => setTab('monitor')}>MONITOR</button><button className={tab === 'ecg' ? 'active' : ''} onClick={() => setTab('ecg')}>ECG</button></div>
        {tab === 'monitor' ? <>
          <div className="section-label">REAL-TIME PARAMETERS</div>
          <div className="vitals-grid">
            <div className="vital"><HeartPulse/><small>HEART RATE</small><strong>{v.hr}</strong><span>bpm</span></div>
            <div className="vital"><Gauge/><small>MAP</small><strong>{v.map}</strong><span>mmHg</span></div>
            <div className="vital"><Activity/><small>CARDIAC OUTPUT</small><strong>{p.co.toFixed(1)}</strong><span>L/min</span></div>
            <div className="vital"><Droplets/><small>CVP</small><strong>{v.cvp}</strong><span>mmHg</span></div>
          </div>
          <div className="section-label">HEMODYNAMIC MONITOR</div>
          <div className="metric"><span>SBP / DBP</span><b>{Math.round(p.sbp)} / {Math.round(p.dbp)} <i>mmHg</i></b></div>
          <div className="metric"><span>STROKE VOLUME</span><b>{v.sv} <i>mL</i></b></div>
          <div className="metric"><span>EJECTION FRACTION</span><b>{p.ef.toFixed(0)} <i>%</i></b></div>
          <div className="metric"><span>LV SYSTOLIC PRESSURE</span><b>{Math.round(p.lvPressure)} <i>mmHg</i></b></div>
          <div className="metric"><span>RV SYSTOLIC PRESSURE</span><b>{Math.round(p.rvPressure)} <i>mmHg</i></b></div>
          <div className="metric"><span>SVR</span><b>{v.svr} <i>dyn·s/cm⁵</i></b></div>
          <ECG hr={v.hr} playing={playing}/>
        </> : <>
          <div className="section-label">ELECTROPHYSIOLOGY</div>
          <ECG hr={v.hr} playing={playing}/>
          <div className="ecg-explain"><b>Sinus rhythm</b><span>Simulated Lead II waveform generated from the current heart rate.</span></div>
          <div className="metric"><span>R–R INTERVAL</span><b>{Math.round(60000 / v.hr)} <i>ms</i></b></div>
          <div className="metric"><span>PR INTERVAL</span><b>160 <i>ms</i></b></div>
          <div className="metric"><span>QRS DURATION</span><b>88 <i>ms</i></b></div>
          <div className="metric"><span>QTc</span><b>410 <i>ms</i></b></div>
        </>}
      </aside>
    </section>
    <footer><span>CardioLab v0.1 • Educational simulator</span><span>Equations are simplified physiological models and are not for clinical decision-making.</span></footer>
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);
