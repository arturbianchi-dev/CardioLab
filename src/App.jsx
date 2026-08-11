import './styles.css';
import React, { useMemo, useState } from 'react';
import { BarChart3, BookOpen, BrainCircuit, CheckCircle2, Download, FileSpreadsheet, FileText, FlaskConical, LineChart, MessageSquareText, UploadCloud } from 'lucide-react';

const REFERENCES = [
  'Altman DG. Practical Statistics for Medical Research. Chapman & Hall/CRC, 1991.',
  'Bland M. An Introduction to Medical Statistics. Oxford University Press, 2015.',
  'Kirkwood BR, Sterne JAC. Essential Medical Statistics. Wiley-Blackwell, 2003.',
  'Pagano M, Gauvreau K. Principles of Biostatistics. CRC Press, 2018.',
  'Rosner B. Fundamentals of Biostatistics. Cengage, 2015.',
  'Zar JH. Biostatistical Analysis. Pearson, 2010.'
];

const STUDY_TYPES = [
  {
    title: 'Ensaio clínico / intervenção',
    clues: ['randomizado', 'intervenção', 'placebo', 'antes e depois', 'tratamento'],
    tests: ['t de Student ou Mann–Whitney para grupos independentes', 't pareado ou Wilcoxon para pré/pós', 'Qui-quadrado/Fisher para proporções', 'ANCOVA ou regressão para ajuste'],
    charts: ['CONSORT flow', 'forest plot', 'boxplot/violin plot', 'gráfico de barras com IC95%']
  },
  {
    title: 'Coorte longitudinal',
    clues: ['seguimento', 'incidência', 'risco', 'tempo até evento', 'sobrevida'],
    tests: ['Kaplan–Meier e log-rank', 'regressão de Cox', 'risco relativo', 'modelos mistos para medidas repetidas'],
    charts: ['curva de Kaplan–Meier', 'forest plot de hazard ratios', 'spaghetti plot', 'heatmap de desfechos']
  },
  {
    title: 'Caso-controle',
    clues: ['casos', 'controles', 'odds', 'exposição prévia'],
    tests: ['odds ratio', 'regressão logística', 'McNemar para pareados', 'Qui-quadrado/Fisher'],
    charts: ['forest plot de OR', 'mosaic plot', 'love plot de balanceamento']
  },
  {
    title: 'Transversal / prevalência',
    clues: ['prevalência', 'questionário', 'amostra', 'associação', 'transversal'],
    tests: ['estimativa de prevalência com IC95%', 'Qui-quadrado/Fisher', 'correlação Spearman/Pearson', 'regressão linear/logística'],
    charts: ['barras com IC95%', 'histograma/densidade', 'matriz de correlação', 'scatter plot']
  },
  {
    title: 'Diagnóstico / acurácia',
    clues: ['sensibilidade', 'especificidade', 'roc', 'teste diagnóstico', 'padrão ouro'],
    tests: ['sensibilidade, especificidade, VPP, VPN', 'AUC ROC', 'índice de Youden', 'Kappa'],
    charts: ['curva ROC', 'matriz de confusão', 'calibration plot']
  }
];

const R_PIPELINE = `# Pipeline R sugerido pelo StatHealth Studio
library(tidyverse)
library(readxl)
library(janitor)
library(gtsummary)
library(rstatix)
library(ggpubr)
library(survival)
library(survminer)

# 1. Importação flexível
# dados <- read_csv('dados.csv')
# dados <- read_excel('dados.xlsx')
dados_limpos <- dados |> clean_names() |> remove_empty(c('rows', 'cols'))

# 2. Dicionário automático de variáveis
dicionario <- dados_limpos |>
  summarise(across(everything(), ~ paste(class(.x), collapse = ', '))) |>
  pivot_longer(everything(), names_to = 'variavel', values_to = 'classe')

# 3. Tabela 1 em padrão de revista
tabela_1 <- dados_limpos |>
  tbl_summary(by = grupo, statistic = list(all_continuous() ~ '{mean} ({sd})')) |>
  add_p() |>
  add_overall() |>
  bold_labels()

# 4. Exemplo de teste orientado pelo tipo de variável
resultado <- dados_limpos |> t_test(desfecho ~ grupo)

# 5. Gráfico publicável
grafico <- ggboxplot(dados_limpos, x = 'grupo', y = 'desfecho', color = 'grupo',
  palette = 'jco', add = 'jitter') + theme_pubr() + labs(x = NULL, y = 'Desfecho')

ggsave('grafico_desfecho.jpg', grafico, width = 7, height = 5, dpi = 320)`;

function classifyStudy(text) {
  const lower = text.toLowerCase();
  return STUDY_TYPES.map(type => ({
    ...type,
    score: type.clues.reduce((sum, clue) => sum + (lower.includes(clue) ? 1 : 0), 0)
  })).sort((a, b) => b.score - a.score)[0];
}

