/**
 * Aegis CRM — Gerador de Contratos PDF Jurídicos
 * CNPJ: 67.155.126/0001-06 | AEGIS TECNOLOGIA
 *
 * Utiliza o conteúdo redigido pela equipe jurídica (docs/legal/contrato_b2b.md
 * e docs/legal/contrato_cdc.md) para gerar 6 PDFs completos e tecnicamente
 * fundamentados — um para cada combinação de plano × modalidade.
 */

'use strict';

const fs   = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// ─────────────────────────────────────────────────────────────────────────────
// Diretório de saída
// ─────────────────────────────────────────────────────────────────────────────
const OUT_DIR = path.join(__dirname, 'assets', 'contratos');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

// ─────────────────────────────────────────────────────────────────────────────
// Paleta de cores
// ─────────────────────────────────────────────────────────────────────────────
const COLOR = {
  ink:      '#0f172a',
  brand:    '#1e3a8a',
  accent:   '#3b82f6',
  muted:    '#64748b',
  subtle:   '#e2e8f0',
  footer:   '#94a3b8',
  body:     '#1e293b',
  highlight:'#dbeafe',
};

// ─────────────────────────────────────────────────────────────────────────────
// Configurações dos 6 contratos
// ─────────────────────────────────────────────────────────────────────────────
const CONTRACTS = [
  // ── Essencial ─────────────────────────────────────────────────────────────
  {
    file:         'contrato-essencial-mensal.pdf',
    plan:         'Essencial',
    mode:         'Mensal',
    regime:       'B2B',
    priceMonthly: 'R$ 497,00 (quatrocentos e noventa e sete reais)',
    priceAnnual:  null,
    priceDisplay: 'R$ 497,00/mês — faturado mensalmente',
    billingDesc:  'mensalmente, a cada 30 (trinta) dias corridos, mediante débito recorrente no cartão de crédito cadastrado ou liquidação de fatura PIX gerada no primeiro dia de cada ciclo',
    discountNote: null,
    sla:          'Suporte técnico via e-mail e chat in-app — primeira resposta em até 48 h úteis.',
    dataWindow:   '30 (trinta) dias',
    liabilityCap: 'o montante total correspondente a 12 (doze) mensalidades do Plano Essencial vigentes à época do evento danoso',
    features: [
      'Até 3 (três) usuários simultâneos com controle de acesso por papel;',
      '2 (dois) funis de vendas configuráveis com até 8 etapas por funil;',
      'Visualização híbrida: Quadro Kanban interativo e Tabela de dados;',
      '2 (duas) conexões WhatsApp simultâneas integradas via cluster WAHA;',
      'Transcrição automática de áudios do WhatsApp por IA (Whisper);',
      '1 (um) agente autônomo de Inteligência Artificial;',
      'Franquia mensal de 1.000.000 (um milhão) de tokens de IA generativa;',
      'Copiloto de vendas em tempo real com sugestões de resposta contextuais;',
      'Base de conhecimento RAG para documentos institucionais e FAQs;',
      '8 templates de agentes comerciais especializados pré-configurados;',
      'Até 5 (cinco) fluxos de trabalho (workflows) e automações ativas;',
      'Geração de propostas comerciais em PDF com envio pelo WhatsApp;',
      'Formulário público de captura de leads e widget incorporável para sites;',
      'Criptografia AES-256-GCM e isolamento multi-tenant via PostgreSQL RLS.',
    ],
    renewal:      'Vigência mensal — renovação automática a cada 30 dias. Cancelamento a qualquer momento pelo painel, sem multa. Reajuste anual pelo IPCA/IBGE.',
    cancellation: 'Sem fidelidade: sem multa rescisória. O acesso permanece ativo até o fim do ciclo já pago; não há reembolso proporcional de mensalidade em curso.',
    penalty:      'Inexiste multa rescisória na modalidade mensal.',
    trialNote:    '7 (sete) dias corridos de degustação gratuita. Cancelamento durante o trial: sem qualquer cobrança.',
  },
  {
    file:         'contrato-essencial-anual.pdf',
    plan:         'Essencial',
    mode:         'Anual',
    regime:       'B2B',
    priceMonthly: 'R$ 497,00',
    priceAnnual:  'R$ 4.970,00 (quatro mil, novecentos e setenta reais)',
    priceDisplay: 'R$ 4.970,00/ano (equivalente a R$ 414,16/mês — 16% de desconto)',
    billingDesc:  'anualmente, em parcela única ou parcelado em até 12 (doze) vezes no cartão de crédito',
    discountNote: 'Desconto de 16% (dezesseis por cento) concedido em razão do compromisso de fidelidade de 12 meses.',
    sla:          'Suporte técnico via e-mail e chat in-app — primeira resposta em até 48 h úteis.',
    dataWindow:   '30 (trinta) dias',
    liabilityCap: 'o montante total da anuidade contratada do Plano Essencial',
    features: [
      'Até 3 (três) usuários simultâneos com controle de acesso por papel;',
      '2 (dois) funis de vendas configuráveis com até 8 etapas por funil;',
      'Visualização híbrida: Quadro Kanban interativo e Tabela de dados;',
      '2 (duas) conexões WhatsApp simultâneas integradas via cluster WAHA;',
      'Transcrição automática de áudios do WhatsApp por IA (Whisper);',
      '1 (um) agente autônomo de Inteligência Artificial;',
      'Franquia mensal de 1.000.000 (um milhão) de tokens de IA generativa;',
      'Copiloto de vendas em tempo real com sugestões de resposta contextuais;',
      'Base de conhecimento RAG para documentos institucionais e FAQs;',
      '8 templates de agentes comerciais especializados pré-configurados;',
      'Até 5 (cinco) fluxos de trabalho (workflows) e automações ativas;',
      'Geração de propostas comerciais em PDF com envio pelo WhatsApp;',
      'Formulário público de captura de leads e widget incorporável para sites;',
      'Criptografia AES-256-GCM e isolamento multi-tenant via PostgreSQL RLS.',
    ],
    renewal:      'Vigência de 12 (doze) meses. Renovação automática por iguais períodos anuais, salvo aviso formal com 30 dias de antecedência. Notificação prévia enviada pela Licenciante com 30 dias de antecedência via e-mail e WhatsApp. Reajuste anual pelo IPCA/IBGE.',
    cancellation: 'Rescisão antecipada (antes dos 12 meses): notificação prévia de 30 dias obrigatória. Incide multa compensatória de 30% sobre o saldo vincendo remanescente, em razão do benefício tarifário do desconto anual concedido (CC Art. 603 e jurisprudência TJSP).',
    penalty:      'Multa compensatória de 30% (trinta por cento) sobre as parcelas vincendas até o término dos 12 meses, sem prejuízo dos valores já pagos.',
    trialNote:    '7 (sete) dias corridos de degustação gratuita. Cancelamento durante o trial: sem qualquer cobrança.',
  },

  // ── Crescimento ────────────────────────────────────────────────────────────
  {
    file:         'contrato-crescimento-mensal.pdf',
    plan:         'Crescimento',
    mode:         'Mensal',
    regime:       'B2B',
    priceMonthly: 'R$ 997,00 (novecentos e noventa e sete reais)',
    priceAnnual:  null,
    priceDisplay: 'R$ 997,00/mês — faturado mensalmente',
    billingDesc:  'mensalmente, a cada 30 (trinta) dias corridos, mediante faturamento e cobrança recorrente no meio de pagamento ativo',
    discountNote: null,
    sla:          'Suporte técnico prioritário via WhatsApp e central de ajuda — resposta em até 12 h úteis e 1 sessão de onboarding assistido.',
    dataWindow:   '30 (trinta) dias',
    liabilityCap: 'o montante total correspondente a 12 (doze) mensalidades do Plano Crescimento vigentes à época do evento danoso',
    features: [
      'Até 10 (dez) usuários simultâneos com papéis de acesso por setor;',
      '10 (dez) funis de vendas configuráveis com até 15 etapas por funil;',
      '5 (cinco) conexões WhatsApp com multiatendimento, filas e roteamento por setor;',
      'Proteção anti-banimento (Warmup de chips) e debouncing inteligente de 60 s;',
      '3 (três) agentes autônomos de IA com personalização total de tom de voz;',
      'Franquia mensal de 1.000.000 (um milhão) de tokens de IA generativa;',
      'Análise de sentimento das conversas e classificação comportamental de leads;',
      'Geração automática de orçamentos em PDF com envio de chave PIX pela IA;',
      'Base de conhecimento RAG com upload de documentos e instruções avançadas;',
      'Até 30 (trinta) workflows ativos com gatilhos comportamentais e webhooks;',
      'Módulo Comercial Avançado: contratos, faturas recorrentes e ordens de compra;',
      'Gestão de Equipes: metas mensais, Round-Robin e visão por setores;',
      'BI em tempo real com Redis, drill-down analítico e exportação CSV/Excel/PDF;',
      'API REST de consulta (leitura) e até 10 webhooks de integração.',
    ],
    renewal:      'Vigência mensal — renovação automática a cada 30 dias. Cancelamento a qualquer momento pelo painel, sem multa. Reajuste anual pelo IPCA/IBGE.',
    cancellation: 'Sem fidelidade: sem multa rescisória. O serviço permanece ativo até o fim do ciclo de 30 dias já faturado, sem devolução proporcional.',
    penalty:      'Por se tratar de modalidade mensal sem fidelidade, não há multa por rescisão.',
    trialNote:    '7 (sete) dias corridos de degustação gratuita. Cancelamento durante o trial: sem qualquer cobrança.',
  },
  {
    file:         'contrato-crescimento-anual.pdf',
    plan:         'Crescimento',
    mode:         'Anual',
    regime:       'B2B',
    priceMonthly: 'R$ 997,00',
    priceAnnual:  'R$ 9.970,00 (nove mil, novecentos e setenta reais)',
    priceDisplay: 'R$ 9.970,00/ano (equivalente a R$ 830,83/mês — 16,65% de desconto)',
    billingDesc:  'anualmente, em parcela única ou parcelado em até 12 (doze) vezes no cartão de crédito',
    discountNote: 'Desconto de 16,65% (dezesseis vírgula sessenta e cinco por cento) concedido em razão do compromisso de fidelidade de 12 meses.',
    sla:          'Suporte técnico prioritário via WhatsApp e central de ajuda — resposta em até 12 h úteis e 1 sessão de onboarding assistido.',
    dataWindow:   '30 (trinta) dias',
    liabilityCap: 'o montante total da anuidade contratada do Plano Crescimento',
    features: [
      'Até 10 (dez) usuários simultâneos com papéis de acesso por setor;',
      '10 (dez) funis de vendas configuráveis com até 15 etapas por funil;',
      '5 (cinco) conexões WhatsApp com multiatendimento, filas e roteamento por setor;',
      'Proteção anti-banimento (Warmup de chips) e debouncing inteligente de 60 s;',
      '3 (três) agentes autônomos de IA com personalização total de tom de voz;',
      'Franquia mensal de 1.000.000 (um milhão) de tokens de IA generativa;',
      'Análise de sentimento das conversas e classificação comportamental de leads;',
      'Geração automática de orçamentos em PDF com envio de chave PIX pela IA;',
      'Base de conhecimento RAG com upload de documentos e instruções avançadas;',
      'Até 30 (trinta) workflows ativos com gatilhos comportamentais e webhooks;',
      'Módulo Comercial Avançado: contratos, faturas recorrentes e ordens de compra;',
      'Gestão de Equipes: metas mensais, Round-Robin e visão por setores;',
      'BI em tempo real com Redis, drill-down analítico e exportação CSV/Excel/PDF;',
      'API REST de consulta (leitura) e até 10 webhooks de integração.',
    ],
    renewal:      'Vigência de 12 (doze) meses. Renovação automática por iguais períodos anuais, salvo aviso formal com 30 dias de antecedência. Notificação prévia enviada pela Licenciante com 30 dias de antecedência via e-mail e WhatsApp. Reajuste anual pelo IPCA/IBGE.',
    cancellation: 'Rescisão antecipada (antes dos 12 meses): notificação prévia de 30 dias obrigatória. Incide multa compensatória de 30% sobre o saldo vincendo remanescente, em razão do benefício tarifário do desconto anual concedido (CC Art. 603).',
    penalty:      'Multa compensatória de 30% (trinta por cento) sobre as parcelas vincendas até o término dos 12 meses, sem prejuízo dos valores já pagos.',
    trialNote:    '7 (sete) dias corridos de degustação gratuita. Cancelamento durante o trial: sem qualquer cobrança.',
  },

  // ── Enterprise ─────────────────────────────────────────────────────────────
  {
    file:         'contrato-enterprise-mensal.pdf',
    plan:         'Enterprise',
    mode:         'Mensal',
    regime:       'B2B',
    priceMonthly: 'R$ 2.997,00 (dois mil, novecentos e noventa e sete reais)',
    priceAnnual:  null,
    priceDisplay: 'R$ 2.997,00/mês — faturado mensalmente',
    billingDesc:  'mensalmente, a cada 30 (trinta) dias corridos, mediante faturamento e cobrança recorrente no meio de pagamento ativo',
    discountNote: null,
    sla:          'SLA contratual garantido: resposta em até 4 h úteis. Suporte VIP 24/7 (WhatsApp e telefone). Gerente de Conta Dedicado. Onboarding corporativo assistido (3 sessões técnicas).',
    dataWindow:   '60 (sessenta) dias',
    liabilityCap: 'o montante total correspondente a 12 (doze) mensalidades do Plano Enterprise vigentes à época do evento danoso',
    features: [
      'Usuários, operadores e administradores ilimitados;',
      'Funis de vendas ilimitados com até 25 etapas por funil;',
      '20 (vinte) conexões WhatsApp simultâneas em Cluster WAHA multi-nó com balanceamento de carga;',
      'Sistema de Warmup avançado anti-banimento para alto volume;',
      'Agentes autônomos de IA ilimitados e mais de 5.000.000 tokens/mês;',
      'BYOK (Bring Your Own Key): integração com OpenAI, Anthropic Claude e Google Gemini;',
      'Few-Shot Learning ativo — treinamento contínuo com histórico real de conversas;',
      'Orquestrador cognitivo de 6 camadas com governança, limiares e transbordo customizáveis;',
      'Workflows ilimitados com 17 ações nativas, webhooks externos e nós de ferramentas;',
      'API REST completa (leitura e escrita) e Webhooks de entrada/saída ilimitados;',
      'White-Label integral: marca, domínio próprio, logotipo, favicon, e-mails SMTP e cores;',
      'Autenticação corporativa SSO (Single Sign-On) com perfis de permissão granulares;',
      'Relatório de ROI de IA, logs de auditoria imutáveis e conformidade LGPD completa;',
      'Cláusula arbitral e DPA (Data Processing Agreement) customizado disponíveis.',
    ],
    renewal:      'Vigência mensal — renovação automática a cada 30 dias. Cancelamento mediante aviso prévio formal de 30 dias, sem multa. Dados corporativos mantidos em ambiente seguro de carência por 60 dias para exportação completa em lote (JSON/CSV) antes da eliminação definitiva.',
    cancellation: 'Sem fidelidade: sem multa rescisória. Aviso prévio de 30 dias obrigatório. Janela de exportação de dados de 60 dias garantida.',
    penalty:      'Inexiste multa rescisória no plano mensal Enterprise.',
    trialNote:    '7 (sete) dias corridos de degustação gratuita. Cancelamento durante o trial: sem qualquer cobrança.',
  },
  {
    file:         'contrato-enterprise-anual.pdf',
    plan:         'Enterprise',
    mode:         'Anual',
    regime:       'B2B',
    priceMonthly: 'R$ 2.997,00',
    priceAnnual:  'R$ 29.970,00 (vinte e nove mil, novecentos e setenta reais)',
    priceDisplay: 'R$ 29.970,00/ano (equivalente a R$ 2.497,50/mês — 16,66% de desconto)',
    billingDesc:  'anualmente, em parcela única ou parcelado em até 12 (doze) vezes no cartão de crédito',
    discountNote: 'Desconto de 16,66% (dezesseis vírgula sessenta e seis por cento) concedido em razão do compromisso de fidelidade de 12 meses.',
    sla:          'SLA contratual garantido: resposta em até 4 h úteis. Suporte VIP 24/7 (WhatsApp e telefone). Gerente de Conta Dedicado. Onboarding corporativo assistido (3 sessões técnicas).',
    dataWindow:   '60 (sessenta) dias',
    liabilityCap: 'o montante total da anuidade contratada do Plano Enterprise',
    features: [
      'Usuários, operadores e administradores ilimitados;',
      'Funis de vendas ilimitados com até 25 etapas por funil;',
      '20 (vinte) conexões WhatsApp simultâneas em Cluster WAHA multi-nó com balanceamento de carga;',
      'Sistema de Warmup avançado anti-banimento para alto volume;',
      'Agentes autônomos de IA ilimitados e mais de 5.000.000 tokens/mês;',
      'BYOK (Bring Your Own Key): integração com OpenAI, Anthropic Claude e Google Gemini;',
      'Few-Shot Learning ativo — treinamento contínuo com histórico real de conversas;',
      'Orquestrador cognitivo de 6 camadas com governança, limiares e transbordo customizáveis;',
      'Workflows ilimitados com 17 ações nativas, webhooks externos e nós de ferramentas;',
      'API REST completa (leitura e escrita) e Webhooks de entrada/saída ilimitados;',
      'White-Label integral: marca, domínio próprio, logotipo, favicon, e-mails SMTP e cores;',
      'Autenticação corporativa SSO (Single Sign-On) com perfis de permissão granulares;',
      'Relatório de ROI de IA, logs de auditoria imutáveis e conformidade LGPD completa;',
      'Cláusula arbitral e DPA (Data Processing Agreement) customizado disponíveis.',
    ],
    renewal:      'Vigência de 12 (doze) meses. Renovação automática por iguais períodos anuais, salvo aviso formal com 30 dias de antecedência. Notificação prévia enviada pela Licenciante com 30 dias de antecedência via e-mail e WhatsApp. Reajuste anual pelo IPCA/IBGE.',
    cancellation: 'Rescisão antecipada (antes dos 12 meses): notificação prévia de 30 dias obrigatória. Incide multa compensatória de 30% sobre o saldo vincendo remanescente (CC Art. 603). Garantia de janela de 60 dias para exportação integral dos dados do CRM (JSON e CSV).',
    penalty:      'Multa compensatória de 30% (trinta por cento) sobre o saldo de parcelas vincendas até o encerramento dos 12 meses, sem prejuízo dos valores já pagos.',
    trialNote:    '7 (sete) dias corridos de degustação gratuita. Cancelamento durante o trial: sem qualquer cobrança.',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Renderizador de PDF
// ─────────────────────────────────────────────────────────────────────────────
function buildPDF(cfg) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(OUT_DIR, cfg.file);
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 60, bottom: 60, left: 55, right: 55 },
      autoFirstPage: true,
      info: {
        Title:    `Aegis CRM — Contrato ${cfg.plan} ${cfg.mode}`,
        Author:   'Aegis CRM Tecnologia — CNPJ 67.155.126/0001-06',
        Subject:  `Licença SaaS B2B — Plano ${cfg.plan} (${cfg.mode})`,
        Creator:  'Aegis CRM PDF Generator',
        Producer: 'PDFKit',
      },
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    let page = 1;
    const W = doc.page.width - 55 - 55; // usable width

    // ── Helpers ──────────────────────────────────────────────────────────────

    function footer() {
      const bot = doc.page.height - 28;
      const mb  = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;
      doc.fontSize(7).font('Helvetica').fillColor(COLOR.footer)
        .text(
          `Aegis CRM Tecnologia  ·  CNPJ 67.155.126/0001-06  ·  Plano ${cfg.plan} — ${cfg.mode}  ·  Página ${page}  ·  develop.ags@gmail.com`,
          55, bot, { width: W, align: 'center', lineBreak: false }
        );
      doc.page.margins.bottom = mb;
    }

    function hRule(y, color = COLOR.subtle, w = 0.5) {
      doc.lineWidth(w).strokeColor(color).moveTo(55, y).lineTo(55 + W, y).stroke();
    }

    function ensureSpace(needed) {
      if (doc.y + needed > doc.page.height - doc.page.margins.bottom - 10) {
        doc.addPage();
      }
    }

    function sectionTitle(num, title) {
      ensureSpace(40);
      doc.moveDown(0.8);
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor(COLOR.brand)
        .text(`CLÁUSULA ${num} — ${title.toUpperCase()}`);
      const ry = doc.y + 3;
      hRule(ry, COLOR.accent, 0.6);
      doc.y = ry + 7;
    }

    function para(text, opts = {}) {
      const defaults = { align: 'justify', lineGap: 2.8, paragraphGap: 0 };
      doc.fontSize(8.5).font(opts.bold ? 'Helvetica-Bold' : 'Helvetica')
        .fillColor(COLOR.body)
        .text(text, { ...defaults, ...opts });
      doc.moveDown(0.45);
    }

    function bullet(text) {
      const bx = 68;
      const bw = W - 13;
      doc.fontSize(8.5).font('Helvetica').fillColor(COLOR.body)
        .text('•', 55, doc.y, { width: 13, lineBreak: false })
        .text(text, bx, doc.y - doc.currentLineHeight(), { width: bw, align: 'justify', lineGap: 2.5 });
      doc.moveDown(0.3);
    }

    function infoBox(label, value) {
      ensureSpace(24);
      const by = doc.y;
      doc.rect(55, by, W, 18).fillColor(COLOR.highlight).fill();
      doc.fontSize(7.5).font('Helvetica-Bold').fillColor(COLOR.brand)
        .text(label.toUpperCase(), 62, by + 4, { width: 120, lineBreak: false });
      doc.fontSize(7.5).font('Helvetica').fillColor(COLOR.ink)
        .text(value, 180, by + 4, { width: W - 130, lineBreak: false });
      doc.y = by + 22;
    }

    // Page-added hook
    doc.on('pageAdded', () => { page++; footer(); });

    // ─────────────────────────────────────────────────────────────────────────
    // CABEÇALHO — Página 1
    // ─────────────────────────────────────────────────────────────────────────
    hRule(60, COLOR.brand, 1.5);
    doc.y = 68;

    doc.fontSize(14).font('Helvetica-Bold').fillColor(COLOR.ink)
      .text('AEGIS CRM TECNOLOGIA', { align: 'center' });
    doc.fontSize(8).font('Helvetica').fillColor(COLOR.muted)
      .text('CNPJ 67.155.126/0001-06  ·  develop.ags@gmail.com', { align: 'center' });
    doc.moveDown(0.4);
    doc.fontSize(9).font('Helvetica-Bold').fillColor(COLOR.brand)
      .text('CONTRATO DE PRESTAÇÃO DE SERVIÇOS E LICENCIAMENTO SAAS', { align: 'center' });
    doc.fontSize(10).font('Helvetica-Bold').fillColor(COLOR.ink)
      .text(`PLANO ${cfg.plan.toUpperCase()} — MODALIDADE ${cfg.mode.toUpperCase()}`, { align: 'center' });
    doc.moveDown(0.6);
    hRule(doc.y, COLOR.brand, 1.5);
    doc.y += 12;

    footer(); // footer on page 1

    // Caixas de identificação
    infoBox('Regime Jurídico', 'Empresarial B2B — Código Civil Art. 421-A (Lei da Liberdade Econômica — Lei nº 13.874/2019)');
    infoBox('Licenciante',     'AEGIS CRM TECNOLOGIA  ·  CNPJ 67.155.126/0001-06  ·  Endereço a definir');
    infoBox('E-mail / DPO',    'develop.ags@gmail.com  (Suporte · Vendas · Encarregado LGPD)');
    infoBox('Plano',           `${cfg.plan}  —  Modalidade ${cfg.mode}`);
    infoBox('Valor',           cfg.priceDisplay);
    infoBox('Faturamento',     cfg.billingDesc);
    infoBox('Trial Gratuito',  '7 (sete) dias corridos — cancelamento sem ônus');
    doc.moveDown(0.6);

    // ─────────────────────────────────────────────────────────────────────────
    // CLÁUSULA 1ª — PARTES E ENQUADRAMENTO JURÍDICO
    // ─────────────────────────────────────────────────────────────────────────
    sectionTitle('PRIMEIRA', 'Das Partes e do Enquadramento Jurídico');
    para('1.1. LICENCIANTE: AEGIS CRM TECNOLOGIA, pessoa jurídica de direito privado, inscrita no CNPJ/MF sob o nº 67.155.126/0001-06, com endereço a definir, e-mail develop.ags@gmail.com, doravante denominada "LICENCIANTE" ou "AEGIS CRM".');
    para('1.2. CONTRATANTE: Pessoa jurídica regularmente constituída, com CNPJ ativo, qualificada no formulário de cadastro e aceite eletrônico realizado na Plataforma, doravante denominada "CONTRATANTE" ou "LICENCIADA".');
    para('1.3. ENQUADRAMENTO B2B — INSUMO COMERCIAL (CC Art. 421-A): A CONTRATANTE declara expressamente que é pessoa jurídica legalmente constituída e que a contratação do software Aegis CRM destina-se estrita e exclusivamente como INSUMO DE PRODUÇÃO, FERRAMENTA DE GESTÃO COMERCIAL E INSTRUMENTO DE ALAVANCAGEM DE SUAS ATIVIDADES EMPRESARIAIS DE VENDAS, operando sob a égide da Lei da Liberdade Econômica (Lei nº 13.874/2019) e dos Artigos 421 e 421-A do Código Civil Brasileiro, com presunção de paridade e simetria, restando afastada a incidência do Código de Defesa do Consumidor (Lei nº 8.078/1990).');
    para('[Fund.: CC Arts. 421, 421-A; Lei nº 13.874/2019; STJ AgInt no AREsp 1.637.288/SP]', { italic: true, fillColor: COLOR.muted, fontSize: 7.5 });

    // ─────────────────────────────────────────────────────────────────────────
    // CLÁUSULA 2ª — OBJETO E LICENÇA SAAS
    // ─────────────────────────────────────────────────────────────────────────
    sectionTitle('SEGUNDA', 'Do Objeto e da Concessão da Licença SaaS');
    para(`2.1. Constitui objeto deste Contrato a prestação continuada de serviços de tecnologia da informação e a concessão, pela LICENCIANTE à CONTRATANTE, de licença de uso temporária, revogável, não exclusiva, intransferível e sem direito a sublicenciamento do software Aegis CRM na modalidade SaaS, nos estritos limites do PLANO ${cfg.plan.toUpperCase()} — MODALIDADE ${cfg.mode.toUpperCase()}.`);
    para('2.2. A licença outorgada restringe-se ao acesso e uso operacional da Plataforma via navegadores de internet e APIs oficiais, não compreendendo a cessão ou transferência de código-fonte, marcas, patentes, algoritmos ou quaisquer direitos de propriedade intelectual da LICENCIANTE. (Lei nº 9.609/1998, Arts. 1º, 2º e 9º; STF ADIs 5659 e 5658).');

    // ─────────────────────────────────────────────────────────────────────────
    // CLÁUSULA 3ª — ESPECIFICAÇÕES DO PLANO
    // ─────────────────────────────────────────────────────────────────────────
    sectionTitle('TERCEIRA', `Das Especificações e Recursos do Plano ${cfg.plan}`);
    para(`3.1. A licença ativa confere à CONTRATANTE os seguintes módulos e limites operacionais no PLANO ${cfg.plan.toUpperCase()} — ${cfg.mode.toUpperCase()}:`);
    cfg.features.forEach(f => bullet(f));
    doc.moveDown(0.3);

    if (cfg.discountNote) {
      para(`3.2. DESCONTO APLICADO: ${cfg.discountNote}`);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CLÁUSULA 4ª — PREÇO E PAGAMENTO
    // ─────────────────────────────────────────────────────────────────────────
    sectionTitle('QUARTA', 'Do Preço, Faturamento e Condições de Pagamento');
    const pricePhrase = cfg.priceAnnual
      ? `${cfg.priceAnnual} anuais`
      : `${cfg.priceMonthly} mensais`;
    para(`4.1. Como contraprestação pela licença de uso e disponibilização contínua da infraestrutura SaaS, a CONTRATANTE pagará à LICENCIANTE a quantia de ${pricePhrase}, faturada ${cfg.billingDesc}.`);
    para('4.2. O pagamento será processado via cartão de crédito corporativo cadastrado na Plataforma ou liquidação de fatura bancária/chave PIX emitida pela LICENCIANTE com vencimento no primeiro dia de cada ciclo.');
    para('4.3. INADIMPLEMENTO E MORA: O não pagamento no vencimento sujeitará a CONTRATANTE a: (a) multa moratória de 2% (dois por cento) sobre o montante em atraso; (b) juros de mora de 1% (um por cento) ao mês pro-rata die; e (c) correção monetária pelo IPCA/IBGE (CC Arts. 394 e 395).');
    para('4.4. SUSPENSÃO POR INADIMPLÊNCIA: Transcorridos 5 (cinco) dias úteis de inadimplemento, a LICENCIANTE poderá suspender temporariamente o acesso do tenant à Plataforma (CC Art. 476 — Exceção do Contrato Não Cumprido), sem prejuízo da cobrança integral dos valores em aberto.');
    para('4.5. REAJUSTE ANUAL: Os valores serão reajustados a cada 12 (doze) meses pela variação positiva acumulada do IPCA/IBGE, com notificação prévia de 30 dias.');

    // ─────────────────────────────────────────────────────────────────────────
    // CLÁUSULA 5ª — TRIAL GRATUITO E CANCELAMENTO
    // ─────────────────────────────────────────────────────────────────────────
    sectionTitle('QUINTA', 'Do Trial Gratuito, Cancelamento e Rescisão');
    para(`5.1. PERÍODO DE DEGUSTAÇÃO (TRIAL GRATUITO): ${cfg.trialNote}`);
    para(`5.2. POLÍTICA DE CANCELAMENTO E RESCISÃO: ${cfg.cancellation}`);
    para(`5.3. CLÁUSULA PENAL: ${cfg.penalty}`);
    para(`5.4. JANELA DE PORTABILIDADE E EXPURGO DE DADOS (LGPD Art. 16): Concluída a rescisão, a CONTRATANTE terá ${cfg.dataWindow} para realizar o download e exportação integral de seus dados em formato interoperável (CSV e JSON) via painel administrativo. Esgotado este prazo, a LICENCIANTE procederá à eliminação segura e definitiva de todos os registros.`);
    para('[Fund.: CC Arts. 473, 599, 603; LGPD (Lei nº 13.709/2018), Art. 16; Marco Civil da Internet, Art. 7º, X]', { italic: true, fillColor: COLOR.muted, fontSize: 7.5 });

    // ─────────────────────────────────────────────────────────────────────────
    // CLÁUSULA 6ª — RENOVAÇÃO
    // ─────────────────────────────────────────────────────────────────────────
    sectionTitle('SEXTA', 'Da Renovação Contratual');
    para(`6.1. ${cfg.renewal}`);

    // ─────────────────────────────────────────────────────────────────────────
    // CLÁUSULA 7ª — SLA E SERVICE CREDITS
    // ─────────────────────────────────────────────────────────────────────────
    sectionTitle('SÉTIMA', 'Do Nível de Serviço (SLA 99,5%) e Service Credits');
    para(`7.1. SUPORTE TÉCNICO: ${cfg.sla}`);
    para('7.2. DISPONIBILIDADE DA PLATAFORMA: A LICENCIANTE garante disponibilidade técnica mensal (Uptime) mínima de 99,5% (noventa e nove vírgula cinco por cento) a cada mês civil, excluídas as janelas de manutenção preventiva programada e comunicadas com antecedência de 24 horas, bem como indisponibilidades causadas por falhas de infraestrutura de terceiros (AWS, Meta, OpenAI, Anthropic).');
    para('7.3. TABELA DE SERVICE CREDITS (remédio exclusivo por SLA):');
    para('     • Disponibilidade entre 99,0% e 99,49%: crédito de 5% na fatura seguinte;');
    para('     • Disponibilidade entre 95,0% e 98,99%: crédito de 15% na fatura seguinte;');
    para('     • Disponibilidade abaixo de 95,0%: crédito de 25% na fatura seguinte.');
    para('7.4. EXCLUSÃO DE DANOS PARALELOS: A concessão de Service Credits constitui a ÚNICA E EXCLUSIVA compensação financeira pela LICENCIANTE em razão de indisponibilidade da Plataforma. (CC Art. 421-A, I e II).');
    para('[Fund.: CC Arts. 389, 393, 421-A; LC nº 116/2003]', { italic: true, fillColor: COLOR.muted, fontSize: 7.5 });

    // ─────────────────────────────────────────────────────────────────────────
    // CLÁUSULA 8ª — LIMITAÇÃO DE RESPONSABILIDADE (LIABILITY CAP)
    // ─────────────────────────────────────────────────────────────────────────
    sectionTitle('OITAVA', 'Da Limitação de Responsabilidade — Liability Cap');
    para(`8.1. TETO DE INDENIZAÇÃO (LIABILITY CAP DE 12 MESES): Em consonância com o Art. 421-A, II, do Código Civil, a responsabilidade civil total acumulada da LICENCIANTE por quaisquer danos materiais decorrentes deste Contrato ou do uso do software limita-se a ${cfg.liabilityCap}.`);
    para('8.2. EXCLUSÃO DE DANOS INDIRETOS: Sob nenhuma hipótese a LICENCIANTE responderá por lucros cessantes, perda de oportunidade comercial, danos reputacionais, perda de vendas ou quaisquer danos indiretos ou consequentes sofridos pela CONTRATANTE ou por terceiros (CC Arts. 402 e 403).');
    para('8.3. EXCEÇÃO: As limitações desta cláusula não se aplicam a hipóteses de comprovado dolo ou culpa grave da LICENCIANTE, apurados mediante decisão judicial transitada em julgado.');
    para('[Fund.: CC Arts. 186, 393, 402, 403 e 421-A, II; STJ AgInt no AREsp 1.637.288/SP]', { italic: true, fillColor: COLOR.muted, fontSize: 7.5 });

    // ─────────────────────────────────────────────────────────────────────────
    // CLÁUSULA 9ª — INTELIGÊNCIA ARTIFICIAL E HUMAN-IN-THE-LOOP
    // ─────────────────────────────────────────────────────────────────────────
    sectionTitle('NONA', 'Do Uso de Inteligência Artificial e Regra Human-in-the-Loop');
    para('9.1. NATUREZA PROBABILÍSTICA DA IA: A CONTRATANTE declara-se ciente de que os recursos de IA nativos do Aegis CRM (Agentes Autônomos, Copilot, RAG, Transcrição de Áudio e Análise de Sentimento) operam por inferência estocástica e probabilística. A LICENCIANTE não garante a infalibilidade dos textos e dados sintetizados pela IA.');
    para('9.2. REGRA HUMAN-IN-THE-LOOP (HITL) COMPULSÓRIA: A CONTRATANTE obriga-se a manter REVISÃO E SUPERVISÃO HUMANA COMPULSÓRIA sobre todas as propostas comerciais, cotações, orçamentos, termos contratuais e compromissos com terceiros emitidos ou sugeridos pelos Agentes de IA ou pelo Copilot antes de sua transmissão ou formalização definitiva.');
    para('9.3. ISENÇÃO POR ALUCINAÇÕES DE LLM: A LICENCIANTE exime-se de qualquer responsabilidade por ofertas desproporcionais, preços incorretos, descontos indevidos ou declarações equivocadas geradas por modelos de IA que sejam enviadas a terceiros sem a devida validação prévia por operador humano da CONTRATANTE.');
    para('9.4. FRANQUIA DE TOKENS: Esgotada a franquia mensal de tokens de IA do plano, o serviço de IA será pausado até a renovação no ciclo seguinte ou aquisição de pacote adicional. No Plano Enterprise, a modalidade BYOK permite o uso de chaves de API próprias da CONTRATANTE junto a fornecedores externos.');
    para('[Fund.: CC Art. 422; Lei nº 9.609/1998; LGPD Art. 20; PL 2.338/2023]', { italic: true, fillColor: COLOR.muted, fontSize: 7.5 });

    // ─────────────────────────────────────────────────────────────────────────
    // CLÁUSULA 10ª — WHATSAPP E TERCEIROS
    // ─────────────────────────────────────────────────────────────────────────
    sectionTitle('DÉCIMA', 'Da Integração com WhatsApp e Serviços de Terceiros');
    para('10.1. A CONTRATANTE obriga-se a utilizar o canal WhatsApp em conformidade com as diretrizes e políticas comerciais da Meta Inc., respondendo exclusivamente por eventuais bloqueios, suspensões ou banimentos de chips resultantes de práticas de spam ou envio em massa não consentido.');
    para('10.2. ISENÇÃO POR CONTEÚDO DE TERCEIROS (Marco Civil da Internet, Art. 19 — Lei nº 12.965/2014): A LICENCIANTE atua como Provedor de Aplicações de Internet e não responde civilmente pelo conteúdo, mensagens, áudios e arquivos trafegados pela CONTRATANTE em suas conversas com clientes finais.');

    // ─────────────────────────────────────────────────────────────────────────
    // CLÁUSULA 11ª — LGPD E DPA
    // ─────────────────────────────────────────────────────────────────────────
    sectionTitle('DÉCIMA PRIMEIRA', 'Da Proteção de Dados Pessoais (LGPD) e do DPA');
    para('11.1. QUALIFICAÇÃO DAS PARTES: Nos termos da Lei nº 13.709/2018 (LGPD): (a) a CONTRATANTE atua como CONTROLADORA dos dados pessoais de leads, clientes e contatos que armazena na Plataforma; (b) a LICENCIANTE atua como OPERADORA, tratando tais dados unicamente para fins de prestação do serviço contratado.');
    para('11.2. VEDAÇÃO A DADOS SENSÍVEIS SEM BASE LEGAL: É terminantemente vedada a inserção de dados pessoais sensíveis (LGPD Art. 11) em campos personalizados sem respaldo jurídico adequado, respondendo a CONTRATANTE por violações de forma regressiva (CC Art. 934).');
    para('11.3. SEGURANÇA E TRANSFERÊNCIA INTERNACIONAL: Os dados serão processados com criptografia em trânsito (TLS 1.3) e em repouso (AES-256-GCM), com infraestrutura em nuvem segura (AWS) conforme Cláusulas-Padrão Contratuais da Resolução CD/ANPD nº 19/2024.');
    para('11.4. VEDAÇÃO A TREINAMENTO DE LLMs PÚBLICAS: É expressamente proibido à LICENCIANTE utilizar, ceder ou processar dados pessoais, arquivos ou histórico de conversas da CONTRATANTE para treinamento de modelos de IA públicos de terceiros.');
    para('11.5. NOTIFICAÇÃO DE INCIDENTES EM 48 HORAS: Em caso de incidente de segurança com risco relevante aos titulares de dados, a LICENCIANTE notificará a CONTRATANTE em até 48 horas úteis (LGPD Art. 48 c/c Resolução ANPD nº 15/2024).');
    para('[Fund.: LGPD (Lei nº 13.709/2018), Arts. 5º, 7º, 37, 39, 46 e 48; Resolução ANPD nº 15/2024; Marco Civil, Art. 15]', { italic: true, fillColor: COLOR.muted, fontSize: 7.5 });

    // ─────────────────────────────────────────────────────────────────────────
    // CLÁUSULA 12ª — PROPRIEDADE INTELECTUAL
    // ─────────────────────────────────────────────────────────────────────────
    sectionTitle('DÉCIMA SEGUNDA', 'Da Propriedade Intelectual e Confidencialidade');
    para('12.1. PROPRIEDADE DA PLATAFORMA: Todos os direitos de propriedade industrial, código-fonte, arquitetura, design visual, marcas e metodologias do Aegis CRM pertencem com exclusividade à LICENCIANTE (Leis nº 9.279/1996 e 9.609/1998). É vedado à CONTRATANTE praticar engenharia reversa, descompilação, cópia não autorizada, scraping automatizado ou utilizar a Plataforma para desenvolver produtos concorrentes.');
    para('12.2. DADOS DO CLIENTE: A CONTRATANTE é e permanecerá como única e exclusiva proprietária de todos os dados cadastrais, informações de vendas, arquivos e históricos comerciais inseridos em seu tenant.');
    para('12.3. CONFIDENCIALIDADE MÚTUA: As partes comprometem-se a manter sigilo absoluto sobre todas as informações estratégicas, financeiras e operacionais trocadas em razão deste Contrato, pelo prazo de 5 (cinco) anos após o encerramento da relação contratual.');

    // ─────────────────────────────────────────────────────────────────────────
    // CLÁUSULA 13ª — INADIMPLÊNCIA E ANTI-CHARGEBACK
    // ─────────────────────────────────────────────────────────────────────────
    sectionTitle('DÉCIMA TERCEIRA', 'Da Inadimplência, Anti-Chargeback e Título Executivo');
    para('13.1. SUSPENSÃO POR INADIMPLEMENTO (CC Art. 476): O descumprimento da obrigação de pagamento por prazo superior a 5 (cinco) dias úteis autoriza a LICENCIANTE a suspender temporariamente o acesso ao tenant, sem prejuízo da cobrança dos valores em atraso acrescidos de encargos moratórios.');
    para('13.2. VEDAÇÃO AO CHARGEBACK INDEVIDO: É vedado à CONTRATANTE solicitar contestação de débito legítimo (chargeback) perante administradoras de cartão de crédito sem prévia tentativa de solução amigável. A abertura de chargeback indevido autoriza a suspensão imediata do serviço, a inclusão do débito nos órgãos de proteção ao crédito (Serasa/SPC) e a cobrança de perdas e danos.');
    para('13.3. TÍTULO EXECUTIVO EXTRAJUDICIAL (CPC Art. 784, III): Este Contrato, celebrado eletronicamente mediante aceite inequívoco e assinatura digital (Lei nº 14.063/2020), acompanhado do comprovante de audit trail e das faturas inadimplidas, constitui TÍTULO EXECUTIVO EXTRAJUDICIAL líquido, certo e exigível, apto a instruir execução direta de quantia certa.');
    para('[Fund.: CC Art. 476; CPC (Lei nº 13.105/2015), Art. 784, III c/c Lei nº 14.620/2023; Lei nº 14.063/2020]', { italic: true, fillColor: COLOR.muted, fontSize: 7.5 });

    // ─────────────────────────────────────────────────────────────────────────
    // CLÁUSULA 14ª — FORO E SOLUÇÃO DE CONFLITOS
    // ─────────────────────────────────────────────────────────────────────────
    sectionTitle('DÉCIMA QUARTA', 'Do Foro e da Solução de Conflitos');
    para('14.1. FORO DE ELEIÇÃO EXCLUSIVO: As partes elegem o FORO DA COMARCA DA CAPITAL DO ESTADO DE SÃO PAULO/SP como o único competente para dirimir quaisquer controvérsias ou litígios decorrentes deste Contrato, com expressa renúncia a qualquer outro foro (CPC Art. 63; STF Súmula 335).');
    para('14.2. MEDIAÇÃO PRÉVIA OBRIGATÓRIA: Antes de iniciar qualquer procedimento judicial, as partes comprometem-se a buscar a resolução amigável mediante notificação prévia e reunião de conciliação a ser realizada no prazo de 15 (quinze) dias úteis.');

    if (cfg.plan === 'Enterprise') {
      para('14.3. CLÁUSULA ARBITRAL (EXCLUSIVA DO PLANO ENTERPRISE): Mediante acordo bilateral escrito por aditivo específico, as partes poderão optar pela submissão do litígio à arbitragem vinculante sob as regras de Câmara de Arbitragem reconhecida em São Paulo/SP (Lei nº 9.307/1996).');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CLÁUSULA 15ª — DISPOSIÇÕES GERAIS
    // ─────────────────────────────────────────────────────────────────────────
    sectionTitle('DÉCIMA QUINTA', 'Das Disposições Gerais');
    para('15.1. VIGÊNCIA: Este Contrato entra em vigor na data de aceite eletrônico e permanecerá válido pelo período do plano contratado, renovando-se automática e sucessivamente, salvo manifestação em contrário de qualquer das partes.');
    para('15.2. ALTERAÇÕES: A LICENCIANTE poderá atualizar os termos deste Contrato mediante notificação por e-mail ou aviso no painel com antecedência mínima de 30 (trinta) dias. Ausência de discordância formal no prazo de 15 dias implica aceite tácito das alterações.');
    para('15.3. CESSÃO: A CONTRATANTE não poderá ceder ou transferir este Contrato sem prévia autorização escrita da LICENCIANTE. A LICENCIANTE poderá ceder em casos de fusão, aquisição ou reestruturação societária.');
    para('15.4. TOLERÂNCIA E NULIDADE PARCIAL: A tolerância quanto a descumprimentos não constituirá novação ou renúncia de direitos. Se qualquer disposição for considerada nula ou ineficaz, as demais permanecerão em vigor. (CC Arts. 360 e 421).');
    para('15.5. CANAIS OFICIAIS DE NOTIFICAÇÃO: Licenciante — develop.ags@gmail.com (Suporte · Vendas · DPO). Contratante — e-mail e dados fornecidos no ato do cadastro.');
    para('[Fund.: CC Arts. 290, 360 e 421; CPC Art. 63]', { italic: true, fillColor: COLOR.muted, fontSize: 7.5 });

    // ─────────────────────────────────────────────────────────────────────────
    // DECLARAÇÃO DE ACEITE + ASSINATURAS
    // ─────────────────────────────────────────────────────────────────────────
    ensureSpace(90);
    doc.moveDown(1);
    hRule(doc.y, COLOR.brand, 0.8);
    doc.y += 10;

    doc.fontSize(8).font('Helvetica-Bold').fillColor(COLOR.brand)
      .text('DECLARAÇÃO DE ACEITE ELETRÔNICO', { align: 'center' });
    doc.moveDown(0.3);
    doc.fontSize(7.8).font('Helvetica').fillColor(COLOR.body)
      .text(
        'A CONTRATANTE declara que leu, compreendeu e concorda integralmente com todas as cláusulas e condições deste Contrato no ato de confirmação do cadastro eletrônico ou processamento do primeiro pagamento. O aceite eletrônico realizado na Plataforma constitui assinatura válida nos termos da Lei nº 14.063/2020.',
        { align: 'justify', lineGap: 2.5 }
      );
    doc.moveDown(1.5);

    ensureSpace(60);
    const sigY = doc.y;
    const midX = 55 + W / 2;

    // Linha Licenciante
    doc.lineWidth(0.5).strokeColor(COLOR.ink)
      .moveTo(55, sigY).lineTo(midX - 10, sigY).stroke();
    doc.fontSize(8).font('Helvetica-Bold').fillColor(COLOR.ink)
      .text('LICENCIANTE', 55, sigY + 4, { width: midX - 65, align: 'center' });
    doc.fontSize(7.5).font('Helvetica').fillColor(COLOR.muted)
      .text('AEGIS CRM TECNOLOGIA — CNPJ 67.155.126/0001-06', 55, sigY + 14, { width: midX - 65, align: 'center' });

    // Linha Contratante
    doc.lineWidth(0.5).strokeColor(COLOR.ink)
      .moveTo(midX + 10, sigY).lineTo(55 + W, sigY).stroke();
    doc.fontSize(8).font('Helvetica-Bold').fillColor(COLOR.ink)
      .text('CONTRATANTE', midX + 10, sigY + 4, { width: midX - 65, align: 'center' });
    doc.fontSize(7.5).font('Helvetica').fillColor(COLOR.muted)
      .text('Razão Social / CNPJ — conforme cadastro', midX + 10, sigY + 14, { width: midX - 65, align: 'center' });

    doc.moveDown(3.5);

    // Data e local
    const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    hRule(doc.y, COLOR.subtle, 0.4);
    doc.y += 4;
    doc.fontSize(7.5).font('Helvetica').fillColor(COLOR.footer)
      .text(`Contrato gerado automaticamente em ${today} | Aegis CRM Tecnologia | CNPJ 67.155.126/0001-06 | develop.ags@gmail.com`, { align: 'center', lineGap: 1.5 });

    // ─────────────────────────────────────────────────────────────────────────
    doc.end();

    stream.on('finish', () => {
      console.log(`✅  Gerado: ${cfg.file}`);
      resolve(filePath);
    });
    stream.on('error', reject);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// Runner
// ─────────────────────────────────────────────────────────────────────────────
(async () => {
  console.log('\n🚀  Iniciando geração dos 6 contratos jurídicos PDF — Aegis CRM\n');
  for (const cfg of CONTRACTS) {
    await buildPDF(cfg);
  }
  console.log('\n🏛️  Todos os 6 contratos gerados com sucesso em assets/contratos/\n');
})();
