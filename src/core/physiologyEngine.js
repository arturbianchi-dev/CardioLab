// CardioLab — 0D cardiovascular physiology engine
// Educational implementation inspired by the compartmental/elastance framework
// described by Ursino (1998) and the cardiovascular teaching literature.
// It is not a patient-specific clinical model.

const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
const pos=x=>Math.max(0,x);
const expSafe=x=>Math.exp(clamp(x,-40,40));

export const BASELINE={
  hr:72, bloodVolume:5.0, sympathetic:20,
  EmaxLV:2.95, EmaxRV:1.75, contractility:100,
  Rsa:0.72, Rsp:1.15, Rep:1.35, Rsv:0.018, Rev:0.018,
  Rpa:0.08, Rpp:0.22, Rpv:0.018,
  Csa:1.55, Csp:0.95, Cep:1.10, Csv:85, Cev:55,
  Cpa:3.8, Cpp:4.2, Cpv:18,
  VuSa:420, VuSp:170, VuEp:180, VuSv:1300, VuEv:1000,
  VuPa:70, VuPp:80, VuPv:180,
  LVV0:16.77, RVV0:40.8, P0LV:1.5, P0RV:1.5,
  kLV:0.014, kRV:0.011,
  valveMV:0.0025, valveTV:0.0025, valveAV:0.004, valvePV:0.004,
  respiratoryRate:14, tidalVolume:0.50, intrathoracicPressure:-4,
  radius:1, coronaryOcclusion:0, territory:'none', scenario:'normal',
  afterloadScale:1, preloadScale:1, arterialComplianceScale:1, venousComplianceScale:1,
  pulmonaryResistanceScale:1
};

const state0={Psa:92,Psp:54,Pep:50,Psv:5,Pev:5,Ppa:15,Ppp:11,Ppv:7,Vra:45,Vrv:110,Vla:55,Vlv:120};

function activation(t,T,offset=0){
  let x=((t/T)+offset)%1; if(x<0)x+=1;
  const atrial=Math.exp(-Math.pow((x-0.12)/0.055,2));
  const vent=Math.exp(-Math.pow((x-0.28)/0.18,2));
  return {atrial,vent};
}
function systoleFraction(hr){const T=60/hr;return clamp(0.32+0.0019*(hr-72),0.25,0.42);}
function ventricularPressure(V,Emax,V0,P0,k,phi,external=0){
  const diast=P0*Math.max(0,expSafe(k*Math.max(V-V0,0))-1);
  const sys=Math.max(0,Emax*(V-V0));
  return external+(1-phi)*diast+phi*sys;
}
function atrialPressure(V,C,Vu,active,activeGain=3){return Math.max(-2,(V-Vu)/C+active*activeGain);}
function valveFlow(Pin,Pout,R){return pos((Pin-Pout)/R);}

function makeParams(input){
  const x={...BASELINE,...input};
  const r=clamp(x.radius,.45,1.8);
  const radiusFactor=Math.pow(r,-4);
  const sympathetic=clamp(x.sympathetic/100,0,2);
  const contractility=clamp(x.contractility/100,.25,2);
  const systemicTone=clamp(x.afterloadScale*radiusFactor*(1+0.22*sympathetic),.25,4.5);
  const pulmonaryTone=clamp(x.pulmonaryResistanceScale,.25,6);
  const ischemia=clamp(x.coronaryOcclusion/100,0,1);
  return {
    ...x,
    Rsa:x.Rsa*systemicTone,
    Rsp:x.Rsp*systemicTone,
    Rep:x.Rep*systemicTone,
    Rpa:x.Rpa*pulmonaryTone,
    Rpp:x.Rpp*pulmonaryTone,
    Rpv:x.Rpv*pulmonaryTone,
    Csa:x.Csa*x.arterialComplianceScale,
    Csp:x.Csp*x.arterialComplianceScale,
    Cep:x.Cep*x.arterialComplianceScale,
    Csv:x.Csv*x.venousComplianceScale,
    Cev:x.Cev*x.venousComplianceScale,
    EmaxLV:x.EmaxLV*contractility*(1-0.45*ischemia),
    EmaxRV:x.EmaxRV*contractility*(1-0.20*ischemia),
    stressedVolume:2.35*(x.bloodVolume/5)*x.venousComplianceScale,
    cycle:60/x.hr
  };
}

