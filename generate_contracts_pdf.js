/**
 * Aegis CRM — Gerador de Contratos PDF Jurídicos
 * CNPJ: 67.155.126/0001-06 | AEGIS TECNOLOGIA
 */

'use strict';

const fs  = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const OUT_DIR = path.join(__dirname, 'assets', 'contratos');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const COLOR = {
  ink:    '#0f172a',
  brand:  '#1e3a8a',
  muted:  '#64748b',
  line:   '#e2e8f0',
  footer: '#94a3b8',
  body:   '#1e293b',
  box:    '#dbeafe',
};

// ─── Configurações dos 6 contratos ───────────────────────────────────────────
const CONTRACTS = [
  {
    file: 'contrato-essencial-mensal.pdf', plan: 'Essencial', mode: 'Mensal',
    priceDisplay: 'R$ 497,00/mês — faturado mensalmente, a cada 30 dias',
    priceClause:  'R$ 497,00 (quatrocentos e noventa e sete reais) mensais',
    billingDesc:  'mensalmente, a cada 30 (trinta) dias corridos, mediante débito recorrente no cartão de crédito ou fatura PIX gerada no primeiro dia de cada ciclo',
    discountNote: null,
    sla:          'Suporte via e-mail e chat in-app — primeira resposta em até 48 h úteis.',
    dataWindow:   '30 (trinta) dias',
    liabilityCap: '12 (doze) mensalidades do Plano Essencial vigentes à época do evento danoso',
    features: [
      'Até 3 usuários simultâneos com controle de acesso por papel;',
      '2 funis de vendas configuráveis (até 8 etapas por funil);',
      '2 conexões WhatsApp via cluster WAHA;',
      'Transcrição automática de áudios por IA (Whisper);',
      '1 agente autônomo de Inteligência Artificial;',
      'Franquia de 1.000.000 tokens de IA generativa/mês;',
      'Copiloto de vendas em tempo real com sugestões contextuais;',
      'Base de conhecimento RAG para documentos e FAQs;',
      'Até 5 workflows de automação ativos;',
      'Geração de propostas comerciais em PDF via WhatsApp;',
      'Formulário público de captura de leads e widget para sites;',
      'Criptografia AES-256-GCM e isolamento multi-tenant PostgreSQL RLS.',
    ],
    renewal:      'Vigência mensal — renovação automática a cada 30 dias. Cancelamento a qualquer momento pelo painel, sem multa. Reajuste anual pelo IPCA/IBGE.',
    cancellation: 'Sem fidelidade: sem multa rescisória. Acesso permanece ativo até o fim do ciclo já pago; sem reembolso proporcional.',
    penalty:      'Inexiste multa rescisória na modalidade mensal.',
  },
  {
    file: 'contrato-essencial-anual.pdf', plan: 'Essencial', mode: 'Anual',
    priceDisplay: 'R$ 4.970,00/ano (equivalente a R$ 414,16/mês — 16% de desconto)',
    priceClause:  'R$ 4.970,00 (quatro mil, novecentos e setenta reais) anuais',
    billingDesc:  'anualmente, em parcela única ou parcelado em até 12 vezes no cartão de crédito',
    discountNote: 'Desconto de 16% (dezesseis por cento) concedido em razão do compromisso de fidelidade de 12 meses.',
    sla:          'Suporte via e-mail e chat in-app — primeira resposta em até 48 h úteis.',
    dataWindow:   '30 (trinta) dias',
    liabilityCap: 'o valor total da anuidade contratada do Plano Essencial',
    features: [
      'Até 3 usuários simultâneos com controle de acesso por papel;',
      '2 funis de vendas configuráveis (até 8 etapas por funil);',
      '2 conexões WhatsApp via cluster WAHA;',
      'Transcrição automática de áudios por IA (Whisper);',
      '1 agente autônomo de Inteligência Artificial;',
      'Franquia de 1.000.000 tokens de IA generativa/mês;',
      'Copiloto de vendas em tempo real com sugestões contextuais;',
      'Base de conhecimento RAG para documentos e FAQs;',
      'Até 5 workflows de automação ativos;',
      'Geração de propostas comerciais em PDF via WhatsApp;',
      'Formulário público de captura de leads e widget para sites;',
      'Criptografia AES-256-GCM e isolamento multi-tenant PostgreSQL RLS.',
    ],
    renewal:      'Vigência de 12 meses. Renovação automática por iguais períodos anuais, salvo aviso formal com 30 dias de antecedência. Notificação enviada 30 dias antes do vencimento. Reajuste anual pelo IPCA/IBGE.',
    cancellation: 'Rescisão antecipada: notificação prévia de 30 dias obrigatória. Incide multa compensatória de 30% sobre o saldo vincendo remanescente (CC Art. 603).',
    penalty:      'Multa compensatória de 30% sobre as parcelas vincendas até o término dos 12 meses.',
  },
  {
    file: 'contrato-crescimento-mensal.pdf', plan: 'Crescimento', mode: 'Mensal',
    priceDisplay: 'R$ 997,00/mês — faturado mensalmente, a cada 30 dias',
    priceClause:  'R$ 997,00 (novecentos e noventa e sete reais) mensais',
    billingDesc:  'mensalmente, a cada 30 (trinta) dias corridos, mediante faturamento e cobrança recorrente no meio de pagamento ativo',
    discountNote: null,
    sla:          'Suporte prioritário via WhatsApp e central de ajuda — resposta em até 12 h úteis + 1 sessão de onboarding assistido.',
    dataWindow:   '30 (trinta) dias',
    liabilityCap: '12 (doze) mensalidades do Plano Crescimento vigentes à época do evento danoso',
    features: [
      'Até 10 usuários simultâneos com papéis de acesso por setor;',
      '10 funis de vendas configuráveis (até 15 etapas por funil);',
      '5 conexões WhatsApp com multiatendimento, filas e roteamento por setor;',
      'Proteção anti-banimento (Warmup de chips) e debouncing de 60 s;',
      '3 agentes autônomos de IA com personalização de tom de voz;',
      'Franquia de 1.000.000 tokens de IA generativa/mês;',
      'Análise de sentimento das conversas e classificação de leads;',
      'Geração de orçamentos em PDF com envio de chave PIX pela IA;',
      'Base de conhecimento RAG com upload de documentos;',
      'Até 30 workflows ativos com gatilhos comportamentais e webhooks;',
      'Módulo Comercial: contratos, faturas recorrentes e ordens de compra;',
      'Gestão de Equipes: metas, Round-Robin e visão por setores;',
      'BI em tempo real com Redis, drill-down e exportação CSV/Excel/PDF;',
      'API REST de consulta (leitura) e até 10 webhooks de integração.',
    ],
    renewal:      'Vigência mensal — renovação automática a cada 30 dias. Cancelamento a qualquer momento, sem multa. Reajuste anual pelo IPCA/IBGE.',
    cancellation: 'Sem fidelidade: sem multa rescisória. Serviço ativo até o fim do ciclo já faturado.',
    penalty:      'Inexiste multa rescisória na modalidade mensal.',
  },
  {
    file: 'contrato-crescimento-anual.pdf', plan: 'Crescimento', mode: 'Anual',
    priceDisplay: 'R$ 9.970,00/ano (equivalente a R$ 830,83/mês — 16,65% de desconto)',
    priceClause:  'R$ 9.970,00 (nove mil, novecentos e setenta reais) anuais',
    billingDesc:  'anualmente, em parcela única ou parcelado em até 12 vezes no cartão de crédito',
    discountNote: 'Desconto de 16,65% (dezesseis vírgula sessenta e cinco por cento) em razão do compromisso anual.',
    sla:          'Suporte prioritário via WhatsApp e central de ajuda — resposta em até 12 h úteis + 1 sessão de onboarding assistido.',
    dataWindow:   '30 (trinta) dias',
    liabilityCap: 'o valor total da anuidade contratada do Plano Crescimento',
    features: [
      'Até 10 usuários simultâneos com papéis de acesso por setor;',
      '10 funis de vendas configuráveis (até 15 etapas por funil);',
      '5 conexões WhatsApp com multiatendimento, filas e roteamento por setor;',
      'Proteção anti-banimento (Warmup de chips) e debouncing de 60 s;',
      '3 agentes autônomos de IA com personalização de tom de voz;',
      'Franquia de 1.000.000 tokens de IA generativa/mês;',
      'Análise de sentimento das conversas e classificação de leads;',
      'Geração de orçamentos em PDF com envio de chave PIX pela IA;',
      'Base de conhecimento RAG com upload de documentos;',
      'Até 30 workflows ativos com gatilhos comportamentais e webhooks;',
      'Módulo Comercial: contratos, faturas recorrentes e ordens de compra;',
      'Gestão de Equipes: metas, Round-Robin e visão por setores;',
      'BI em tempo real com Redis, drill-down e exportação CSV/Excel/PDF;',
      'API REST de consulta (leitura) e até 10 webhooks de integração.',
    ],
    renewal:      'Vigência de 12 meses. Renovação automática por iguais períodos anuais, salvo aviso formal com 30 dias de antecedência. Notificação enviada 30 dias antes do vencimento. Reajuste anual pelo IPCA/IBGE.',
    cancellation: 'Rescisão antecipada: notificação prévia de 30 dias obrigatória. Incide multa compensatória de 30% sobre o saldo vincendo remanescente (CC Art. 603).',
    penalty:      'Multa compensatória de 30% sobre as parcelas vincendas até o término dos 12 meses.',
  },
  {
    file: 'contrato-enterprise-mensal.pdf', plan: 'Enterprise', mode: 'Mensal',
    priceDisplay: 'R$ 2.997,00/mês — faturado mensalmente, a cada 30 dias',
    priceClause:  'R$ 2.997,00 (dois mil, novecentos e noventa e sete reais) mensais',
    billingDesc:  'mensalmente, a cada 30 (trinta) dias corridos',
    discountNote: null,
    sla:          'SLA contratual: resposta em até 4 h úteis. Suporte VIP 24/7 (WhatsApp e telefone). Gerente de Conta Dedicado. Onboarding corporativo (3 sessões técnicas).',
    dataWindow:   '60 (sessenta) dias',
    liabilityCap: '12 (doze) mensalidades do Plano Enterprise vigentes à época do evento danoso',
    features: [
      'Usuários, operadores e administradores ilimitados;',
      'Funis de vendas ilimitados (até 25 etapas por funil);',
      '20 conexões WhatsApp em Cluster WAHA multi-nó com balanceamento de carga;',
      'Warmup avançado anti-banimento para alto volume de disparos;',
      'Agentes autônomos de IA ilimitados e mais de 5.000.000 tokens/mês;',
      'BYOK (Bring Your Own Key): OpenAI, Anthropic Claude e Google Gemini;',
      'Few-Shot Learning ativo — treinamento com histórico real de conversas;',
      'Orquestrador cognitivo de 6 camadas com governança e transbordo customizáveis;',
      'Workflows ilimitados com 17 ações nativas, webhooks externos e ferramentas;',
      'API REST completa (leitura e escrita) e Webhooks ilimitados;',
      'White-Label integral: marca, domínio, logotipo, favicon e e-mails SMTP;',
      'SSO (Single Sign-On) com perfis de permissão granulares;',
      'Relatório de ROI de IA, logs de auditoria imutáveis e conformidade LGPD;',
      'Cláusula arbitral e DPA (Data Processing Agreement) customizado.',
    ],
    renewal:      'Vigência mensal — renovação automática a cada 30 dias. Cancelamento com aviso prévio de 30 dias, sem multa. Janela de exportação de dados de 60 dias garantida.',
    cancellation: 'Sem fidelidade: sem multa rescisória. Aviso prévio de 30 dias obrigatório. Janela de exportação de dados de 60 dias após encerramento.',
    penalty:      'Inexiste multa rescisória no plano mensal Enterprise.',
  },
  {
    file: 'contrato-enterprise-anual.pdf', plan: 'Enterprise', mode: 'Anual',
    priceDisplay: 'R$ 29.970,00/ano (equivalente a R$ 2.497,50/mês — 16,66% de desconto)',
    priceClause:  'R$ 29.970,00 (vinte e nove mil, novecentos e setenta reais) anuais',
    billingDesc:  'anualmente, em parcela única ou parcelado em até 12 vezes no cartão de crédito',
    discountNote: 'Desconto de 16,66% (dezesseis vírgula sessenta e seis por cento) em razão do compromisso anual.',
    sla:          'SLA contratual: resposta em até 4 h úteis. Suporte VIP 24/7 (WhatsApp e telefone). Gerente de Conta Dedicado. Onboarding corporativo (3 sessões técnicas).',
    dataWindow:   '60 (sessenta) dias',
    liabilityCap: 'o valor total da anuidade contratada do Plano Enterprise',
    features: [
      'Usuários, operadores e administradores ilimitados;',
      'Funis de vendas ilimitados (até 25 etapas por funil);',
      '20 conexões WhatsApp em Cluster WAHA multi-nó com balanceamento de carga;',
      'Warmup avançado anti-banimento para alto volume de disparos;',
      'Agentes autônomos de IA ilimitados e mais de 5.000.000 tokens/mês;',
      'BYOK (Bring Your Own Key): OpenAI, Anthropic Claude e Google Gemini;',
      'Few-Shot Learning ativo — treinamento com histórico real de conversas;',
      'Orquestrador cognitivo de 6 camadas com governança e transbordo customizáveis;',
      'Workflows ilimitados com 17 ações nativas, webhooks externos e ferramentas;',
      'API REST completa (leitura e escrita) e Webhooks ilimitados;',
      'White-Label integral: marca, domínio, logotipo, favicon e e-mails SMTP;',
      'SSO (Single Sign-On) com perfis de permissão granulares;',
      'Relatório de ROI de IA, logs de auditoria imutáveis e conformidade LGPD;',
      'Cláusula arbitral e DPA (Data Processing Agreement) customizado.',
    ],
    renewal:      'Vigência de 12 meses. Renovação automática por iguais períodos anuais, salvo aviso formal com 30 dias de antecedência. Reajuste anual pelo IPCA/IBGE.',
    cancellation: 'Rescisão antecipada: notificação prévia de 30 dias obrigatória. Multa compensatória de 30% sobre o saldo vincendo remanescente (CC Art. 603). Janela de 60 dias para exportação integral dos dados (JSON/CSV).',
    penalty:      'Multa compensatória de 30% sobre o saldo de parcelas vincendas até o encerramento dos 12 meses.',
  },
];

