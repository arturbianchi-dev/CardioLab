import React, { useMemo } from 'react';
import { arterialWave, guytonCurves, pvLoop } from './physiology.js';

const W=640,H=250,PAD={l:48,r:18,t:18,b:38};
const sx=(x,a,b)=>PAD.l+((x-a)/(b-a))*(W-PAD.l-PAD.r);
const sy=(y,a,b)=>H-PAD.b-((y-a)/(b-a))*(H-PAD.t-PAD.b);
function Grid({xMin,xMax,yMin,yMax,xLabel,yLabel}){return <g className="chart-grid">{[0,.25,.5,.75,1].map((q,i)=><line key={'v'+i} x1={sx(xMin+(xMax-xMin)*q,xMin,xMax)} x2={sx(xMin+(xMax-xMin)*q,xMin,xMax)} y1={PAD.t} y2={H-PAD.b}/>)}{[0,.25,.5,.75,1].map((q,i)=><line key={'h'+i} x1={PAD.l} x2={W-PAD.r} y1={sy(yMin+(yMax-yMin)*q,yMin,yMax)} y2={sy(yMin+(yMax-yMin)*q,yMin,yMax)}/>)}<line className="axis" x1={PAD.l} x2={W-PAD.r} y1={H-PAD.b} y2={H-PAD.b}/><line className="axis" x1={PAD.l} x2={PAD.l} y1={PAD.t} y2={H-PAD.b}/><text className="axis-label" x={W/2} y={H-8} textAnchor="middle">{xLabel}</text><text className="axis-label" x={12} y={H/2} transform={`rotate(-90 12 ${H/2})`} textAnchor="middle">{yLabel}</text></g>}
function Path({data,xMin,xMax,yMin,yMax,className='curve'}){const d=data.map((p,i)=>`${i?'L':'M'} ${sx(p.x,xMin,xMax)} ${sy(p.y,yMin,yMax)}`).join(' ');return <path d={d} className={className}/>}
function Card({title,subtitle,children,footer}){return <div className="chart-card"><div className="chart-head"><span className="eyebrow">MATHEMATICAL MODEL</span><h3>{title}</h3><p>{subtitle}</p></div>{children}{footer&&<div className="chart-foot">{footer}</div>}</div>}
export default function PhysiologyCharts({p}){
 const curves=useMemo(()=>guytonCurves(p),[p]);
 const pv=useMemo(()=>pvLoop(p),[p]);
 const wave=useMemo(()=>arterialWave(p),[p]);
 const eq={xMin:-4,xMax:12,yMin:0,yMax:12};
 const pvEq={xMin:20,xMax:180,yMin:0,yMax:190};
 const wEq={xMin:0,xMax:p.cycle*1000,yMin:20,yMax:Math.max(150,p.sbp+15)};
 return <div className="charts-grid">
  <Card title="Guyton: cardiac output × venous return" subtitle="Reconstructed from transparent model equations; not a reproduction of a copyrighted textbook figure." footer={`Pms ≈ ${p.pms.toFixed(1)} mmHg • operating point is an educational estimate.`}>
   <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg"><Grid {...eq} xLabel="Right atrial pressure (mmHg)" yLabel="Flow (L/min)"/><Path data={curves.cardiac} {...eq} className="curve cardiac"/><Path data={curves.venous} {...eq} className="curve venous"/><circle className="point" cx={sx(p.cvp,eq.xMin,eq.xMax)} cy={sy(p.co,eq.yMin,eq.yMax)} r="5"/><text className="curve-label" x={sx(6,eq.xMin,eq.xMax)} y={sy(8.2,eq.yMin,eq.yMax)}>Cardiac function</text><text className="curve-label" x={sx(-1,eq.xMin,eq.xMax)} y={sy(8.5,eq.yMin,eq.yMax)}>Venous return</text></svg>
  </Card>
  <Card title="Left-ventricular pressure–volume loop" subtitle="Educational EDPVR/ESPVR-style reconstruction linked to preload and contractility." footer={`EDV ${p.edv.toFixed(0)} mL • ESV ${p.esv.toFixed(0)} mL • SV ${p.sv.toFixed(0)} mL • EF ${p.ef.toFixed(0)}%`}>
   <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg"><Grid {...pvEq} xLabel="Volume (mL)" yLabel="LV pressure (mmHg)"/><Path data={pv} {...pvEq} className="curve pv"/><line className="guide" x1={sx(p.edv,pvEq.xMin,pvEq.xMax)} x2={sx(p.edv,pvEq.xMin,pvEq.xMax)} y1={PAD.t} y2={H-PAD.b}/><line className="guide" x1={sx(p.esv,pvEq.xMin,pvEq.xMax)} x2={sx(p.esv,pvEq.xMin,pvEq.xMax)} y1={PAD.t} y2={H-PAD.b}/></svg>
  </Card>
  <Card title="Aortic pressure waveform" subtitle="Simplified Windkessel-style arterial pressure response to current stroke volume and vascular properties." footer={`SBP/DBP ${p.sbp.toFixed(0)}/${p.dbp.toFixed(0)} mmHg • compliance ${p.arterialCompliance.toFixed(1)} relative units`}>
   <svg viewBox={`0 0 ${W} ${H}`} className="chart-svg"><Grid {...wEq} xLabel="Time (ms)" yLabel="Pressure (mmHg)"/><Path data={wave} {...wEq} className="curve pressure"/></svg>
  </Card>
 </div>
}