function derivative(y,t,p){
  const T=p.cycle, ph=activation(t,T), phiV=ph.vent;
  const pRA=atrialPressure(y.Vra,31.25,p.VraU||25,ph.atrial,2.5);
  const pLA=atrialPressure(y.Vla,19.23,p.VlaU||25,ph.atrial,2.0);
  const pRV=ventricularPressure(y.Vrv,p.EmaxRV,p.RVV0,p.P0RV,p.kRV,phiV,p.intrathoracicPressure);
  const pLV=ventricularPressure(y.Vlv,p.EmaxLV,p.LVV0,p.P0LV,p.kLV,phiV,p.intrathoracicPressure);
  const qMV=valveFlow(pLA,pLV,p.valveMV);
  const qTV=valveFlow(pRA,pRV,p.valveTV);
  const qAV=valveFlow(pLV,y.Psa,p.valveAV);
  const qPV=valveFlow(pRV,y.Ppa,p.valvePV);
  const qSaSp=pos((y.Psa-y.Psp)/p.Rsp);
  const qSaEp=pos((y.Psa-y.Pep)/p.Rep);
  const qSpSv=pos((y.Psp-y.Psv)/p.Rsv);
  const qEpEv=pos((y.Pep-y.Pev)/p.Rev);
  const qSvRA=pos((y.Psv-pRA)/p.Rsa);
  const qEvRA=pos((y.Pev-pRA)/p.Rsa);
  const qPaPp=pos((y.Ppa-y.Ppp)/p.Rpp);
  const qPpPv=pos((y.Ppp-y.Ppv)/p.Rpv);
  const qPvLA=pos((y.Ppv-pLA)/p.Rpv);
  const d={};
  d.Psa=(qAV-qSaSp-qSaEp)/p.Csa;
  d.Psp=(qSaSp-qSpSv)/p.Csp;
  d.Pep=(qSaEp-qEpEv)/p.Cep;
  d.Psv=(qSpSv-qSvRA)/p.Csv;
  d.Pev=(qEpEv-qEvRA)/p.Cev;
  d.Ppa=(qPV-qPaPp)/p.Cpa;
  d.Ppp=(qPaPp-qPpPv)/p.Cpp;
  d.Ppv=(qPpPv-qPvLA)/p.Cpv;
  d.Vra=qSvRA+qEvRA-qTV;
  d.Vrv=qTV-qPV;
  d.Vla=qPvLA-qMV;
  d.Vlv=qMV-qAV;
  return {d,pressures:{pRA,pLA,pRV,pLV},flows:{qMV,qTV,qAV,qPV,qSaSp,qSaEp,qSpSv,qEpEv,qSvRA,qEvRA,qPaPp,qPpPv,qPvLA}};
}

function rk4(y,t,dt,p){
  const a=derivative(y,t,p).d;
  const y2={};for(const k in y)y2[k]=y[k]+dt*a[k]/2;
  const b=derivative(y2,t+dt/2,p).d;const y3={};for(const k in y)y3[k]=y[k]+dt*b[k]/2;
  const c=derivative(y3,t+dt/2,p).d;const y4={};for(const k in y)y4[k]=y[k]+dt*c[k];
  const d=derivative(y4,t+dt,p).d;const out={};for(const k in y)out[k]=Math.max(0,y[k]+dt*(a[k]+2*b[k]+2*c[k]+d[k])/6);return out;
}

