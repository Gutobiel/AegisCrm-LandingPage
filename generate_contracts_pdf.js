/**
 * Aegis CRM — Gerador de Contratos PDF Jurídicos (Regime B2B Paritário)
 * CNPJ: 67.155.126/0001-06 | AEGIS TECNOLOGIA
 * Em conformidade com o Código Civil Brasileiro (Art. 421-A), Lei da Liberdade
 * Econômica (Lei nº 13.874/2019), LGPD (Lei nº 13.709/2018), Lei do Software
 * (Lei nº 9.609/1998), Marco Civil da Internet (Lei nº 12.965/2014) e CPC/2015.
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// Diretórios de saída (principal e compatibilidade legada)
const OUT_DIR = path.join(__dirname, 'src', 'assets', 'contratos');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const OUT_DIR_LEGACY = path.join(__dirname, 'assets', 'contratos');
if (!fs.existsSync(OUT_DIR_LEGACY)) fs.mkdirSync(OUT_DIR_LEGACY, { recursive: true });

// Paleta tipográfica e visual
const COLOR = {
  ink:    '#0f172a',
  brand:  '#1e3a8a',
  muted:  '#64748b',
  line:   '#cbd5e1',
  footer: '#94a3b8',
  body:   '#1e293b',
  box:    '#eff6ff',
  accent: '#2563eb',
};

// ─── Matriz de Configurações dos 6 Contratos ──────────────────────────────────
const CONTRACTS = [
  // ── ESSENCIAL ──────────────────────────────────────────────────────────────
  {
    file: 'contrato-essencial-mensal.pdf', plan: 'Essencial', mode: 'Mensal',
    priceDisplay: 'R$ 497,00/mês — faturado mensalmente (sem fidelidade)',
    priceClause:  'R$ 497,00 (quatrocentos e noventa e sete reais) mensais',
    billingDesc:  'mensalmente, a cada 30 (trinta) dias corridos, mediante débito recorrente no cartão de crédito corporativo ou liquidação de fatura PIX gerada no primeiro dia de cada ciclo',
    discountNote: null,
    sla:          'Suporte técnico via e-mail e chat in-app — primeira resposta em até 48 (quarenta e oito) horas úteis.',
    dataWindow:   '30 (trinta) dias corridos',
    liabilityCap: 'o montante total correspondente a 12 (doze) mensalidades do Plano Essencial vigentes à época do evento',
    features: [
      'Até 3 (três) usuários simultâneos com controle de acesso por papel;',
      '2 (dois) funis de vendas configuráveis (com até 8 etapas por funil);',
      'Visualização híbrida: Quadro Kanban interativo e Tabela de dados;',
      '2 (duas) conexões WhatsApp simultâneas integradas via cluster WAHA;',
      'Transcrição automática de áudios do WhatsApp por IA (Whisper);',
      '1 (um) agente autônomo de Inteligência Artificial para triagem e qualificação;',
      'Franquia mensal de 1.000.000 (um milhão) de tokens de IA generativa;',
      'Copiloto de vendas em tempo real com sugestões contextuais de resposta;',
      'Base de conhecimento RAG para documentos institucionais, catálogos e FAQs;',
      'Até 5 (cinco) fluxos de trabalho (workflows) e automações ativas;',
      'Geração de propostas comerciais em PDF com disparo direto via WhatsApp;',
      'Formulário público de captura de leads e widget incorporável para websites;',
      'Criptografia AES-256-GCM em repouso e isolamento multi-tenant PostgreSQL RLS.',
    ],
    renewal:      'Vigência mensal por prazo indeterminado, com renovação automática a cada 30 dias. Cancelamento a qualquer momento pelo painel, sem multa rescisória. Reajuste anual pelo IPCA/IBGE.',
    cancellation: 'Sem fidelidade: não há incidência de multa rescisória. O acesso à Plataforma permanece ativo até o término do ciclo mensal já pago, inexistindo reembolso proporcional de dias restantes.',
    penalty:      'Inexiste cláusula penal compensatória para a modalidade mensal sem fidelidade.',
  },
  {
    file: 'contrato-essencial-anual.pdf', plan: 'Essencial', mode: 'Anual',
    priceDisplay: 'R$ 4.970,00/ano (equivalente a R$ 414,16/mês — 16,67% de economia)',
    priceClause:  'R$ 4.970,00 (quatro mil, novecentos e setenta reais) anuais',
    billingDesc:  'anualmente, em parcela única à vista ou parcelado em até 12 (doze) vezes no cartão de crédito corporativo',
    discountNote: 'Benefício tarifário de 16,67% (dezesseis vírgula sessenta e sete por cento) de desconto concedido expressamente em contrapartida ao compromisso de permanência mínima de 12 (doze) meses.',
    sla:          'Suporte técnico via e-mail e chat in-app — primeira resposta em até 48 (quarenta e oito) horas úteis.',
    dataWindow:   '30 (trinta) dias corridos',
    liabilityCap: 'o montante total da anuidade efetivamente contratada do Plano Essencial',
    features: [
      'Até 3 (três) usuários simultâneos com controle de acesso por papel;',
      '2 (dois) funis de vendas configuráveis (com até 8 etapas por funil);',
      'Visualização híbrida: Quadro Kanban interativo e Tabela de dados;',
      '2 (duas) conexões WhatsApp simultâneas integradas via cluster WAHA;',
      'Transcrição automática de áudios do WhatsApp por IA (Whisper);',
      '1 (um) agente autônomo de Inteligência Artificial para triagem e qualificação;',
      'Franquia mensal de 1.000.000 (um milhão) de tokens de IA generativa;',
      'Copiloto de vendas em tempo real com sugestões contextuais de resposta;',
      'Base de conhecimento RAG para documentos institucionais, catálogos e FAQs;',
      'Até 5 (cinco) fluxos de trabalho (workflows) e automações ativas;',
      'Geração de propostas comerciais em PDF com disparo direto via WhatsApp;',
      'Formulário público de captura de leads e widget incorporável para websites;',
      'Criptografia AES-256-GCM em repouso e isolamento multi-tenant PostgreSQL RLS.',
    ],
    renewal:      'Vigência determinada de 12 (doze) meses. Renovação automática por iguais períodos anuais sucessivos, salvo notificação formal em contrário com antecedência mínima de 30 dias. Notificação prévia de renovação enviada pela Licenciante 30 dias antes do término. Reajuste anual pelo IPCA/IBGE.',
    cancellation: 'Rescisão antecipada imotivada (antes de 12 meses): notificação prévia de 30 dias. Incide retenção compensatória de 30% (trinta por cento) sobre o saldo vincendo das parcelas remanescentes para compensação de infraestrutura e perda do benefício tarifário anual (CC Art. 603 e jurisprudência TJSP).',
    penalty:      'Multa compensatória de 30% (trinta por cento) calculada sobre o saldo financeiro remanescente das parcelas vincendas até o encerramento do período contratual de 12 meses.',
  },

  // ── CRESCIMENTO ────────────────────────────────────────────────────────────
  {
    file: 'contrato-crescimento-mensal.pdf', plan: 'Crescimento', mode: 'Mensal',
    priceDisplay: 'R$ 997,00/mês — faturado mensalmente (sem fidelidade)',
    priceClause:  'R$ 997,00 (novecentos e noventa e sete reais) mensais',
    billingDesc:  'mensalmente, a cada 30 (trinta) dias corridos, mediante faturamento e cobrança recorrente no meio de pagamento ativo',
    discountNote: null,
    sla:          'Suporte prioritário via WhatsApp e central de ajuda — primeira resposta em até 12 (doze) horas úteis + 1 sessão de onboarding assistido.',
    dataWindow:   '30 (trinta) dias corridos',
    liabilityCap: 'o montante total correspondente a 12 (doze) mensalidades do Plano Crescimento vigentes à época do evento',
    features: [
      'Até 10 (dez) usuários simultâneos com papéis de acesso segmentados por setor;',
      '10 (dez) funis de vendas comerciais configuráveis (com até 15 etapas por funil);',
      '5 (cinco) conexões WhatsApp com multiatendimento, filas e roteamento inteligente;',
      'Proteção avançada anti-banimento (Warmup de chips) e debouncing de 60 segundos;',
      '3 (três) agentes autônomos de IA com personalização completa de tom de voz;',
      'Franquia mensal de 1.000.000 (um milhão) de tokens de IA generativa;',
      'Análise de sentimento das conversas e classificação comportamental de leads;',
      'Geração de orçamentos em PDF com envio automático de chave PIX pela IA;',
      'Base de conhecimento RAG com upload de documentos institucionais e manuais;',
      'Até 30 (trinta) workflows ativos com gatilhos comportamentais e webhooks;',
      'Módulo Comercial Avançado: contratos, faturas recorrentes e ordens de compra;',
      'Gestão de Equipes: metas individuais/setoriais, distribuição Round-Robin;',
      'BI analítico em tempo real com Redis, drill-down e exportação CSV/Excel/PDF;',
      'API REST de consulta (leitura) e até 10 webhooks externos de integração.',
    ],
    renewal:      'Vigência mensal por prazo indeterminado, com renovação automática a cada 30 dias. Cancelamento a qualquer momento pelo painel, sem multa rescisória. Reajuste anual pelo IPCA/IBGE.',
    cancellation: 'Sem fidelidade: sem multa rescisória. O serviço permanece ativo até o encerramento do ciclo mensal já faturado, sem devolução proporcional.',
    penalty:      'Inexiste cláusula penal compensatória para a modalidade mensal sem fidelidade.',
  },
  {
    file: 'contrato-crescimento-anual.pdf', plan: 'Crescimento', mode: 'Anual',
    priceDisplay: 'R$ 9.970,00/ano (equivalente a R$ 830,83/mês — 16,65% de economia)',
    priceClause:  'R$ 9.970,00 (nove mil, novecentos e setenta reais) anuais',
    billingDesc:  'anualmente, em parcela única à vista ou parcelado em até 12 (doze) vezes no cartão de crédito corporativo',
    discountNote: 'Benefício tarifário de 16,65% (dezesseis vírgula sessenta e cinco por cento) de desconto concedido expressamente em contrapartida ao compromisso de permanência de 12 (doze) meses.',
    sla:          'Suporte prioritário via WhatsApp e central de ajuda — primeira resposta em até 12 (doze) horas úteis + 1 sessão de onboarding assistido.',
    dataWindow:   '30 (trinta) dias corridos',
    liabilityCap: 'o montante total da anuidade efetivamente contratada do Plano Crescimento',
    features: [
      'Até 10 (dez) usuários simultâneos com papéis de acesso segmentados por setor;',
      '10 (dez) funis de vendas comerciais configuráveis (com até 15 etapas por funil);',
      '5 (cinco) conexões WhatsApp com multiatendimento, filas e roteamento inteligente;',
      'Proteção avançada anti-banimento (Warmup de chips) e debouncing de 60 segundos;',
      '3 (três) agentes autônomos de IA com personalização completa de tom de voz;',
      'Franquia mensal de 1.000.000 (um milhão) de tokens de IA generativa;',
      'Análise de sentimento das conversas e classificação comportamental de leads;',
      'Geração de orçamentos em PDF com envio automático de chave PIX pela IA;',
      'Base de conhecimento RAG com upload de documentos institucionais e manuais;',
      'Até 30 (trinta) workflows ativos com gatilhos comportamentais e webhooks;',
      'Módulo Comercial Avançado: contratos, faturas recorrentes e ordens de compra;',
      'Gestão de Equipes: metas individuais/setoriais, distribuição Round-Robin;',
      'BI analítico em tempo real com Redis, drill-down e exportação CSV/Excel/PDF;',
      'API REST de consulta (leitura) e até 10 webhooks externos de integração.',
    ],
    renewal:      'Vigência determinada de 12 (doze) meses. Renovação automática por períodos sucessivos de 1 ano, salvo notificação contrária com antecedência mínima de 30 dias. Notificação prévia enviada pela Licenciante 30 dias antes do término. Reajuste anual pelo IPCA/IBGE.',
    cancellation: 'Rescisão antecipada imotivada (antes de 12 meses): notificação prévia de 30 dias. Incide retenção compensatória de 30% (trinta por cento) sobre o saldo vincendo das parcelas remanescentes para compensação de infraestrutura e perda do benefício tarifário anual (CC Art. 603 e jurisprudência TJSP).',
    penalty:      'Multa compensatória de 30% (trinta por cento) sobre as parcelas vincendas até o término dos 12 meses contratados.',
  },

  // ── ENTERPRISE ─────────────────────────────────────────────────────────────
  {
    file: 'contrato-enterprise-mensal.pdf', plan: 'Enterprise', mode: 'Mensal',
    priceDisplay: 'R$ 2.997,00/mês — faturado mensalmente (sem fidelidade)',
    priceClause:  'R$ 2.997,00 (dois mil, novecentos e noventa e sete reais) mensais',
    billingDesc:  'mensalmente, a cada 30 (trinta) dias corridos, mediante faturamento corporativo recorrente',
    discountNote: null,
    sla:          'SLA garantido de atendimento: resposta em até 4 (quatro) horas úteis. Suporte VIP 24/7 (WhatsApp e telefone). Gerente de Contas Dedicado. Onboarding corporativo assistido (3 sessões técnicas).',
    dataWindow:   '60 (sessenta) dias corridos (janela corporativa estendida)',
    liabilityCap: 'o montante total correspondente a 12 (doze) mensalidades do Plano Enterprise vigentes à época do evento',
    features: [
      'Usuários, operadores comerciais e administradores ilimitados;',
      'Funis de vendas comerciais ilimitados (com até 25 etapas por funil);',
      '20 (vinte) conexões WhatsApp em Cluster WAHA multi-nó com balanceamento de carga;',
      'Sistema de Warmup avançado anti-banimento para operação em escala;',
      'Agentes autônomos de IA ilimitados e franquia superior a 5.000.000 tokens/mês;',
      'BYOK (Bring Your Own Key): conexão direta com OpenAI, Anthropic Claude e Google Gemini;',
      'Few-Shot Learning ativo — calibração contínua com base no histórico real de conversas;',
      'Orquestrador cognitivo de 6 camadas com governança, limiares e transbordo customizáveis;',
      'Workflows ilimitados com 17 ações nativas, webhooks externos e nós de ferramentas;',
      'API REST completa (leitura e escrita) e Webhooks de entrada/saída ilimitados;',
      'White-Label integral: marca, domínio próprio, logotipo, favicon e e-mails SMTP próprios;',
      'Autenticação corporativa SSO (Single Sign-On) com perfis granulares de permissão;',
      'Relatório analítico de ROI de IA, logs de auditoria imutáveis e conformidade LGPD avançada;',
      'Cláusula arbitral e Acordo de Tratamento de Dados (DPA) customizado disponíveis.',
    ],
    renewal:      'Vigência mensal por prazo indeterminado, com renovação automática a cada 30 dias. Cancelamento mediante notificação formal com antecedência mínima de 30 dias, sem multa rescisória. Janela garantida de 60 dias para exportação integral dos dados.',
    cancellation: 'Sem fidelidade: inexiste multa rescisória. Notificação prévia de 30 dias obrigatória para desalocação de infraestrutura. Janela de carência de 60 dias garantida para download completo da base em formato JSON/CSV.',
    penalty:      'Inexiste cláusula penal compensatória para a modalidade mensal sem fidelidade.',
  },
  {
    file: 'contrato-enterprise-anual.pdf', plan: 'Enterprise', mode: 'Anual',
    priceDisplay: 'R$ 29.970,00/ano (equivalente a R$ 2.497,50/mês — 16,66% de economia)',
    priceClause:  'R$ 29.970,00 (vinte e nove mil, novecentos e setenta reais) anuais',
    billingDesc:  'anualmente, em parcela única à vista ou parcelado em até 12 (doze) vezes no cartão de crédito corporativo',
    discountNote: 'Benefício tarifário de 16,66% (dezesseis vírgula sessenta e seis por cento) de desconto concedido expressamente em contrapartida ao compromisso de permanência de 12 (doze) meses.',
    sla:          'SLA garantido de atendimento: resposta em até 4 (quatro) horas úteis. Suporte VIP 24/7 (WhatsApp e telefone). Gerente de Contas Dedicado. Onboarding corporativo assistido (3 sessões técnicas).',
    dataWindow:   '60 (sessenta) dias corridos (janela corporativa estendida)',
    liabilityCap: 'o montante total da anuidade efetivamente contratada do Plano Enterprise',
    features: [
      'Usuários, operadores comerciais e administradores ilimitados;',
      'Funis de vendas comerciais ilimitados (com até 25 etapas por funil);',
      '20 (vinte) conexões WhatsApp em Cluster WAHA multi-nó com balanceamento de carga;',
      'Sistema de Warmup avançado anti-banimento para operação em escala;',
      'Agentes autônomos de IA ilimitados e franquia superior a 5.000.000 tokens/mês;',
      'BYOK (Bring Your Own Key): conexão direta com OpenAI, Anthropic Claude e Google Gemini;',
      'Few-Shot Learning ativo — calibração contínua com base no histórico real de conversas;',
      'Orquestrador cognitivo de 6 camadas com governança, limiares e transbordo customizáveis;',
      'Workflows ilimitados com 17 ações nativas, webhooks externos e nós de ferramentas;',
      'API REST completa (leitura e escrita) e Webhooks de entrada/saída ilimitados;',
      'White-Label integral: marca, domínio próprio, logotipo, favicon e e-mails SMTP próprios;',
      'Autenticação corporativa SSO (Single Sign-On) com perfis granulares de permissão;',
      'Relatório analítico de ROI de IA, logs de auditoria imutáveis e conformidade LGPD avançada;',
      'Cláusula arbitral e Acordo de Tratamento de Dados (DPA) customizado disponíveis.',
    ],
    renewal:      'Vigência determinada de 12 (doze) meses. Renovação automática por períodos iguais sucessivos de 1 ano, salvo notificação contrária com antecedência mínima de 30 dias. Notificação prévia enviada 30 dias antes do término. Reajuste anual pelo IPCA/IBGE.',
    cancellation: 'Rescisão antecipada imotivada (antes de 12 meses): notificação formal prévia de 30 dias. Incide retenção compensatória de 30% (trinta por cento) sobre o saldo vincendo remanescente (CC Art. 603). Janela de carência de 60 dias garantida para download completo da base em formato JSON/CSV.',
    penalty:      'Multa compensatória de 30% (trinta por cento) sobre o saldo de parcelas vincendas até o encerramento dos 12 meses contratados.',
  },
];

// ─── Renderizador de PDF ───────────────────────────────────────────────────────
function buildPDF(cfg) {
  return new Promise((resolve, reject) => {
    const ML = 55, MR = 55, MT = 55, MB = 50;
    const filePath = path.join(OUT_DIR, cfg.file);
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: MT, bottom: MB, left: ML, right: MR },
      autoFirstPage: true,
      bufferPages: true,
      info: {
        Title:   `Aegis CRM — Contrato ${cfg.plan} ${cfg.mode}`,
        Author:  'Aegis CRM Tecnologia — CNPJ 67.155.126/0001-06',
        Subject: `Licença SaaS B2B — Plano ${cfg.plan} (${cfg.mode})`,
        Keywords:'SaaS, CRM, Contrato B2B, Licenciamento, LGPD, SLA',
      },
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const PW = doc.page.width;           // 595.28
    const W  = PW - ML - MR;            // 485.28
    const PH = doc.page.height;         // 841.89
    const CONTENT_BOTTOM = PH - MB - 18;

    // ── Helpers ──────────────────────────────────────────────────────────────
    function hRule(y, color, w) {
      doc.save().lineWidth(w || 0.5).strokeColor(color || COLOR.line)
        .moveTo(ML, y).lineTo(ML + W, y).stroke().restore();
    }

    function newPage() {
      doc.addPage();
      doc.x = ML;
      doc.y = MT;
    }

    function ensureSpace(needed) {
      if (doc.y + needed > CONTENT_BOTTOM) newPage();
    }

    function sectionTitle(num, title) {
      ensureSpace(42);
      doc.moveDown(0.65);
      doc.x = ML;
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor(COLOR.brand)
        .text(`CLÁUSULA ${num} — ${title.toUpperCase()}`, ML, doc.y, { width: W });
      const ry = doc.y + 3;
      hRule(ry, COLOR.brand, 0.75);
      doc.x = ML;
      doc.y = ry + 7;
    }

    function para(text, { bold = false, small = false, color = COLOR.body } = {}) {
      ensureSpace(18);
      doc.x = ML;
      doc.fontSize(small ? 7.5 : 8.5)
        .font(bold ? 'Helvetica-Bold' : 'Helvetica')
        .fillColor(color)
        .text(text, ML, doc.y, { width: W, align: 'justify', lineGap: 2.3 });
      doc.x = ML;
      doc.moveDown(0.38);
    }

    function bullet(text) {
      ensureSpace(15);
      const dotX = ML + 4;
      const txtX = ML + 14;
      const txtW = W - 14;
      const startY = doc.y;
      doc.fontSize(8.5).font('Helvetica').fillColor(COLOR.body)
        .text('\u2022', dotX, startY, { width: 10, lineBreak: false });
      doc.text(text, txtX, startY, { width: txtW, align: 'justify', lineGap: 2 });
      doc.x = ML;
      doc.moveDown(0.22);
    }

    function infoBox(label, value) {
      ensureSpace(24);
      const by = doc.y;
      const bh = 19;
      doc.save().rect(ML, by, W, bh).fillColor(COLOR.box).fill().restore();
      doc.x = ML;
      doc.fontSize(7.5).font('Helvetica-Bold').fillColor(COLOR.brand)
        .text(label.toUpperCase() + ':', ML + 6, by + 5, { width: 135, lineBreak: false });
      doc.fontSize(7.5).font('Helvetica').fillColor(COLOR.ink)
        .text(value, ML + 145, by + 5, { width: W - 150, lineBreak: false });
      doc.x = ML;
      doc.y = by + bh + 3.5;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PÁGINA 1 — CABEÇALHO E SUMÁRIO CONTRATUAL
    // ─────────────────────────────────────────────────────────────────────────
    doc.x = ML;
    doc.y = MT;

    hRule(MT - 5, COLOR.brand, 1.5);
    doc.moveDown(0.2);

    doc.x = ML;
    doc.fontSize(14).font('Helvetica-Bold').fillColor(COLOR.ink)
      .text('AEGIS CRM TECNOLOGIA', ML, doc.y, { width: W, align: 'center' });
    doc.x = ML;
    doc.fontSize(8).font('Helvetica').fillColor(COLOR.muted)
      .text('CNPJ 67.155.126/0001-06  ·  develop.ags@gmail.com', ML, doc.y, { width: W, align: 'center' });
    doc.x = ML;
    doc.moveDown(0.35);
    doc.fontSize(8.5).font('Helvetica-Bold').fillColor(COLOR.brand)
      .text('CONTRATO DE PRESTAÇÃO DE SERVIÇOS E LICENCIAMENTO SAAS B2B', ML, doc.y, { width: W, align: 'center' });
    doc.x = ML;
    doc.fontSize(11).font('Helvetica-Bold').fillColor(COLOR.ink)
      .text(`PLANO ${cfg.plan.toUpperCase()} — MODALIDADE ${cfg.mode.toUpperCase()}`, ML, doc.y, { width: W, align: 'center' });
    doc.x = ML;
    doc.moveDown(0.5);
    hRule(doc.y, COLOR.brand, 1.5);
    doc.x = ML;
    doc.y += 10;

    // Caixas informativas
    infoBox('Regime Jurídico',  'Empresarial B2B — Código Civil Art. 421-A | Lei da Liberdade Econômica (Lei nº 13.874/2019)');
    infoBox('Licenciante',      'AEGIS CRM TECNOLOGIA  ·  CNPJ 67.155.126/0001-06  ·  Endereço a definir');
    infoBox('Contato / DPO',    'develop.ags@gmail.com  (Suporte · Vendas · Encarregado LGPD)');
    infoBox('Plano / Modo',     `${cfg.plan}  —  ${cfg.mode}`);
    infoBox('Valor',            cfg.priceDisplay);
    infoBox('Faturamento',      cfg.billingDesc);
    infoBox('Trial Gratuito',   '7 (sete) dias corridos — cancelamento sem ônus durante o período de testes');
    doc.moveDown(0.6);

    // ─────────────────────────────────────────────────────────────────────────
    // CLÁUSULA 1ª — DAS PARTES E DO ENQUADRAMENTO B2B
    // ─────────────────────────────────────────────────────────────────────────
    sectionTitle('PRIMEIRA', 'Das Partes e do Enquadramento Jurídico B2B');
    para('1.1. LICENCIANTE: AEGIS CRM TECNOLOGIA, pessoa jurídica de direito privado, inscrita no CNPJ/MF sob o nº 67.155.126/0001-06, com sede em Endereço a definir, e-mail de suporte e atendimento develop.ags@gmail.com, doravante denominada simplesmente "LICENCIANTE" ou "AEGIS CRM".');
    para('1.2. CONTRATANTE: Pessoa jurídica regularmente constituída, com CNPJ ativo e cadastro validado no formulário eletrônico e checkout da Plataforma, doravante denominada simplesmente "CONTRATANTE" ou "LICENCIADA".');
    para('1.3. ENQUADRAMENTO B2B E INSUMO PRODUTIVO COMERCIAL (CC Art. 421-A): A CONTRATANTE declara de forma inequívoca que é pessoa jurídica em plena atividade empresarial e que a contratação da Plataforma destina-se estrita e exclusivamente como INSUMO PRODUTIVO COMERCIAL, FERRAMENTA DE GESTÃO DE VENDAS E INSTRUMENTO DE PRODUTIVIDADE EMPRESARIAL. A presente relação jurídica é expressamente regida pelos Artigos 421 e 421-A do Código Civil Brasileiro e pela Lei da Liberdade Econômica (Lei nº 13.874/2019), com presunção legal de paridade e simetria contratual, restando afastada a incidência do Código de Defesa do Consumidor (Lei nº 8.078/1990).');
    para('Fundamentação Legal: Código Civil, Arts. 421 e 421-A; Lei nº 13.874/2019; STJ AgInt no AREsp 1.637.288/SP.', { small: true, color: COLOR.muted });

    // ─────────────────────────────────────────────────────────────────────────
    // CLÁUSULA 2ª — DO OBJETO E DA LICENÇA SAAS
    // ─────────────────────────────────────────────────────────────────────────
    sectionTitle('SEGUNDA', 'Do Objeto e da Concessão da Licença SaaS');
    para(`2.1. Constitui objeto deste Contrato a prestação continuada de serviços de tecnologia da informação e a concessão, pela LICENCIANTE à CONTRATANTE, de licença de uso temporária, revogável, não exclusiva, intransferível e sem direito a sublicenciamento do software Aegis CRM na modalidade Software as a Service (SaaS), nos limites do PLANO ${cfg.plan.toUpperCase()} — ${cfg.mode.toUpperCase()}.`);
    para('2.2. A licença restringe-se ao acesso e uso operacional via navegadores de internet e APIs oficiais, não conferindo a cessão ou transferência de código-fonte, marcas, patentes, segredos de negócio ou quaisquer outros direitos de propriedade intelectual da LICENCIANTE (Lei nº 9.609/1998, Arts. 1º, 2º e 9º; STF ADIs 5659 e 5658).');

    // ─────────────────────────────────────────────────────────────────────────
    // CLÁUSULA 3ª — DAS ESPECIFICAÇÕES DO PLANO
    // ─────────────────────────────────────────────────────────────────────────
    sectionTitle('TERCEIRA', `Das Especificações e Recursos do Plano ${cfg.plan}`);
    para(`3.1. A subscrição ativa confere à CONTRATANTE os seguintes módulos, limites operacionais e recursos no PLANO ${cfg.plan.toUpperCase()} — ${cfg.mode.toUpperCase()}:`);
    cfg.features.forEach(f => bullet(f));
    if (cfg.discountNote) {
      doc.moveDown(0.2);
      para(`3.2. BENEFÍCIO TARIFÁRIO APLICADO: ${cfg.discountNote}`);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CLÁUSULA 4ª — DO PREÇO, FATURAMENTO E PAGAMENTO
    // ─────────────────────────────────────────────────────────────────────────
    sectionTitle('QUARTA', 'Do Preço, Faturamento e Condições de Pagamento');
    para(`4.1. Como contraprestação pela licença de uso e disponibilização contínua da infraestrutura SaaS, a CONTRATANTE pagará à LICENCIANTE a quantia de ${cfg.priceClause}, faturada ${cfg.billingDesc}.`);
    para('4.2. O pagamento será processado via cartão de crédito corporativo cadastrado na Plataforma ou liquidação de fatura bancária/PIX emitida pela LICENCIANTE com vencimento no primeiro dia de cada ciclo contratual.');
    para('4.3. INADIMPLEMENTO E ENCARGOS MORATÓRIOS: O atraso no pagamento sujeitará a CONTRATANTE ao pagamento de: (a) multa moratória de 2% (dois por cento) sobre o valor total do débito; (b) juros de mora de 1% (um por cento) ao mês calculados pro-rata die; e (c) atualização monetária pela variação acumulada do IPCA/IBGE (CC Arts. 394 e 395).');
    para('4.4. SUSPENSÃO POR INADIMPLÊNCIA: Transcorridos 5 (cinco) dias úteis de inadimplemento, a LICENCIANTE poderá suspender temporariamente o acesso do tenant à Plataforma (CC Art. 476 — Exceção do Contrato Não Cumprido), sem prejuízo da cobrança integral dos valores devidos acrescidos dos encargos moratórios.');
    para('4.5. REAJUSTE ANUAL: Os valores serão reajustados a cada 12 (doze) meses pela variação positiva acumulada do IPCA/IBGE (ou, na sua falta, do IGP-M/FGV), mediante notificação prévia de 30 (trinta) dias.');

    // ─────────────────────────────────────────────────────────────────────────
    // CLÁUSULA 5ª — DO TRIAL, CANCELAMENTO, RESCISÃO E JUSTA CAUSA
    // ─────────────────────────────────────────────────────────────────────────
    sectionTitle('QUINTA', 'Do Trial Gratuito, Cancelamento, Rescisão e Justa Causa');
    para('5.1. DEGUSTAÇÃO (TRIAL GRATUITO DE 7 DIAS): A CONTRATANTE dispõe de 7 (sete) dias corridos de degustação gratuita a contar da criação da conta. Caso solicite o cancelamento dentro deste período via painel, a conta será encerrada sem qualquer cobrança.');
    para(`5.2. RESCISÃO IMOTIVADA: ${cfg.cancellation}`);
    para(`5.3. CLÁUSULA PENAL COMPENSATÓRIA: ${cfg.penalty}`);
    para('5.4. RESCISÃO POR JUSTA CAUSA: O presente Contrato poderá ser rescindido de pleno direito, por justa causa e sem qualquer ônus para a parte inocente, nas seguintes hipóteses: (a) descumprimento material de qualquer obrigação contratual não sanado no prazo de 10 (dez) dias corridos após notificação formal; (b) violação comprovada de direitos de propriedade intelectual ou sigilo de dados; (c) decretação de falência, recuperação judicial ou liquidação societária de qualquer das partes; ou (d) utilização da Plataforma para práticas ilícitas, disseminação de malware ou fraudes comerciais.');
    para(`5.5. PORTABILIDADE E JANELA DE EXPURGO DE DADOS (LGPD Art. 16): Encerrada a vigência contratual por qualquer motivo, a CONTRATANTE terá o prazo improrrogável de ${cfg.dataWindow} para realizar o download e exportação integral de sua base de dados comerciais em formato interoperável (.CSV ou .JSON). Decorrido este prazo, os dados serão eliminados definitivamente e de forma segura dos servidores da LICENCIANTE, ressalvada a guarda obrigatória de logs por 6 meses nos termos do Art. 15 do Marco Civil da Internet.`);
    para('Fundamentação Legal: Código Civil, Arts. 473, 476, 599 e 603; LGPD (Lei nº 13.709/2018), Art. 16; Marco Civil da Internet, Art. 7º, X e Art. 15.', { small: true, color: COLOR.muted });

    // ─────────────────────────────────────────────────────────────────────────
    // CLÁUSULA 6ª — DA RENOVAÇÃO CONTRATUAL
    // ─────────────────────────────────────────────────────────────────────────
    sectionTitle('SEXTA', 'Da Vigência e Renovação Contratual');
    para(`6.1. ${cfg.renewal}`);

    // ─────────────────────────────────────────────────────────────────────────
    // CLÁUSULA 7ª — DO NÍVEL DE SERVIÇO (SLA 99,5%) E SERVICE CREDITS
    // ─────────────────────────────────────────────────────────────────────────
    sectionTitle('SÉTIMA', 'Do Nível de Serviço (SLA 99,5%), Manutenção e Service Credits');
    para(`7.1. SUPORTE TÉCNICO E ATENDIMENTO: ${cfg.sla}`);
    para('7.2. DISPONIBILIDADE TÉCNICA (UPTIME): A LICENCIANTE garante disponibilidade técnica mensal da Plataforma no patamar mínimo de 99,5% (noventa e nove vírgula cinco por cento) a cada mês civil.');
    para('7.3. TABELA DE SERVICE CREDITS (remédio financeiro compensatório):');
    bullet('Disponibilidade entre 99,0% e 99,49%: crédito de 5% (cinco por cento) de desconto na fatura do mês subsequente;');
    bullet('Disponibilidade entre 95,0% e 98,99%: crédito de 15% (quinze por cento) de desconto na fatura do mês subsequente;');
    bullet('Disponibilidade abaixo de 95,0%: crédito de 25% (vinte e cinco por cento) de desconto na fatura do mês subsequente.');
    para('7.4. REMÉDIO EXCLUSIVO: Nos termos do Art. 421-A, I e II, do Código Civil, a concessão de Service Credits constitui a ÚNICA E EXCLUSIVA compensação financeira devida pela LICENCIANTE em razão de indisponibilidade técnica, vedadas indenizações paralelas.');
    para('7.5. MANUTENÇÃO PROGRAMADA E EXCLUSÕES DO SLA: Não serão computadas para efeito de disponibilidade do SLA: (a) janelas de manutenção preventiva comunicadas com antecedência mínima de 24 horas, realizadas preferencialmente entre 22h00 e 06h00 (horário de Brasília); (b) intervenções emergenciais para aplicação de correções críticas de segurança; (c) falhas de hardware, rede ou conectividade da própria CONTRATANTE; (d) instabilidades globais ou bloqueios nas APIs do WhatsApp (Meta Inc.) ou fornecedores terceiros de LLM (OpenAI, Anthropic, Google); e (e) eventos de caso fortuito ou força maior (CC Art. 393).');
    para('Fundamentação Legal: Código Civil, Arts. 389, 393, 421-A, incisos I e II; Lei Complementar nº 116/2003.', { small: true, color: COLOR.muted });

    // ─────────────────────────────────────────────────────────────────────────
    // CLÁUSULA 8ª — DA LIMITAÇÃO DE RESPONSABILIDADE (LIABILITY CAP)
    // ─────────────────────────────────────────────────────────────────────────
    sectionTitle('OITAVA', 'Da Limitação de Responsabilidade — Liability Cap de 12 Meses');
    para('8.1. EXCLUSÃO DE DANOS INDIRETOS E LUCROS CESSANTES: Em consonância com a liberdade contratual e alocação bilateral de riscos (CC Art. 421-A), em nenhuma hipótese a LICENCIANTE responderá por lucros cessantes, perdas de oportunidade comercial, perda de receita, interrupção de negócios ou danos indiretos sofridos pela CONTRATANTE ou por terceiros (CC Arts. 402 e 403).');
    para(`8.2. TETO MÁXIMO DE INDENIZAÇÃO (LIABILITY CAP): A responsabilidade civil total acumulada da LICENCIANTE por quaisquer danos materiais comprovados decorrentes deste Contrato limita-se a ${cfg.liabilityCap}.`);
    para('8.3. EXCEÇÃO: As limitações desta cláusula não se aplicam exclusivamente às hipóteses de comprovado dolo ou culpa grave da LICENCIANTE, apurados mediante decisão judicial transitada em julgado.');
    para('Fundamentação Legal: Código Civil, Arts. 186, 393, 402, 403 e 421-A, II; STJ AgInt no AREsp 1.637.288/SP.', { small: true, color: COLOR.muted });

    // ─────────────────────────────────────────────────────────────────────────
    // CLÁUSULA 9ª — DA IA E REGRA HUMAN-IN-THE-LOOP (HITL)
    // ─────────────────────────────────────────────────────────────────────────
    sectionTitle('NONA', 'Do Uso de Inteligência Artificial e Regra Human-in-the-Loop');
    para('9.1. NATUREZA PROBABILÍSTICA DA IA: A CONTRATANTE declara-se ciente de que os recursos de IA nativos do software (Agentes Autônomos, Copilot, RAG, Transcrição de Áudio e Análise de Sentimento) operam por inferência estocástica e probabilística. A LICENCIANTE não garante infalibilidade ou exatidão de 100% dos textos gerados pelos modelos.');
    para('9.2. REGRA HUMAN-IN-THE-LOOP (HITL) COMPULSÓRIA: A CONTRATANTE obriga-se expressamente a manter REVISÃO E SUPERVISÃO HUMANA COMPULSÓRIA sobre todas as propostas comerciais, orçamentos, cotações e compromissos com terceiros gerados pela IA antes de sua transmissão ou formalização.');
    para('9.3. ISENÇÃO POR ALUCINAÇÕES DE LLM: A LICENCIANTE exime-se de qualquer responsabilidade por ofertas desproporcionais, preços incorretos ou declarações equivocadas geradas pela IA e enviadas a clientes sem a devida validação prévia por operador humano da CONTRATANTE.');
    para('9.4. FRANQUIA DE TOKENS E BYOK: Esgotada a franquia mensal de tokens, o processamento de IA será pausado até a renovação no ciclo seguinte ou aquisição de franquia adicional. No Plano Enterprise, faculta-se a modalidade BYOK (Bring Your Own Key) para conexão direta de chaves de API próprias.');
    para('Fundamentação Legal: Código Civil, Art. 422; Lei nº 9.609/1998; LGPD (Lei nº 13.709/2018), Art. 20; PL 2.338/2023.', { small: true, color: COLOR.muted });

    // ─────────────────────────────────────────────────────────────────────────
    // CLÁUSULA 10ª — DO WHATSAPP E SERVIÇOS DE TERCEIROS
    // ─────────────────────────────────────────────────────────────────────────
    sectionTitle('DÉCIMA', 'Da Integração com WhatsApp e Serviços de Terceiros');
    para('10.1. A CONTRATANTE obriga-se a utilizar o canal WhatsApp em estrita conformidade com as diretrizes e políticas comerciais da Meta Inc., respondendo de forma exclusiva por bloqueios ou banimentos de chips resultantes de práticas de spam ou disparo em massa não consentido.');
    para('10.2. ISENÇÃO POR CONTEÚDO DE TERCEIROS (Marco Civil da Internet, Art. 19 — Lei nº 12.965/2014): A LICENCIANTE atua como Provedor de Aplicações de Internet e não responde civilmente pelas mensagens, arquivos e áudios trafegados pela CONTRATANTE em suas conversas com clientes finais.');

    // ─────────────────────────────────────────────────────────────────────────
    // CLÁUSULA 11ª — DA PROTEÇÃO DE DADOS PESSOAIS (LGPD) E DPA
    // ─────────────────────────────────────────────────────────────────────────
    sectionTitle('DÉCIMA PRIMEIRA', 'Da Proteção de Dados Pessoais (LGPD) e do Acordo DPA');
    para('11.1. DUALIDADE DE PAPÉIS (LGPD): Em relação aos dados pessoais de leads e contatos gerenciados no tenant, a CONTRATANTE atua como CONTROLADORA exclusiva e a LICENCIANTE atua estritamente como OPERADORA. Em relação aos dados cadastrais e de faturamento da CONTRATANTE, a LICENCIANTE atua como CONTROLADORA (LGPD Art. 7º, II e V).');
    para('11.2. VEDAÇÃO A DADOS SENSÍVEIS SEM BASE LEGAL: É expressamente vedada a inserção de dados pessoais sensíveis (LGPD Art. 11) em campos customizados sem a respectiva base legal, respondendo a CONTRATANTE de forma regressiva por eventuais sanções (CC Art. 934).');
    para('11.3. SEGURANÇA DA INFORMAÇÃO: Os dados são processados com criptografia TLS 1.3 em trânsito e AES-256-GCM em repouso, em infraestrutura em nuvem segura com Cláusulas-Padrão Contratuais conforme a Resolução CD/ANPD nº 19/2024.');
    para('11.4. VEDAÇÃO AO TREINAMENTO DE LLMs PÚBLICAS: É TERMINANTEMENTE PROIBIDO À LICENCIANTE UTILIZAR, CEDER OU PROCESSAR DADOS PESSOAIS, ARQUIVOS OU CONVERSAS DA CONTRATANTE PARA TREINAMENTO DE MODELOS PÚBLICOS DE INTELIGÊNCIA ARTIFICIAL DE TERCEIROS.');
    para('11.5. NOTIFICAÇÃO DE INCIDENTES EM 48 HORAS: Confirmada a ocorrência de incidente de segurança relevante que possa acarretar risco aos titulares de dados, a LICENCIANTE notificará a CONTRATANTE em até 48 (quarenta e oito) horas úteis (LGPD Art. 48 c/c Resolução ANPD nº 15/2024).');
    para('Fundamentação Legal: LGPD (Lei nº 13.709/2018), Arts. 5º, 7º, 11, 37, 39, 46 e 48; Resolução ANPD nº 15/2024.', { small: true, color: COLOR.muted });

    // ─────────────────────────────────────────────────────────────────────────
    // CLÁUSULA 12ª — DA PROPRIEDADE INTELECTUAL E TITULARIDADE DOS DADOS
    // ─────────────────────────────────────────────────────────────────────────
    sectionTitle('DÉCIMA SEGUNDA', 'Da Propriedade Intelectual, Titularidade dos Dados e Sigilo');
    para('12.1. PROPRIEDADE DA PLATAFORMA: Todo o código-fonte, arquitetura, marcas, logotipos, algoritmos, metodologias e interfaces do Aegis CRM pertencem com exclusividade à LICENCIANTE (Leis nº 9.279/1996 e 9.609/1998). É vedada qualquer engenharia reversa, descompilação, cópia, scraping automatizado ou uso para criação de produtos concorrentes.');
    para('12.2. TITULARIDADE DOS DADOS DO CLIENTE E OUTPUTS DE IA: A CONTRATANTE é e permanecerá como única e exclusiva proprietária de todos os dados cadastrais, informações comerciais, arquivos e históricos inseridos em seu tenant, bem como de todos os relatórios, análises de sentimento e transcrições geradas pelas ferramentas de IA dentro do seu ambiente privado.');
    para('12.3. CONFIDENCIALIDADE MÚTUA: As partes obrigam-se a manter sigilo absoluto sobre todas as informações estratégicas, financeiras e técnicas trocadas durante a vigência deste Contrato, pelo prazo de 5 (cinco) anos após o seu encerramento.');
    para('Fundamentação Legal: Lei nº 9.609/1998, Arts. 1º, 2º e 6º; Lei nº 9.279/1996; Código Civil, Arts. 421 e 422.', { small: true, color: COLOR.muted });

    // ─────────────────────────────────────────────────────────────────────────
    // CLÁUSULA 13ª — DA INADIMPLÊNCIA, ANTI-CHARGEBACK E TÍTULO EXECUTIVO
    // ─────────────────────────────────────────────────────────────────────────
    sectionTitle('DÉCIMA TERCEIRA', 'Da Inadimplência, Anti-Chargeback e Título Executivo Extrajudicial');
    para('13.1. SUSPENSÃO DO TENANT (CC Art. 476): O atraso no pagamento por prazo superior a 5 (cinco) dias úteis autoriza a suspensão temporária do acesso à Plataforma, sem prejuízo da cobrança dos valores em aberto com acréscimos moratórios.');
    para('13.2. VEDAÇÃO AO CHARGEBACK INDEVIDO: É expressamente vedado à CONTRATANTE solicitar contestação de débito legítimo (chargeback) junto a operadoras de cartão de crédito sem prévia tentativa de solução amigável. A abertura de contestação indevida autoriza a suspensão imediata do serviço, inclusão do débito nos órgãos de proteção ao crédito (Serasa/SPC) e cobrança de perdas e danos.');
    para('13.3. FORÇA DE TÍTULO EXECUTIVO EXTRAJUDICIAL (CPC Art. 784, III): O presente Contrato, celebrado eletronicamente com aceite registrado em trilha de auditoria (audit trail) nos termos da Lei nº 14.063/2020, acompanhado das faturas inadimplidas, constitui TÍTULO EXECUTIVO EXTRAJUDICIAL líquido, certo e exigível nos termos do Art. 784, III e § 4º do CPC c/c Lei nº 14.620/2023, apto a instruir execução direta de quantia certa.');
    para('Fundamentação Legal: Código Civil, Art. 476; CPC (Lei nº 13.105/2015), Art. 784, III e § 4º c/c Lei nº 14.620/2023; Lei nº 14.063/2020.', { small: true, color: COLOR.muted });

    // ─────────────────────────────────────────────────────────────────────────
    // CLÁUSULA 14ª — DO FORO E SOLUÇÃO DE CONFLITOS
    // ─────────────────────────────────────────────────────────────────────────
    sectionTitle('DÉCIMA QUARTA', 'Do Foro de Eleição e Solução de Conflitos');
    para('14.1. FORO DE ELEIÇÃO EXCLUSIVO: As partes elegem o FORO DA COMARCA DA CAPITAL DO ESTADO DE SÃO PAULO/SP como o único competente para dirimir quaisquer dúvidas ou litígios decorrentes deste Contrato, com expressa renúncia a qualquer outro por mais privilegiado que seja (CPC Art. 63; STF Súmula 335).');
    para('14.2. MEDIAÇÃO PRÉVIA: Antes de iniciar procedimento contencioso judicial, as partes comprometem-se a buscar conciliação direta no prazo de 15 (quinze) dias úteis contados da notificação extrajudicial.');
    if (cfg.plan === 'Enterprise') {
      para('14.3. CLÁUSULA ARBITRAL (PLANO ENTERPRISE): No Plano Enterprise, mediante aditivo específico bilateral por escrito, as partes poderão optar pela submissão do litígio à arbitragem vinculante sob as regras de Câmara de Arbitragem reconhecida em São Paulo/SP (Lei nº 9.307/1996).');
    }
    para('Fundamentação Legal: CPC, Art. 63; STF Súmula 335; Lei nº 9.307/1996; STJ AgInt no AREsp 1.637.288/SP.', { small: true, color: COLOR.muted });

    // ─────────────────────────────────────────────────────────────────────────
    // CLÁUSULA 15ª — DAS DISPOSIÇÕES GERAIS
    // ─────────────────────────────────────────────────────────────────────────
    sectionTitle('DÉCIMA QUINTA', 'Das Disposições Gerais');
    para('15.1. VIGÊNCIA: O Contrato entra em vigor na data do aceite eletrônico e permanece válido durante todo o período do plano contratado, renovando-se sucessivamente salvo notificação contrária.');
    para('15.2. ALTERAÇÕES CONTRATUAIS: A LICENCIANTE poderá atualizar estes termos mediante aviso prévio de 30 (trinta) dias por e-mail ou notificação no painel. A ausência de oposição formal em 15 dias importará em aceite tácito das alterações.');
    para('15.3. CESSÃO: A CONTRATANTE não poderá ceder este Contrato sem autorização prévia por escrito da LICENCIANTE. A LICENCIANTE poderá ceder em caso de reorganização societária, fusão ou aquisição.');
    para('15.4. TOLERÂNCIA E NULIDADE PARCIAL: A tolerância quanto a descumprimentos não constituirá novação. A eventual nulidade de uma cláusula não invalidará as demais disposições (CC Arts. 360 e 421).');
    para('15.5. CANAIS OFICIAIS: Licenciante — develop.ags@gmail.com (Suporte · Vendas · DPO). Contratante — e-mail e dados fornecidos no cadastro.');
    para('Fundamentação Legal: Código Civil, Arts. 290, 360 e 421; CPC Art. 63.', { small: true, color: COLOR.muted });

    // ─────────────────────────────────────────────────────────────────────────
    // DECLARAÇÃO DE ACEITE ELETRÔNICO E ASSINATURAS
    // ─────────────────────────────────────────────────────────────────────────
    ensureSpace(85);
    doc.moveDown(0.8);
    hRule(doc.y, COLOR.brand, 0.8);
    doc.x = ML;
    doc.y += 8;

    doc.x = ML;
    doc.fontSize(8).font('Helvetica-Bold').fillColor(COLOR.brand)
      .text('DECLARAÇÃO DE ACEITE ELETRÔNICO', ML, doc.y, { width: W, align: 'center' });
    doc.x = ML;
    doc.moveDown(0.35);
    doc.fontSize(7.8).font('Helvetica').fillColor(COLOR.body)
      .text(
        'A CONTRATANTE declara expressamente que leu, compreendeu e concorda integralmente com todas as cláusulas e condições deste Contrato no ato de confirmação do cadastro eletrônico ou processamento do primeiro pagamento. O aceite eletrônico registrado na Plataforma com trilha de auditoria imutável constitui assinatura digital válida e vinculante nos termos da Lei nº 14.063/2020 e do Art. 784, III do CPC.',
        ML, doc.y, { width: W, align: 'justify', lineGap: 2.3 }
      );
    doc.x = ML;
    doc.moveDown(1.8);

    // Linhas de assinatura
    ensureSpace(55);
    const sigY = doc.y;
    const half = W / 2 - 10;

    hRule(sigY, COLOR.ink, 0.5);
    doc.lineWidth(0.5).strokeColor(COLOR.ink)
      .moveTo(ML + half + 20, sigY).lineTo(ML + W, sigY).stroke();

    doc.x = ML;
    doc.fontSize(8).font('Helvetica-Bold').fillColor(COLOR.ink)
      .text('LICENCIANTE', ML, sigY + 5, { width: half, align: 'center' });
    doc.x = ML;
    doc.fontSize(7.5).font('Helvetica').fillColor(COLOR.muted)
      .text('AEGIS CRM TECNOLOGIA  ·  CNPJ 67.155.126/0001-06', ML, sigY + 15, { width: half, align: 'center' });

    doc.fontSize(8).font('Helvetica-Bold').fillColor(COLOR.ink)
      .text('CONTRATANTE', ML + half + 20, sigY + 5, { width: half, align: 'center' });
    doc.fontSize(7.5).font('Helvetica').fillColor(COLOR.muted)
      .text('Razão Social / CNPJ — conforme cadastro na Plataforma', ML + half + 20, sigY + 15, { width: half, align: 'center' });

    doc.x = ML;
    doc.y = sigY + 38;

    const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    hRule(doc.y, COLOR.line, 0.4);
    doc.x = ML;
    doc.y += 4;
    doc.fontSize(7).font('Helvetica').fillColor(COLOR.footer)
      .text(`Contrato B2B emitido eletronicamente em ${today}  ·  Aegis CRM Tecnologia  ·  CNPJ 67.155.126/0001-06  ·  develop.ags@gmail.com`, ML, doc.y, { width: W, align: 'center' });

    // ─── Stampar rodapés em todas as páginas ──────────────────────────────────
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(i);
      const bot = PH - 24;
      doc.fontSize(7).font('Helvetica').fillColor(COLOR.footer)
        .text(
          `Aegis CRM Tecnologia · CNPJ 67.155.126/0001-06 · Plano ${cfg.plan} (${cfg.mode}) · Página ${i + 1} de ${range.count} · develop.ags@gmail.com`,
          ML, bot, { width: W, align: 'center' }
        );
    }

    doc.end();
    stream.on('finish', () => {
      // Sincronizar cópia com o diretório legado
      try { fs.copyFileSync(filePath, path.join(OUT_DIR_LEGACY, cfg.file)); } catch(e) {}
      console.log(`\u2705  Gerado: ${cfg.file} (${range.count} páginas)`);
      resolve(filePath);
    });
    stream.on('error', reject);
  });
}

// ─── Runner ───────────────────────────────────────────────────────────────────
(async () => {
  console.log('\n\uD83D\uDE80  Gerando 6 contratos jurídicos PDF B2B — Aegis CRM\n');
  for (const cfg of CONTRACTS) await buildPDF(cfg);
  console.log('\n\uD83C\uDFDB\uFE0F  Todos os 6 contratos gerados e sincronizados em src/assets/contratos/ e assets/contratos/\n');
})();