// ─── Gerador de PDF ───────────────────────────────────────────────────────────
function buildPDF(cfg) {
  return new Promise((resolve, reject) => {
    const ML = 55, MR = 55, MT = 60, MB = 55;
    const filePath = path.join(OUT_DIR, cfg.file);
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: MT, bottom: MB, left: ML, right: MR },
      autoFirstPage: true,
      bufferPages: true,   // buffer all pages so we can stamp footers at the end
      info: {
        Title:   `Aegis CRM — Contrato ${cfg.plan} ${cfg.mode}`,
        Author:  'Aegis CRM Tecnologia — CNPJ 67.155.126/0001-06',
        Subject: `Licença SaaS B2B — Plano ${cfg.plan} (${cfg.mode})`,
      },
    });

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const PW = doc.page.width;           // 595.28
    const W  = PW - ML - MR;            // usable width
    const PH = doc.page.height;         // 841.89
    const CONTENT_BOTTOM = PH - MB - 20; // last safe y

    // ── Helpers ──────────────────────────────────────────────────────────────

    /** Horizontal rule at absolute y */
    function hRule(y, color, w) {
      doc.save().lineWidth(w || 0.5).strokeColor(color || COLOR.line)
        .moveTo(ML, y).lineTo(ML + W, y).stroke().restore();
    }

    /** Add a new page and reset cursor to top-left margin */
    function newPage() {
      doc.addPage();
      doc.x = ML;
      doc.y = MT;
    }

    /** Ensure there is at least `needed` pts of space before continuing */
    function ensureSpace(needed) {
      if (doc.y + needed > CONTENT_BOTTOM) newPage();
    }

    /** Bold colored section heading */
    function sectionTitle(num, title) {
      ensureSpace(45);
      doc.moveDown(0.7);
      // Save current x, write heading from left margin, restore x
      doc.x = ML;
      doc.fontSize(8.5).font('Helvetica-Bold').fillColor(COLOR.brand)
        .text(`CLÁUSULA ${num} — ${title.toUpperCase()}`, ML, doc.y, { width: W });
      const ry = doc.y + 3;
      hRule(ry, COLOR.brand, 0.7);
      doc.x = ML;
      doc.y = ry + 8;
    }

    /** Justified paragraph */
    function para(text, { bold = false, small = false, color = COLOR.body } = {}) {
      ensureSpace(20);
      doc.x = ML;
      doc.fontSize(small ? 7.5 : 8.5)
        .font(bold ? 'Helvetica-Bold' : 'Helvetica')
        .fillColor(color)
        .text(text, ML, doc.y, { width: W, align: 'justify', lineGap: 2.5 });
      doc.x = ML;
      doc.moveDown(0.4);
    }

    /** Bullet item */
    function bullet(text) {
      ensureSpace(16);
      const dotX = ML + 4;
      const txtX = ML + 14;
      const txtW = W - 14;
      const startY = doc.y;
      doc.fontSize(8.5).font('Helvetica').fillColor(COLOR.body)
        .text('\u2022', dotX, startY, { width: 10, lineBreak: false });
      doc.text(text, txtX, startY, { width: txtW, align: 'justify', lineGap: 2 });
      doc.x = ML;
      doc.moveDown(0.25);
    }

    /** Blue info box (label | value) */
    function infoBox(label, value) {
      ensureSpace(26);
      const by = doc.y;
      const bh = 20;
      doc.save().rect(ML, by, W, bh).fillColor(COLOR.box).fill().restore();
      doc.x = ML;
      doc.fontSize(7.5).font('Helvetica-Bold').fillColor(COLOR.brand)
        .text(label.toUpperCase() + ':', ML + 6, by + 5, { width: 130, lineBreak: false });
      doc.fontSize(7.5).font('Helvetica').fillColor(COLOR.ink)
        .text(value, ML + 140, by + 5, { width: W - 146, lineBreak: false });
      doc.x = ML;
      doc.y = by + bh + 4;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PAGE 1 — CAPA / CABEÇALHO
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
    doc.moveDown(0.4);
    doc.fontSize(8.5).font('Helvetica-Bold').fillColor(COLOR.brand)
      .text('CONTRATO DE PRESTAÇÃO DE SERVIÇOS E LICENCIAMENTO SAAS', ML, doc.y, { width: W, align: 'center' });
    doc.x = ML;
    doc.fontSize(11).font('Helvetica-Bold').fillColor(COLOR.ink)
      .text(`PLANO ${cfg.plan.toUpperCase()} — MODALIDADE ${cfg.mode.toUpperCase()}`, ML, doc.y, { width: W, align: 'center' });
    doc.x = ML;
    doc.moveDown(0.6);
    hRule(doc.y, COLOR.brand, 1.5);
    doc.x = ML;
    doc.y += 12;

    // Info boxes
    infoBox('Regime Jurídico',  'Empresarial B2B — Código Civil Art. 421-A | Lei da Liberdade Econômica (Lei nº 13.874/2019)');
    infoBox('Licenciante',      'AEGIS CRM TECNOLOGIA  ·  CNPJ 67.155.126/0001-06  ·  Endereço a definir');
    infoBox('Contato / DPO',    'develop.ags@gmail.com  (Suporte · Vendas · Encarregado LGPD)');
    infoBox('Plano / Modo',     `${cfg.plan}  —  ${cfg.mode}`);
    infoBox('Valor',            cfg.priceDisplay);
    infoBox('Trial Gratuito',   '7 (sete) dias corridos — cancelamento sem ônus durante o período de teste');
    doc.moveDown(0.8);

    // ─────────────────────────────────────────────────────────────────────────
    // CLÁUSULAS
    // ─────────────────────────────────────────────────────────────────────────

    // 1 — PARTES
    sectionTitle('PRIMEIRA', 'Das Partes e do Enquadramento Jurídico');
    para('1.1. LICENCIANTE: AEGIS CRM TECNOLOGIA, pessoa jurídica de direito privado, CNPJ 67.155.126/0001-06, endereço a definir, e-mail develop.ags@gmail.com, doravante denominada "LICENCIANTE" ou "AEGIS CRM".');
    para('1.2. CONTRATANTE: Pessoa jurídica regularmente constituída, com CNPJ ativo, qualificada no formulário de cadastro e aceite eletrônico na Plataforma, doravante denominada "CONTRATANTE" ou "LICENCIADA".');
    para('1.3. ENQUADRAMENTO B2B (CC Art. 421-A): A CONTRATANTE declara que é pessoa jurídica e que a contratação do Aegis CRM destina-se como INSUMO PRODUTIVO COMERCIAL E FERRAMENTA DE GESTÃO DE VENDAS, operando sob a Lei da Liberdade Econômica (Lei nº 13.874/2019) e os Arts. 421 e 421-A do Código Civil, com presunção de paridade e simetria — afastada a incidência do CDC (Lei nº 8.078/1990).');
    para('Fund.: CC Arts. 421, 421-A; Lei nº 13.874/2019; STJ AgInt no AREsp 1.637.288/SP.', { small: true, color: COLOR.muted });

    // 2 — OBJETO
    sectionTitle('SEGUNDA', 'Do Objeto e da Licença SaaS');
    para(`2.1. Constitui objeto deste Contrato a concessão de licença de uso temporária, revogável, não exclusiva, intransferível e sem sublicenciamento do software Aegis CRM na modalidade SaaS, nos limites do PLANO ${cfg.plan.toUpperCase()} — ${cfg.mode.toUpperCase()}.`);
    para('2.2. A licença restringe-se ao acesso operacional via navegadores e APIs oficiais — não inclui cessão de código-fonte, marcas, patentes ou quaisquer direitos de propriedade intelectual da LICENCIANTE. (Lei nº 9.609/1998, Arts. 1º, 2º e 9º; STF ADIs 5659 e 5658).');

    // 3 — PLANO
    sectionTitle('TERCEIRA', `Das Especificações do Plano ${cfg.plan}`);
    para(`3.1. A licença ativa confere à CONTRATANTE os seguintes módulos e limites no PLANO ${cfg.plan.toUpperCase()} — ${cfg.mode.toUpperCase()}:`);
    cfg.features.forEach(f => bullet(f));
    if (cfg.discountNote) { doc.moveDown(0.2); para(`3.2. DESCONTO: ${cfg.discountNote}`); }

    // 4 — PREÇO
    sectionTitle('QUARTA', 'Do Preço, Faturamento e Condições de Pagamento');
    para(`4.1. A CONTRATANTE pagará à LICENCIANTE a quantia de ${cfg.priceClause}, faturada ${cfg.billingDesc}.`);
    para('4.2. Pagamento via cartão de crédito corporativo ou fatura bancária/PIX com vencimento no primeiro dia de cada ciclo.');
    para('4.3. MORA: O atraso sujeitará a CONTRATANTE a multa moratória de 2%, juros de 1%/mês pro-rata die e correção pelo IPCA/IBGE (CC Arts. 394 e 395).');
    para('4.4. SUSPENSÃO: Inadimplência superior a 5 dias úteis autoriza suspensão do tenant (CC Art. 476 — Exceção do Contrato Não Cumprido), sem prejuízo da cobrança integral.');
    para('4.5. REAJUSTE ANUAL: Valores reajustados a cada 12 meses pelo IPCA/IBGE, com notificação prévia de 30 dias.');

    // 5 — CANCELAMENTO
    sectionTitle('QUINTA', 'Do Trial Gratuito, Cancelamento e Rescisão');
    para('5.1. TRIAL GRATUITO: A CONTRATANTE dispõe de 7 (sete) dias corridos de teste gratuito. Cancelamento dentro do trial: sem qualquer cobrança.');
    para(`5.2. POLÍTICA DE CANCELAMENTO: ${cfg.cancellation}`);
    para(`5.3. CLÁUSULA PENAL: ${cfg.penalty}`);
    para(`5.4. JANELA DE EXPORTAÇÃO (LGPD Art. 16): Após o encerramento, a CONTRATANTE terá ${cfg.dataWindow} para exportar sua base de dados (CSV/JSON). Decorrido o prazo, os dados serão eliminados definitivamente.`);
    para('Fund.: CC Arts. 473, 599, 603; LGPD Art. 16; Marco Civil da Internet, Art. 7º, X.', { small: true, color: COLOR.muted });

    // 6 — RENOVAÇÃO
    sectionTitle('SEXTA', 'Da Renovação Contratual');
    para(`6.1. ${cfg.renewal}`);

    // 7 — SLA
    sectionTitle('SÉTIMA', 'Do Nível de Serviço (SLA 99,5%) e Service Credits');
    para(`7.1. SUPORTE TÉCNICO: ${cfg.sla}`);
    para('7.2. DISPONIBILIDADE: A LICENCIANTE garante uptime mensal mínimo de 99,5%, excluídas manutenções programadas (avisadas com 24 h) e falhas de terceiros (AWS, Meta/WhatsApp, OpenAI, Anthropic).');
    para('7.3. SERVICE CREDITS (remédio exclusivo):');
    bullet('Disponibilidade 99,0%–99,49%: crédito de 5% na fatura seguinte;');
    bullet('Disponibilidade 95,0%–98,99%: crédito de 15% na fatura seguinte;');
    bullet('Disponibilidade abaixo de 95,0%: crédito de 25% na fatura seguinte.');
    para('7.4. Os Service Credits são a ÚNICA compensação financeira por indisponibilidade — vedadas indenizações paralelas (CC Art. 421-A, I e II).');
    para('Fund.: CC Arts. 389, 393, 421-A; LC nº 116/2003.', { small: true, color: COLOR.muted });

    // 8 — LIABILITY CAP
    sectionTitle('OITAVA', 'Da Limitação de Responsabilidade — Liability Cap');
    para(`8.1. TETO DE INDENIZAÇÃO (LIABILITY CAP): A responsabilidade civil total da LICENCIANTE limita-se a ${cfg.liabilityCap} (CC Art. 421-A, II).`);
    para('8.2. EXCLUSÃO DE DANOS INDIRETOS: A LICENCIANTE não responde por lucros cessantes, perda de oportunidade, danos reputacionais ou quaisquer danos indiretos (CC Arts. 402 e 403).');
    para('8.3. EXCEÇÃO: As limitações não se aplicam a dolo ou culpa grave comprovados por decisão judicial transitada em julgado.');
    para('Fund.: CC Arts. 186, 393, 402, 403 e 421-A, II; STJ AgInt no AREsp 1.637.288/SP.', { small: true, color: COLOR.muted });

    // 9 — IA / HITL
    sectionTitle('NONA', 'Do Uso de IA e Regra Human-in-the-Loop (HITL)');
    para('9.1. NATUREZA PROBABILÍSTICA: Os recursos de IA (Agentes, Copilot, RAG, Transcrição e Análise de Sentimento) operam por inferência estocástica. A LICENCIANTE não garante infalibilidade dos outputs gerados pela IA.');
    para('9.2. HITL COMPULSÓRIO: A CONTRATANTE obriga-se a manter SUPERVISÃO HUMANA OBRIGATÓRIA sobre todas as propostas, cotações, orçamentos e compromissos gerados pela IA antes de sua transmissão ou formalização definitiva.');
    para('9.3. ISENÇÃO POR ALUCINAÇÕES: A LICENCIANTE isenta-se de responsabilidade por erros, preços incorretos ou declarações equivocadas gerados pela IA e enviados sem validação humana prévia da CONTRATANTE.');
    para('9.4. TOKENS: Esgotada a franquia mensal, o serviço de IA será pausado até o próximo ciclo ou aquisição de pacote adicional. No Enterprise, a modalidade BYOK permite uso de chaves de API próprias junto a fornecedores externos.');
    para('Fund.: CC Art. 422; Lei nº 9.609/1998; LGPD Art. 20; PL 2.338/2023.', { small: true, color: COLOR.muted });

    // 10 — WHATSAPP
    sectionTitle('DÉCIMA', 'Da Integração com WhatsApp e Serviços de Terceiros');
    para('10.1. A CONTRATANTE deve usar o canal WhatsApp em conformidade com as políticas da Meta Inc., respondendo exclusivamente por bloqueios ou banimentos de chips causados por spam ou envio em massa não consentido.');
    para('10.2. ISENÇÃO (Marco Civil, Art. 19 — Lei nº 12.965/2014): A LICENCIANTE atua como Provedor de Aplicações de Internet e não responde pelo conteúdo das mensagens, áudios e arquivos trafegados pela CONTRATANTE com seus clientes finais.');

    // 11 — LGPD / DPA
    sectionTitle('DÉCIMA PRIMEIRA', 'Da Proteção de Dados Pessoais (LGPD) e do DPA');
    para('11.1. PAPÉIS (LGPD): A CONTRATANTE é CONTROLADORA dos dados de leads e clientes armazenados na Plataforma. A LICENCIANTE é OPERADORA, tratando tais dados exclusivamente para prestação do serviço.');
    para('11.2. VEDAÇÃO A DADOS SENSÍVEIS: Proibida a inserção de dados sensíveis (LGPD Art. 11) sem base legal. Violações são de responsabilidade exclusiva da CONTRATANTE (CC Art. 934).');
    para('11.3. SEGURANÇA: Dados trafegados com criptografia TLS 1.3 e armazenados com AES-256-GCM. Infraestrutura AWS com Cláusulas-Padrão Contratuais (Resolução CD/ANPD nº 19/2024).');
    para('11.4. VEDAÇÃO A TREINAMENTO DE LLMs: Proibido à LICENCIANTE usar dados, arquivos ou histórico de conversas da CONTRATANTE para treinar modelos de IA públicos de terceiros.');
    para('11.5. NOTIFICAÇÃO DE INCIDENTES: Confirmado incidente relevante, a LICENCIANTE notificará a CONTRATANTE em até 48 h úteis (LGPD Art. 48 c/c Resolução ANPD nº 15/2024).');
    para('Fund.: LGPD (Lei nº 13.709/2018), Arts. 5º, 7º, 37, 39, 46 e 48; Resolução ANPD nº 15/2024.', { small: true, color: COLOR.muted });

    // 12 — PROPRIEDADE INTELECTUAL
    sectionTitle('DÉCIMA SEGUNDA', 'Da Propriedade Intelectual e Confidencialidade');
    para('12.1. PROPRIEDADE DA PLATAFORMA: Todo o código-fonte, arquitetura, marcas, metodologias e interfaces do Aegis CRM pertencem exclusivamente à LICENCIANTE (Leis nº 9.279/1996 e 9.609/1998). É vedado engenharia reversa, cópia ou uso para desenvolvimento de produtos concorrentes.');
    para('12.2. DADOS DO CLIENTE: A CONTRATANTE é proprietária exclusiva de todos os dados, leads e históricos inseridos em seu tenant.');
    para('12.3. CONFIDENCIALIDADE: As partes mantêm sigilo absoluto sobre informações estratégicas e operacionais trocadas durante o contrato, pelo prazo de 5 (cinco) anos após o encerramento.');

    // 13 — INADIMPLÊNCIA / CHARGEBACK
    sectionTitle('DÉCIMA TERCEIRA', 'Da Inadimplência, Anti-Chargeback e Título Executivo');
    para('13.1. SUSPENSÃO (CC Art. 476): Inadimplência superior a 5 dias úteis autoriza suspensão do acesso ao tenant, sem prejuízo da cobrança dos valores em atraso com encargos moratórios.');
    para('13.2. ANTI-CHARGEBACK: Vedada a contestação de débito legítimo junto à administradora de cartão sem prévia tentativa de solução amigável. Chargeback indevido autoriza suspensão imediata, inclusão em órgãos de proteção ao crédito (Serasa/SPC) e cobrança de perdas e danos.');
    para('13.3. TÍTULO EXECUTIVO EXTRAJUDICIAL (CPC Art. 784, III): Este Contrato, celebrado eletronicamente com aceite registrado em audit trail (Lei nº 14.063/2020), acompanhado das faturas inadimplidas, constitui TÍTULO EXECUTIVO EXTRAJUDICIAL, apto a instruir execução direta de quantia certa.');
    para('Fund.: CC Art. 476; CPC Art. 784, III c/c Lei nº 14.620/2023; Lei nº 14.063/2020.', { small: true, color: COLOR.muted });

    // 14 — FORO
    sectionTitle('DÉCIMA QUARTA', 'Do Foro e Solução de Conflitos');
    para('14.1. FORO DE ELEIÇÃO: As partes elegem o FORO DA COMARCA DA CAPITAL DO ESTADO DE SÃO PAULO/SP como único competente para dirimir litígios deste Contrato, renunciando a qualquer outro (CPC Art. 63; STF Súmula 335).');
    para('14.2. MEDIAÇÃO PRÉVIA: Antes de qualquer ação judicial, as partes comprometem-se a buscar resolução amigável por notificação e reunião de conciliação no prazo de 15 dias úteis.');
    if (cfg.plan === 'Enterprise') {
      para('14.3. ARBITRAGEM (EXCLUSIVA ENTERPRISE): Mediante aditivo bilateral escrito, as partes poderão optar por arbitragem vinculante sob Câmara reconhecida em São Paulo/SP (Lei nº 9.307/1996).');
    }

    // 15 — DISPOSIÇÕES GERAIS
    sectionTitle('DÉCIMA QUINTA', 'Das Disposições Gerais');
    para('15.1. Este Contrato entra em vigor no aceite eletrônico e permanece válido pelo período do plano, renovando-se automaticamente salvo manifestação contrária.');
    para('15.2. ALTERAÇÕES: A LICENCIANTE pode atualizar os termos com notificação 30 dias antes. Ausência de discordância formal em 15 dias implica aceite tácito.');
    para('15.3. CESSÃO: A CONTRATANTE não pode ceder este Contrato sem autorização escrita prévia da LICENCIANTE. A LICENCIANTE pode ceder em fusão, aquisição ou reestruturação.');
    para('15.4. TOLERÂNCIA E NULIDADE PARCIAL: Tolerância a descumprimentos não constitui novação. Cláusula nula não invalida as demais (CC Arts. 360 e 421).');
    para('15.5. CANAIS OFICIAIS: Licenciante — develop.ags@gmail.com (Suporte · Vendas · DPO). Contratante — e-mail e dados fornecidos no cadastro.');
    para('Fund.: CC Arts. 290, 360 e 421; CPC Art. 63.', { small: true, color: COLOR.muted });

    // ─── Bloco de Assinaturas ─────────────────────────────────────────────────
    ensureSpace(80);
    doc.moveDown(1);
    hRule(doc.y, COLOR.brand, 0.8);
    doc.x = ML;
    doc.y += 10;

    doc.x = ML;
    doc.fontSize(8).font('Helvetica-Bold').fillColor(COLOR.brand)
      .text('DECLARAÇÃO DE ACEITE ELETRÔNICO', ML, doc.y, { width: W, align: 'center' });
    doc.x = ML;
    doc.moveDown(0.4);
    doc.fontSize(7.8).font('Helvetica').fillColor(COLOR.body)
      .text(
        'A CONTRATANTE declara ter lido, compreendido e aceito integralmente todas as cláusulas e condições deste Contrato no ato de confirmação do cadastro eletrônico ou do primeiro pagamento. O aceite eletrônico registrado em audit trail na Plataforma constitui assinatura válida nos termos da Lei nº 14.063/2020.',
        ML, doc.y, { width: W, align: 'justify', lineGap: 2.5 }
      );
    doc.x = ML;
    doc.moveDown(2);

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
      .text('Razão Social / CNPJ — conforme cadastro', ML + half + 20, sigY + 15, { width: half, align: 'center' });

    doc.x = ML;
    doc.y = sigY + 40;

    const today = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    hRule(doc.y, COLOR.line, 0.4);
    doc.x = ML;
    doc.y += 5;
    doc.fontSize(7).font('Helvetica').fillColor(COLOR.footer)
      .text(`Gerado em ${today}  ·  Aegis CRM Tecnologia  ·  CNPJ 67.155.126/0001-06  ·  develop.ags@gmail.com`, ML, doc.y, { width: W, align: 'center' });

    // ─── Stampar rodapé em todas as páginas ──────────────────────────────────
    const totalPages = doc.bufferedPageRange().count;
    for (let i = 0; i < totalPages; i++) {
      doc.switchToPage(i);
      const bot = PH - 22;
      doc.save()
        .fontSize(7).font('Helvetica').fillColor(COLOR.footer)
        .text(
          `Aegis CRM Tecnologia  ·  CNPJ 67.155.126/0001-06  ·  Plano ${cfg.plan} (${cfg.mode})  ·  Página ${i + 1} de ${totalPages}  ·  develop.ags@gmail.com`,
          ML, bot, { width: W, align: 'center', lineBreak: false }
        )
        .restore();
    }

    doc.end();
    stream.on('finish', () => { console.log(`\u2705  Gerado: ${cfg.file}`); resolve(filePath); });
    stream.on('error', reject);
  });
}

// ─── Runner ───────────────────────────────────────────────────────────────────
(async () => {
  console.log('\n\uD83D\uDE80  Gerando 6 contratos PDF — Aegis CRM\n');
  for (const cfg of CONTRACTS) await buildPDF(cfg);
  console.log('\n\uD83C\uDFDB\uFE0F  Concluído — assets/contratos/\n');
})();
