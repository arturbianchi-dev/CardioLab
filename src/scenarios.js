import { BASELINE } from './physiology.js';
export const SCENARIOS=[
{id:'normal',label:'Baseline fisiológico',group:'Base',description:'Estado de referência para explorar as relações cardiovasculares.',apply:()=>({...BASELINE,scenario:'normal'})},
{id:'hypovolemic',label:'Choque hipovolêmico',group:'Choques',description:'Redução do volume circulante efetivo com queda do retorno venoso e resposta vasoconstritora.',apply:()=>({...BASELINE,scenario:'hypovolemic',bloodVolume:3.1,preload:58,hr:105,svr:1900,radius:.92})},
{id:'cardiogenic',label:'Choque cardiogênico',group:'Choques',description:'Falência de bomba: contratilidade reduzida, débito baixo e congestão pulmonar.',apply:()=>({...BASELINE,scenario:'cardiogenic',contractility:45,esv:78,hr:98,preload:130,cvp:10,svr:1750})},
{id:'septic',label:'Choque distributivo / séptico',group:'Choques',description:'Vasoplegia sistêmica com queda da resistência vascular e alterações de distribuição do fluxo.',apply:()=>({...BASELINE,scenario:'septic',hr:112,svr:620,radius:1.25,preload:108,bloodVolume:5.1})},
{id:'tep',label:'Choque obstrutivo — TEP',group:'Obstrutivos',description:'Aumento agudo da resistência pulmonar com sobrecarga do ventrículo direito.',apply:()=>({...BASELINE,scenario:'tep',pvr:620,hr:108,cvp:11,preload:125,svr:1650})},
{id:'tamponade',label:'Choque obstrutivo — tamponamento',group:'Obstrutivos',description:'Aumento da pressão pericárdica reduz o enchimento ventricular efetivo.',apply:()=>({...BASELINE,scenario:'tamponade',cvp:12,preload:58,edv:85,hr:112,svr:1800})},
{id:'tensionPtx',label:'Choque obstrutivo — pneumotórax hipertensivo',group:'Obstrutivos',description:'Pressão intratorácica elevada reduz retorno venoso e altera a mecânica pulmonar.',apply:()=>({...BASELINE,scenario:'tensionPtx',intrathoracicPressure:14,preload:55,hr:118,svr:1850,pvr:390})},
{id:'leftHF',label:'Insuficiência cardíaca esquerda',group:'Falência cardíaca',description:'Disfunção do VE com queda da ejeção e predominância de congestão pulmonar.',apply:()=>({...BASELINE,scenario:'cardiogenic',contractility:50,esv:82,edv:145,preload:135,cvp:6,svr:1650})},
{id:'rightHF',label:'Insuficiência cardíaca direita',group:'Falência cardíaca',description:'Falência do VD com aumento da pressão venosa sistêmica e congestão periférica.',apply:()=>({...BASELINE,scenario:'rightHF',pvr:430,cvp:14,preload:125,hr:92,svr:1550})},
{id:'aorticStenosis',label:'Estenose aórtica',group:'Valvopatias',description:'Obstrução à ejeção do VE, com aumento da carga sistólica e sopro ejetivo.',apply:()=>({...BASELINE,scenario:'aorticStenosis',afterload:185,svr:1650,contractility:105})},
{id:'aorticRegurgitation',label:'Insuficiência aórtica',group:'Valvopatias',description:'Regurgitação diastólica da aorta para o VE, aumentando volume diastólico.',apply:()=>({...BASELINE,scenario:'aorticRegurgitation',edv:155,preload:135,afterload:88})},
{id:'mitralStenosis',label:'Estenose mitral',group:'Valvopatias',description:'Obstrução ao enchimento do VE; aumenta a pressão atrial esquerda e pode elevar a pressão pulmonar.',apply:()=>({...BASELINE,scenario:'mitralStenosis',pvr:240,preload:90,hr:86})},
{id:'mitralRegurgitation',label:'Insuficiência mitral',group:'Valvopatias',description:'Regurgitação sistólica para o átrio esquerdo, reduzindo ejeção efetiva.',apply:()=>({...BASELINE,scenario:'mitralRegurgitation',edv:150,preload:130,contractility:92})},
];
export const MI_TERRITORIES={
 LAD:{label:'LAD / descendente anterior',territory:'LAD',leads:'V1–V4 (predomínio anterior)',wall:'Parede anterior/septo',color:'#ef5968'},
 RCA:{label:'RCA / coronária direita',territory:'RCA',leads:'II, III, aVF (predomínio inferior)',wall:'Parede inferior / VD em alguns casos',color:'#5c91e8'},
 LCx:{label:'LCx / circunflexa',territory:'LCx',leads:'I, aVL, V5–V6 (lateral; pode variar)',wall:'Parede lateral',color:'#d4a74b'}
};
export function applyScenario(id){return SCENARIOS.find(s=>s.id===id)?.apply()||{...BASELINE}}
