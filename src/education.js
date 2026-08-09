export const LESSONS=[
{id:1,title:'Pressão e fluxo',concept:'Fluxo é impulsionado por gradiente de pressão e limitado pela resistência.',equation:'Q = ΔP / R',challenge:'Aumente o raio vascular e observe como o fluxo e a resistência mudam.',target:'radius'},
{id:2,title:'Lei de Poiseuille',concept:'Em fluxo laminar ideal, o raio tem efeito de quarta potência sobre a resistência.',equation:'R ∝ 1 / r⁴',challenge:'Reduza o raio para 0,8× e observe o efeito desproporcional na resistência.',target:'radius'},
{id:3,title:'Débito cardíaco',concept:'O débito é o produto da frequência cardíaca pelo volume sistólico.',equation:'DC = FC × VS',challenge:'Altere FC sem aumentar a contratilidade. Observe o impacto sobre DC.',target:'hr'},
{id:4,title:'Frank-Starling',concept:'Dentro de limites fisiológicos, maior enchimento ventricular aumenta a força e o volume ejetado.',equation:'VS ↑ com pré-carga ↑',challenge:'Varie a pré-carga e acompanhe a curva de função ventricular.',target:'preload'},
{id:5,title:'Retorno venoso',concept:'O retorno venoso depende do gradiente entre pressão sistêmica média de enchimento e pressão atrial direita.',equation:'VR = (Pms − PRA) / RVR',challenge:'Aumente o volume sanguíneo e observe Pms e o retorno venoso.',target:'bloodVolume'},
{id:6,title:'Equilíbrio de Guyton',concept:'O débito cardíaco e o retorno venoso se encontram em um ponto de equilíbrio.',equation:'CO = VR no ponto de interseção',challenge:'Aumente a contratilidade e observe a interseção se deslocar.',target:'contractility'},
{id:7,title:'Pressão arterial',concept:'A pressão arterial depende do débito cardíaco, resistência e propriedades arteriais.',equation:'PAM ≈ DC × RVS',challenge:'Mantenha DC próximo do basal e aumente a RVS.',target:'svr'},
{id:8,title:'Microcirculação',concept:'A perfusão tecidual depende do fluxo, do raio e das pressões de troca.',equation:'Fluxo = ΔP / R',challenge:'Diminua o raio e acompanhe DO₂, extração e lactato.',target:'radius'},
{id:9,title:'Regulação cardiovascular',concept:'Simpático, volume e tônus vascular interagem para manter a perfusão.',equation:'Resposta integrada',challenge:'Simule uma hemorragia e observe a compensação.',target:'bloodVolume'},
{id:10,title:'Choque',concept:'Choque é uma síndrome de hipoperfusão; os mecanismos diferem conforme a causa.',equation:'DO₂ = DC × CaO₂',challenge:'Compare choque hipovolêmico, cardiogênico, séptico e obstrutivo.',target:'scenario'},
{id:11,title:'IAM e coronárias',concept:'A obstrução coronariana produz isquemia regional e reduz a função miocárdica.',equation:'Perfusão coronariana ≈ PAD − pressão ventricular',challenge:'Selecione LAD, RCA ou LCx e conecte artéria, território e ECG.',target:'coronaryOcclusion'},
];
export const CHALLENGES=[
{id:'lowCO',title:'Diminua o débito cardíaco',goal:'Leve o DC abaixo de 3.5 L/min sem reduzir a FC.',check:p=>p.co<3.5&&p.hr>=72},
{id:'vascularHypotension',title:'Produza hipotensão vascular',goal:'PAM < 65 mmHg mantendo DC ≥ 4.5 L/min.',check:p=>p.map<65&&p.co>=4.5},
{id:'pulmonary',title:'Produza congestão pulmonar',goal:'Eleve a PAPm e a congestão pulmonar sem usar choque hipovolêmico.',check:p=>p.papMean>20&&p.pulmonaryCongestion>25},
{id:'systemic',title:'Produza congestão sistêmica',goal:'Aumente PVC e congestão venosa sistêmica.',check:p=>p.cvp>=10&&p.systemicCongestion>50},
{id:'lactate',title:'Crie hipoperfusão',goal:'Eleve o lactato acima de 3 mmol/L.',check:p=>p.lactate>3},
{id:'pulse',title:'Aumente a pressão de pulso',goal:'Leve a pressão de pulso acima de 65 mmHg.',check:p=>p.pulsePressure>65},
];
