export const LESSONS=[
{id:'pressure-flow',level:1,title:'Pressão e fluxo',formula:'Q = ΔP / R',goal:'Observe como um gradiente de pressão produz fluxo e como a resistência modula o fluxo.'},
{id:'poiseuille',level:2,title:'Lei de Poiseuille',formula:'R ∝ 1 / r⁴',goal:'Experimente a relação não linear entre raio e resistência.'},
{id:'heart',level:3,title:'Coração: FC, VS e DC',formula:'CO = HR × SV',goal:'Altere a frequência e veja ciclo cardíaco, volume sistólico e débito responderem.'},
{id:'frank-starling',level:4,title:'Frank-Starling',formula:'SV ↑ com pré-carga ↑',goal:'Desloque a curva de Frank-Starling alterando pré-carga e contratilidade.'},
{id:'venous-return',level:5,title:'Retorno venoso',formula:'VR = (Pms − RAP) / RVR',goal:'Altere volume sanguíneo e complacência venosa para modificar Pms e retorno venoso.'},
{id:'guyton',level:6,title:'Equilíbrio de Guyton',formula:'CO = VR',goal:'Mova as curvas cardíaca e de retorno venoso e observe o novo ponto de equilíbrio.'},
{id:'arterial-pressure',level:7,title:'Pressão arterial',formula:'MAP ≈ CO × SVR',goal:'Produza alterações de pressão modificando débito ou resistência.'},
{id:'microcirculation',level:8,title:'Microcirculação',formula:'Jv = Kf[(Pc − Pi) − σ(πc − πi)]',goal:'Relacione pressão hidrostática, oncótica e filtração capilar.'},
{id:'regulation',level:9,title:'Regulação cardiovascular',formula:'barorreflexo → HR + SVR + contratilidade',goal:'Observe como o sistema autonômico compensa perturbações.'},
{id:'shock',level:10,title:'Choque',formula:'DO₂ = CO × CaO₂',goal:'Compare mecanismos diferentes de choque em vez de apenas observar a pressão.'},
{id:'integration',level:11,title:'Integração clínica',formula:'mecanismo → hemodinâmica → clínica',goal:'Use o laboratório para explicar IAM, insuficiência cardíaca e valvopatias.'}
];
export const CLINICAL_CASES=[
{id:'hemorrhage',title:'Hemorragia aguda',difficulty:'Básico',brief:'Perda importante de volume circulante com compensação simpática.',preset:'hypovolemic',clues:['CVP baixa','taquicardia','vasoconstrição','lactato em elevação']},
{id:'cardiogenic',title:'Choque cardiogênico',difficulty:'Intermediário',brief:'Falência de bomba com pressões de enchimento elevadas.',preset:'cardiogenic',clues:['CO baixo','congestão pulmonar','perfusão reduzida','lactato elevado']},
{id:'septic',title:'Choque distributivo',difficulty:'Intermediário',brief:'Vasodilatação sistêmica e distribuição anormal do fluxo.',preset:'septic',clues:['SVR baixa','taquicardia','PAM baixa','lactato pode subir']},
{id:'leftHF',title:'Insuficiência cardíaca esquerda',difficulty:'Intermediário',brief:'Aumento das pressões de enchimento esquerdas e congestão pulmonar.',preset:'leftHF',clues:['pressão atrial esquerda elevada','congestão pulmonar','FE reduzida']},
{id:'rightHF',title:'Insuficiência cardíaca direita',difficulty:'Intermediário',brief:'Congestão venosa sistêmica predominante.',preset:'rightHF',clues:['RAP elevada','congestão sistêmica','fígado congesto']},
{id:'aorticStenosis',title:'Estenose aórtica',difficulty:'Avançado',brief:'Obstrução à ejeção do ventrículo esquerdo.',preset:'aorticStenosis',clues:['pós-carga elevada','gradiente LV-Ao','sopro sistólico']},
{id:'MI',title:'IAM — identifique a coronária',difficulty:'Avançado',brief:'Use anatomia, perfusão regional e ECG para identificar o território.',preset:'normal',clues:['alteração regional','ECG dinâmico','fluxo coronariano reduzido']}
];
export const CHALLENGES=[
{id:'low-map-constant-co',title:'Hipotensão sem reduzir o débito',difficulty:'★★★',objective:p=>p.map<78&&p.co>=4.5,hint:'Reduza a resistência vascular sem derrubar o débito.'},
{id:'pulmonary-congestion',title:'Produza congestão pulmonar',difficulty:'★★',objective:p=>p.pulmonaryCongestion>45,hint:'Aumente as pressões de enchimento esquerdas.'},
{id:'systemic-congestion',title:'Produza congestão sistêmica',difficulty:'★★',objective:p=>p.systemicCongestion>35,hint:'Aumente a pressão atrial direita.'},
{id:'pulse-pressure',title:'Aumente a pressão de pulso',difficulty:'★★',objective:p=>p.pulsePressure>70,hint:'Experimente volume sistólico e complacência arterial.'},
{id:'lactate',title:'Leve o lactato acima de 4 mmol/L',difficulty:'★★★',objective:p=>p.lactate>4,hint:'Reduza perfusão de forma sustentada.'},
{id:'low-co',title:'Produza baixo débito',difficulty:'★★★',objective:p=>p.co<3.2,hint:'Reduza contratilidade ou pré-carga.'}
];
export const MODEL_SOURCES=[
['Guyton & Hall','Textbook of Medical Physiology','Débito cardíaco, retorno venoso, pressão arterial e microcirculação.'],
['Ursino (1998)','Interaction between carotid baroregulation and the pulsating heart','Modelo cardiovascular compartimental acoplado ao barorreflexo.'],
['Westerhof et al.','The arterial tree: models and applications','Windkessel, impedância arterial e propagação de pressão.'],
['Ursino et al.','Cardiovascular mechanics / compartmental modelling','Modelagem lumped-parameter e elastância variável.']
];