function App() {
  const [planText, setPlanText] = useState('Estudo transversal com questionário para estimar prevalência e associação entre exposição e desfecho em adultos.');
  const [instructions, setInstructions] = useState('Priorizar análise ajustada por idade e sexo, com gráficos em padrão de revista clínica.');
  const recommendation = useMemo(() => classifyStudy(planText), [planText]);

  return <div className="site-shell">
    <header className="hero">
      <nav className="nav"><div className="logo"><span>SH</span> StatHealth Studio</div><a href="#analysis">Começar análise</a></nav>
      <div className="hero-grid">
        <section>
          <span className="eyebrow">Bioestatística acadêmica assistida por IA + R</span>
          <h1>Do plano de trabalho ao relatório estatístico pronto para publicação.</h1>
          <p>Uma experiência pensada para pesquisadores da saúde: o usuário anexa metodologia, introdução e dados; a plataforma categoriza o estudo, sugere testes, gera gráficos elegantes em R e devolve código, tabelas, figuras e texto de resultados.</p>
          <div className="hero-actions"><a className="primary" href="#workflow">Ver fluxo</a><a className="secondary" href="#references">Referências</a></div>
        </section>
        <aside className="glass-card impact-card">
          <BrainCircuit size={30}/><h2>Recomendação orientada por desenho de estudo</h2>
          <p>As sugestões combinam regras de decisão baseadas em livros clássicos de estatística médica com contexto fornecido pelo usuário.</p>
        </aside>
      </div>
    </header>

    <main>
      <section id="workflow" className="section">
        <span className="eyebrow">Fluxo completo</span><h2>Quatro etapas integradas</h2>
        <div className="steps">
          {[
            ['1', 'Plano acadêmico', 'Upload do projeto, metodologia, hipóteses, objetivos e descrição dos dados.', FileText],
            ['2', 'Triagem estatística', 'Classificação do estudo e sugestão de testes, modelos e gráficos adequados.', FlaskConical],
            ['3', 'Execução em R', 'Importação de CSV/XLS/XLSX, limpeza, recodificação, análise e visualização.', FileSpreadsheet],
            ['4', 'Entrega final', 'Código R explicado, relatório IA, tabelas, JPGs e sugestão de redação dos resultados.', Download]
          ].map(([n, title, text, Icon]) => <article className="step-card" key={n}><Icon/><b>{n}</b><h3>{title}</h3><p>{text}</p></article>)}
        </div>
      </section>

      <section id="analysis" className="section analysis-grid">
        <div className="panel">
          <div className="panel-title"><UploadCloud/><div><span className="eyebrow">Entrada do usuário</span><h2>Anexe ou cole o plano de trabalho</h2></div></div>
          <label className="upload-box"><input type="file" accept=".pdf,.doc,.docx,.txt"/> <FileText/> <span>PDF, DOCX ou TXT com introdução, metodologia e dados</span></label>
          <textarea value={planText} onChange={e => setPlanText(e.target.value)} aria-label="Resumo do plano de trabalho" />
        </div>
        <div className="panel recommendation">
          <span className="eyebrow">Sugestão automática</span><h2>{recommendation.title}</h2>
          <p>Pontuação de compatibilidade: {recommendation.score || 'baixa — revisar manualmente'}</p>
          <h3>Testes prováveis</h3><ul>{recommendation.tests.map(item => <li key={item}>{item}</li>)}</ul>
          <h3>Gráficos recomendados</h3><ul>{recommendation.charts.map(item => <li key={item}>{item}</li>)}</ul>
        </div>
      </section>

      <section className="section execution">
        <div><span className="eyebrow">Laboratório R no site</span><h2>Área de execução estatística</h2><p>O front-end foi desenhado para acoplar um serviço R/plumber, WebR ou ambiente seguro de execução no backend. O usuário pode enviar dados, orientar decisões e aprovar etapas antes da análise final.</p></div>
        <div className="lab-grid">
          <label className="upload-box dark"><input type="file" accept=".csv,.xls,.xlsx,.sav,.dta,.ods"/> <FileSpreadsheet/> <span>Dados em CSV, XLS, XLSX, SAV, DTA ou ODS</span></label>
          <div className="instruction-box"><MessageSquareText/><textarea value={instructions} onChange={e => setInstructions(e.target.value)} aria-label="Instruções para a análise" /></div>
        </div>
        <div className="code-card"><div><CheckCircle2/> Script R reproduzível e comentado</div><pre>{R_PIPELINE}</pre></div>
      </section>

      <section className="section outputs">
        <span className="eyebrow">Saídas geradas</span><h2>Pacote final para o pesquisador</h2>
        <div className="output-grid">
          <article><BookOpen/><h3>Relatório interpretado</h3><p>Arquivo com métodos, resultados, limitações e interpretação assistida por IA.</p></article>
          <article><BarChart3/><h3>Tabelas publicáveis</h3><p>Tabela 1, testes inferenciais, medidas de efeito e IC95% em estilo de periódico.</p></article>
          <article><LineChart/><h3>Figuras JPG</h3><p>Gráficos em 320 dpi com temas como NEJM, JAMA, Nature, Lancet e ABNT.</p></article>
          <article><FileText/><h3>Texto de resultados</h3><p>Parágrafos sugeridos com valores de p, estimativas, intervalos e linguagem acadêmica.</p></article>
        </div>
      </section>

      <section id="references" className="section references"><span className="eyebrow">Base bibliográfica</span><h2>Referências exibidas ao usuário</h2>{REFERENCES.map(ref => <p key={ref}>{ref}</p>)}</section>
    </main>
  </div>;
}

export default App;