function integrate(input){
  const p=makeParams(input); let y={...state0};
  const dt=0.004, settle=Math.max(4.5,Math.min(9,p.cycle*7)), samples=260;
  let t=0; const traces=[]; const sampleStart=settle-p.cycle;
  const steps=Math.ceil(settle/dt);
  for(let i=0;i<steps;i++){
    if(t>=sampleStart && traces.length<samples){
      const z=derivative(y,t,p);traces.push({t:t-sampleStart,...y,...z.pressures,...z.flows});
    }
    y=rk4(y,t,dt,p);t+=dt;
  }
  const last=traces[traces.length-1]||{...y,pRA:3,pLA:7,pRV:22,pLV:110,qAV:5};
  const avg=(key)=>traces.reduce((s,z)=>s+(z[key]??0),0)/Math.max(traces.length,1);
  const max=(key)=>Math.max(...traces.map(z=>z[key]??0));
  const min=(key)=>Math.min(...traces.map(z=>z[key]??0));
  const hr=p.hr;
  const sv=Math.max(0,avg('qAV'))*1000/hr;
  const co=avg('qAV')*60;
  const ef=clamp(sv/(avg('Vlv')||120)*100,1,95);
  const map=avg('Psa'), sbp=max('Psa'), dbp=min('Psa'), pp=sbp-dbp;
  const pap=avg('Ppa'), rap=avg('pRA'), lap=avg('pLA');
  const rv=avg('qPV')*60, rvr=clamp((Math.max(1,p.stressedVolume)-rap)/Math.max(co,.1),.1,5);
  const pms=clamp(7+3.8*(p.bloodVolume-5)*p.venousComplianceScale,1,18);
  const do2=co*13.8*0.98*10;
  const vo2=250;
  const extraction=clamp(vo2/Math.max(do2,1),.12,.98);
  const perf=clamp(co/5*(1400/Math.max(p.Rsa*1000,250)),.15,2.5);
  const anaerobic=clamp(Math.pow(Math.max(0,(.65-perf)/.5),1.7)+Math.max(0,extraction-.35)*.5,0,1.5);
  const lactate=clamp(1+4.4*anaerobic+(input.scenario==='septic'?.6:0),.7,12);
  const pulmonaryCongestion=clamp((lap-10)*8+(pap-18)*2,0,100);
  const systemicCongestion=clamp((rap-5)*8,0,100);
  const coronaryPerf=clamp(dbp-rap,5,180)*(1-input.coronaryOcclusion/100);
  const territoriallyAdjusted= input.territory==='LAD'?0.72:input.territory==='RCA'?0.80:input.territory==='LCx'?0.84:1;
  return {p,y,traces,hr,cycle:p.cycle,sv,co,ef,map,sbp,dbp,pulsePressure:pp,pms,rap,lap,pap,rv,rvr,do2,vo2,oxygenExtraction:extraction,lactate,anaerobic,perf,pulmonaryCongestion,systemicCongestion,coronaryPerf,territorialFlow:territoriallyAdjusted,
    effectiveSVR:clamp((map-Math.max(0,rap))/Math.max(co,.1)*80,100,6000),
    effectivePVR:clamp((pap-Math.max(0,lap))/Math.max(co,.1)*80,20,1800),
    LVpressure:traces.map(z=>({x:z.t*1000,y:z.pLV})),
    RVpressure:traces.map(z=>({x:z.t*1000,y:z.pRV})),
    LVvolume:traces.map(z=>({x:z.t*1000,y:z.Vlv})),
    aortic:traces.map(z=>({x:z.t*1000,y:z.Psa})),
    pulmonary:traces.map(z=>({x:z.t*1000,y:z.Ppa})),
    atrial:traces.map(z=>({x:z.t*1000,y:z.pLA})),
    flowAortic:traces.map(z=>({x:z.t*1000,y:z.qAV*1000})),
    ecg:makeECG(p, input),
    phonocardiogram:makePhono(p,input),
    pv:traces.map(z=>({x:z.Vlv,y:z.pLV})),
    phase:activation(0,p.cycle).vent
  };
}

function makeECG(p,input,n=420){const out=[];const ischemia=input.coronaryOcclusion/100;for(let i=0;i<n;i++){const x=i/n, P=activation(x*p.cycle,p.cycle);let y=0.015*Math.sin(2*Math.PI*x);y+=0.20*Math.exp(-Math.pow((x-.16)/.035,2));y-=1.0*Math.exp(-Math.pow((x-.395)/.008,2));y+=.30*Math.exp(-Math.pow((x-.415)/.013,2));y+=.27*Math.exp(-Math.pow((x-.68)/.065,2));if(ischemia){const st= input.territory==='LAD'?.42:input.territory==='RCA'?-.30:.30;y+=st*ischemia*Math.exp(-Math.pow((x-.52)/.08,2));}out.push({x:x*p.cycle*1000,y});}return out;}
function makePhono(p,input,n=420){const out=[];for(let i=0;i<n;i++){const x=i/n;let y=.85*Math.exp(-Math.pow((x-.055)/.009,2))+.72*Math.exp(-Math.pow((x-.40)/.010,2));if(input.scenario==='aorticStenosis')y+=.48*Math.exp(-Math.pow((x-.22)/.065,2));if(input.scenario==='mitralStenosis')y+=.38*Math.exp(-Math.pow((x-.68)/.05,2));if(input.scenario==='mitralRegurgitation')y+=.35*Math.exp(-Math.pow((x-.22)/.09,2));if(input.scenario==='aorticRegurgitation')y+=.24*Math.exp(-Math.pow((x-.58)/.10,2));out.push({x:x*p.cycle*1000,y});}return out;}

export function simulate(input){return integrate(input);}
export function guytonCurves(result){const cardiac=[],venous=[];const E=result.p.EmaxLV;for(let rap=-4;rap<=12;rap+=.1){const fill=clamp((rap+4)/10,0,1);cardiac.push({x:rap,y:clamp(result.co*(0.35+0.95*fill)*(E/2.95),0,14)});venous.push({x:rap,y:rap>=result.pms?0:clamp((result.pms-rap)/Math.max(result.rvr,.25),0,14)});}return{cardiac,venous,intersection:{x:result.rap,y:result.co}};}
export function frankStarling(result){return Array.from({length:70},(_,i)=>{const x=40+i*2;const y=18+105*(1-Math.exp(-x/80))*(.72+.28*result.p.EmaxLV/2.95);return{x,y};});}
export function arterialWave(result){return result.aortic;}
export function pulsePressureSeries(result){return result.aortic.map((z,i)=>({x:z.x,y:Math.max(0,z.y-result.dbp)}));}
export function causalChain(prev,next){if(next.radius<prev.radius)return['Raio ↓','R ∝ 1/r⁴','Fluxo regional ↓','Perfusão ↓','DO₂ ↓','Lactato tende ↑'];if(next.radius>prev.radius)return['Raio ↑','Resistência ↓','Fluxo regional ↑','PAM pode ↓','Perfusão ↑'];if(next.bloodVolume<prev.bloodVolume)return['Volume ↓','Pms ↓','Retorno venoso ↓','Pré-carga ↓','VS/DC ↓'];if(next.contractility<prev.contractility)return['Contratilidade ↓','Emax ↓','ESV ↑','VS ↓','DC ↓','Pressões de enchimento podem ↑'];if(next.pvr>prev.pvr)return['RVP ↑','Pós-carga do VD ↑','PAP ↑','Fluxo pulmonar comprometido'];if(next.svr>prev.svr)return['RVS ↑','Pós-carga do VE ↑','Ejeção contra maior pressão','VS pode ↓'];if(next.hr>prev.hr)return['FC ↑','Ciclo cardíaco ↓','Diástole encurta proporcionalmente mais','Enchimento pode ↓'];return['Entrada alterada','Motor 0D recalculado','Pressões/fluxos atualizados','ECG e gráficos sincronizados'];}
