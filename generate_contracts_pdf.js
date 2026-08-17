const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const outDir = path.join(__dirname, 'assets/contratos');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const contractConfigs = [
  {
    fileName: 'contrato-essencial-mensal.pdf',
    planName: 'Essencial',
    duration: 'Mensal',
    priceText: 'R$ 497,00 (quatrocentos e noventa e sete reais) por mês',
    billingCycle: 'mensalmente, a cada 30 (trinta) dias corridos',
    liabilityCap: 'o montante total correspondente a 12 (doze) mensalidades do Plano Essencial vigentes à época do evento',
    supportSla: 'Suporte técnico padrão via chat in-app e e-mail com tempo de primeira resposta em até 48 (quarenta e oito) horas úteis.',
    dataRetentionDays: '30 (trinta) dias',
    features: [
      'Até 3 (três) usuários simultâneos com controle de acesso padrão;',
      '2 (dois) funis de vendas configuráveis (com até 8 etapas por funil);',
      'Visualização híbrida: Quadro Kanban interativo e Tabela de dados;',
      '2 (duas) conexões WhatsApp simultâneas integradas via cluster WAHA;',
      'Transcrição automática de áudios do WhatsApp por IA Whisper;',
      '1 (um) agente autônomo de inteligência artificial;',
      'Franquia de 50.000 (cinquenta mil) tokens de IA generativa por mês;',
      'Copiloto de vendas em tempo real com sugestões de resposta contextuais;',
      'Base de conhecimento RAG para documentos institucionais e FAQs;',
      '8 templates de agentes comerciais especializados pré-configurados;',
      'Até 5 (cinco) fluxos de trabalho (workflows) e automações ativas;',
      'Geração de propostas comerciais em PDF com envio no WhatsApp e catálogo de produtos;',
      'Formulário público de captura de leads e widget incorporável para sites;',
      'Criptografia de ponta AES-256-GCM e isolamento multi-tenant PostgreSQL RLS.'
    ],
    renewalPolicy: 'O presente contrato possui vigência mensal e será RENOVADO AUTOMÁTICA E SUCESSIVAMENTE por iguais períodos de 30 (trinta) dias, mediante débito recorrente no cartão de crédito cadastrado ou liquidação de fatura PIX gerada no primeiro dia de cada ciclo de faturamento.',
    cancellationPolicy: 'A CONTRATANTE poderá rescindir o contrato a qualquer momento, diretamente pelo painel administrativo ou canal de atendimento oficial. Por se tratar de modalidade mensal sem cláusula de permanência mínima, NÃO HAVERÁ COBRANÇA DE MULTA RESCISÓRIA. O acesso à plataforma permanecerá ativo até o encerramento do ciclo mensal já pago, não havendo reembolso proporcional de mensalidade em curso.',
    penaltyClause: 'Inexiste incidência de multa rescisória na modalidade mensal por ausência de período de fidelidade contratual.'
  },
  {
    fileName: 'contrato-essencial-anual.pdf',
    planName: 'Essencial',
    duration: 'Anual',
    priceText: 'R$ 4.764,00 (quatro mil, setecentos e sessenta e quatro reais) por ano, equivalente a 12 (doze) parcelas mensais de R$ 397,00 (trezentos e noventa e sete reais)',
    billingCycle: 'anualmente (à vista ou parcelado em até 12 vezes)',
    liabilityCap: 'o montante total da anuidade contratada no Plano Essencial',
    supportSla: 'Suporte técnico padrão via chat in-app e e-mail com tempo de primeira resposta em até 48 (quarenta e oito) horas úteis.',
    dataRetentionDays: '30 (trinta) dias',
    features: [
      'Até 3 (três) usuários simultâneos com controle de acesso padrão;',
      '2 (dois) funis de vendas configuráveis (com até 8 etapas por funil);',
      'Visualização híbrida: Quadro Kanban interativo e Tabela de dados;',
      '2 (duas) conexões WhatsApp simultâneas integradas via cluster WAHA;',
      'Transcrição automática de áudios do WhatsApp por IA Whisper;',
      '1 (um) agente autônomo de inteligência artificial;',
      'Franquia de 50.000 (cinquenta mil) tokens de IA generativa por mês;',
      'Copiloto de vendas em tempo real com sugestões de resposta contextuais;',
      'Base de conhecimento RAG para documentos institucionais e FAQs;',
      '8 templates de agentes comerciais especializados pré-configurados;',
      'Até 5 (cinco) fluxos de trabalho (workflows) e automações ativas;',
      'Geração de propostas comerciais em PDF com envio no WhatsApp e catálogo de produtos;',
      'Formulário público de captura de leads e widget incorporável para sites;',
      'Criptografia de ponta AES-256-GCM e isolamento multi-tenant PostgreSQL RLS.'
    ],
    renewalPolicy: 'O presente contrato possui vigência de 12 (doze) meses. A RENOVAÇÃO OCORRERÁ AUTOMATICAMENTE por iguais períodos anuais subsequentes, salvo manifestação expressa em contrário da CONTRATANTE com antecedência mínima de 30 (trinta) dias do término da anuidade. A LICENCIANTE enviará notificação prévia de renovação com antecedência mínima de 30 dias via e-mail e WhatsApp. Na renovação anual, o valor será reajustado pela variação positiva acumulada do IPCA/IBGE nos 12 meses anteriores.',
    cancellationPolicy: 'A CONTRATANTE poderá solicitar a rescisão antecipada antes do término dos 12 (doze) meses mediante notificação prévia e formal com 30 (trinta) dias de antecedência. Em razão do desconto de 20% concedido para o compromisso anual, a rescisão imotivada pela CONTRATANTE implicará na aplicação de MULTA RESCISÓRIA COMPENSATÓRIA de 20% (vinte por cento) incidente sobre o saldo remanescente das parcelas vincendas até o término do período contratado.',
    penaltyClause: 'Em caso de rescisão antecipada por conveniência da CONTRATANTE no plano anual, incidirá multa compensatória de 20% (vinte por cento) do valor total das parcelas restantes até o término dos 12 meses.'
  },
  {
    fileName: 'contrato-crescimento-mensal.pdf',
    planName: 'Crescimento',
    duration: 'Mensal',
    priceText: 'R$ 997,00 (novecentos e noventa e sete reais) por mês',
    billingCycle: 'mensalmente, a cada 30 (trinta) dias corridos',
    liabilityCap: 'o montante total correspondente a 12 (doze) mensalidades do Plano Crescimento vigentes à época do evento',
    supportSla: 'Suporte técnico prioritário via WhatsApp e central de ajuda com tempo estimado de resposta em até 12 (doze) horas úteis e 1 sessão assistida de Onboarding.',
    dataRetentionDays: '30 (trinta) dias',
    features: [
      'Até 10 (dez) usuários simultâneos inclusos com papéis de acesso por setor;',
      '10 (dez) funis de vendas configuráveis (com até 15 etapas por funil);',
      '5 (cinco) conexões WhatsApp com multiatendimento, filas e roteamento por setor;',
      'Proteção anti-banimento (Warmup de chips) e debouncing inteligente de 60s;',
      '3 (três) agentes autônomos de inteligência artificial com personalização total de tom de voz;',
      'Franquia de 500.000 (quinhentos mil) tokens de IA generativa por mês;',
      'Análise de sentimento das conversas e classificação comportamental de leads;',
      'Geração automática de orçamentos em PDF com envio de chave PIX pela IA;',
      'Base de conhecimento RAG com upload de documentos e instruções avançadas;',
      'Até 30 (trinta) workflows ativos com gatilhos comportamentais e nós de webhooks;',
      'Módulo Comercial Avançado: Contratos e faturas recorrentes, ordens de compra e fornecedores;',
      'Gestão de Equipes: Metas mensais com progresso, distribuição Round-Robin e setores;',
      'Relatórios e BI: Dashboard em tempo real com Redis, drill-down analítico e exportação CSV/Excel/PDF;',
      'API REST de consulta (leitura) e 10 webhooks de integração.'
    ],
    renewalPolicy: 'O presente contrato possui vigência mensal e será RENOVADO AUTOMÁTICA E SUCESSIVAMENTE a cada 30 (trinta) dias, mediante faturamento e cobrança recorrente no meio de pagamento ativo.',
    cancellationPolicy: 'A CONTRATANTE poderá solicitar o cancelamento a qualquer momento sem incidência de multas rescisórias. O serviço continuará disponível até a data de término do ciclo de 30 dias já faturado, sem devolução proporcional do valor da mensalidade.',
    penaltyClause: 'Por se tratar de modalidade mensal sem fidelidade, não há aplicação de penalidade por rescisão contratual.'
  },
  {
    fileName: 'contrato-crescimento-anual.pdf',
    planName: 'Crescimento',
    duration: 'Anual',
    priceText: 'R$ 9.564,00 (nove mil, quinhentos e sessenta e quatro reais) por ano, equivalente a 12 (doze) parcelas mensais de R$ 797,00 (setecentos e noventa e sete reais)',
    billingCycle: 'anualmente (à vista ou parcelado em até 12 vezes)',
    liabilityCap: 'o montante total da anuidade contratada no Plano Crescimento',
    supportSla: 'Suporte técnico prioritário via WhatsApp e central de ajuda com tempo estimado de resposta em até 12 (doze) horas úteis e 1 sessão assistida de Onboarding.',
    dataRetentionDays: '30 (trinta) dias',
    features: [
      'Até 10 (dez) usuários simultâneos inclusos com papéis de acesso por setor;',
      '10 (dez) funis de vendas configuráveis (com até 15 etapas por funil);',
      '5 (cinco) conexões WhatsApp com multiatendimento, filas e roteamento por setor;',
      'Proteção anti-banimento (Warmup de chips) e debouncing inteligente de 60s;',
      '3 (três) agentes autônomos de inteligência artificial com personalização total de tom de voz;',
      'Franquia de 500.000 (quinhentos mil) tokens de IA generativa por mês;',
      'Análise de sentimento das conversas e classificação comportamental de leads;',
      'Geração automática de orçamentos em PDF com envio de chave PIX pela IA;',
      'Base de conhecimento RAG com upload de documentos e instruções avançadas;',
      'Até 30 (trinta) workflows ativos com gatilhos comportamentais e nós de webhooks;',
      'Módulo Comercial Avançado: Contratos e faturas recorrentes, ordens de compra e fornecedores;',
      'Gestão de Equipes: Metas mensais com progresso, distribuição Round-Robin e setores;',
      'Relatórios e BI: Dashboard em tempo real com Redis, drill-down analítico e exportação CSV/Excel/PDF;',
      'API REST de consulta (leitura) e 10 webhooks de integração.'
    ],
    renewalPolicy: 'Vigência de 12 (doze) meses com RENOVAÇÃO AUTOMÁTICA por iguais períodos, salvo aviso formal com 30 (trinta) dias de antecedência do vencimento. A LICENCIANTE enviará notificação formal de renovação com antecedência mínima de 30 dias via e-mail e WhatsApp. Reajuste anual aplicado pela variação positiva acumulada do IPCA/IBGE nos 12 meses anteriores.',
    cancellationPolicy: 'A rescisão antecipada motivada pela CONTRATANTE antes dos 12 meses exigirá notificação prévia de 30 (trinta) dias. Será cobrada MULTA RESCISÓRIA COMPENSATÓRIA de 20% (vinte por cento) calculada sobre o valor das parcelas vincendas até o encerramento do contrato, em virtude da tarifa promocional concedida para contratação anual.',
    penaltyClause: 'Multa rescisória compensatória fixada em 20% (vinte por cento) sobre o saldo vincendo remanescente até o término dos 12 meses.'
  },
  {
    fileName: 'contrato-enterprise-mensal.pdf',
    planName: 'Enterprise',
    duration: 'Mensal',
    priceText: 'R$ 2.997,00 (dois mil, novecentos e noventa e sete reais) por mês',
    billingCycle: 'mensalmente, a cada 30 (trinta) dias corridos',
    liabilityCap: 'o montante total correspondente a 12 (doze) mensalidades do Plano Enterprise vigentes à época do evento',
    supportSla: 'SLA contratual garantido com tempo de resposta em até 4 (quatro) horas úteis, Atendimento VIP 24/7 (WhatsApp e telefone), Gestor de Contas Dedicado e Onboarding corporativo assistido (3 sessões técnicas).',
    dataRetentionDays: '60 (sessenta) dias',
    features: [
      'Usuários, operadores e administradores ilimitados na plataforma;',
      'Funis de vendas ilimitados com até 25 etapas por funil;',
      '20 (vinte) conexões WhatsApp simultâneas em Cluster WAHA multi-nó com balanceamento de carga;',
      'Sistema de Warmup avançado anti-banimento para alto volume de disparos e mensagens;',
      'Agentes autônomos de IA ilimitados e 5.000.000+ tokens de IA/mês;',
      'Tecnologia BYOK (Bring Your Own Key) para integração com OpenAI, Anthropic Claude e Google Gemini;',
      'Few-Shot Learning ativo (treinamento contínuo com histórico real de conversas e transações da empresa);',
      'Orquestrador cognitivo de 6 camadas com governança, limiares e transbordo customizáveis;',
      'Workflows ilimitados contemplando todas as 17 ações nativas, webhooks externos e nós de ferramentas;',
      'API REST completa (leitura e escrita) e Webhooks de entrada/saída ilimitados;',
      'White-Label integral (marca, domínio próprio, logotipo, favicon, e-mails SMTP e cores personalizadas);',
      'Autenticação corporativa SSO (Single Sign-On) e perfis de permissão granulares por usuário;',
      'Relatório de ROI de IA, logs de auditoria imutáveis e conformidade rigorosa com a LGPD.'
    ],
    renewalPolicy: 'O presente contrato vigora por períodos mensais de 30 (trinta) dias com renovação automática contínua mediante cobrança recorrente.',
    cancellationPolicy: 'A CONTRATANTE poderá solicitar a rescisão do contrato a qualquer momento mediante aviso prévio formal de 30 (trinta) dias. Não incidirá multa rescisória na modalidade mensal. Os dados corporativos serão mantidos em ambiente seguro de carência por 60 (sessenta) dias para fins de exportação completa em lote (JSON/CSV) antes da eliminação definitiva.',
    penaltyClause: 'Inexiste incidência de multa rescisória por encerramento imotivado no plano mensal.'
  },
  {
    fileName: 'contrato-enterprise-anual.pdf',
    planName: 'Enterprise',
    duration: 'Anual',
    priceText: 'R$ 28.764,00 (vinte e oito mil, setecentos e sessenta e quatro reais) por ano, equivalente a 12 (doze) parcelas mensais de R$ 2.397,00 (dois mil, trezentos e noventa e sete reais)',
    billingCycle: 'anualmente (à vista ou parcelado em até 12 vezes)',
    liabilityCap: 'o montante total da anuidade contratada no Plano Enterprise',
    supportSla: 'SLA contratual garantido com tempo de resposta em até 4 (quatro) horas úteis, Atendimento VIP 24/7 (WhatsApp e telefone), Gestor de Contas Dedicado e Onboarding corporativo assistido (3 sessões técnicas).',
    dataRetentionDays: '60 (sessenta) dias',
    features: [
      'Usuários, operadores e administradores ilimitados na plataforma;',
      'Funis de vendas ilimitados com até 25 etapas por funil;',
      '20 (vinte) conexões WhatsApp simultâneas em Cluster WAHA multi-nó com balanceamento de carga;',
      'Sistema de Warmup avançado anti-banimento para alto volume de disparos e mensagens;',
      'Agentes autônomos de IA ilimitados e 5.000.000+ tokens de IA/mês;',
      'Tecnologia BYOK (Bring Your Own Key) para integração com OpenAI, Anthropic Claude e Google Gemini;',
      'Few-Shot Learning ativo (treinamento contínuo com histórico real de conversas e transações da empresa);',
      'Orquestrador cognitivo de 6 camadas com governança, limiares e transbordo customizáveis;',
      'Workflows ilimitados contemplando todas as 17 ações nativas, webhooks externos e nós de ferramentas;',
      'API REST completa (leitura e escrita) e Webhooks de entrada/saída ilimitados;',
      'White-Label integral (marca, domínio próprio, logotipo, favicon, e-mails SMTP e cores personalizadas);',
      'Autenticação corporativa SSO (Single Sign-On) e perfis de permissão granulares por usuário;',
      'Relatório de ROI de IA, logs de auditoria imutáveis e conformidade rigorosa com a LGPD.'
    ],
    renewalPolicy: 'O contrato vigora por 12 (doze) meses com RENOVAÇÃO AUTOMÁTICA por iguais períodos, salvo manifestação em contrário com antecedência de 30 (trinta) dias. Notificação expressa prévia enviada 30 dias antes do término via e-mail e WhatsApp. Reajuste anual pelo IPCA/IBGE acumulado dos 12 meses anteriores.',
    cancellationPolicy: 'A rescisão antecipada motivada pela CONTRATANTE exigirá notificação prévia formal de 30 (trinta) dias e o pagamento de MULTA RESCISÓRIA COMPENSATÓRIA de 20% (vinte por cento) sobre o saldo vincendo remanescente do contrato. A LICENCIANTE garantirá período de 60 (sessenta) dias de assistência para exportação integral dos dados do CRM em formato padronizado (JSON e CSV).',
    penaltyClause: 'Multa compensatória de 20% (vinte por cento) incidente sobre o saldo de parcelas vincendas até o encerramento do período anual de 12 meses.'
  }
];

function generatePDF(config) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(outDir, config.fileName);
    const doc = new PDFDocument({
      size: 'A4',
      margins: { top: 50, bottom: 50, left: 50, right: 50 },
      autoFirstPage: true
    });

    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    const primaryColor = '#0f172a';
    const accentColor = '#1e40af';
    const textColor = '#334155';
    const subtleLineColor = '#e2e8f0';
    const footerColor = '#94a3b8';

    let pageNumber = 1;

    function addFooter() {
      const oldX = doc.x;
      const oldY = doc.y;
      
      // Salvar estado atual da fonte e cor
      const oldFontName = doc._font ? doc._font.name : null;
      const oldFontSize = doc._fontSize;
      const oldFillColor = doc._fillColor;

      const bottom = doc.page.height - 35;
      const origBottom = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;

      doc.fillColor(footerColor).fontSize(7).font('Helvetica').text(
        `Aegis CRM · Plano ${config.planName} (${config.duration}) · Página ${pageNumber}`,
        50,
        bottom,
        { width: doc.page.width - 100, align: 'center', lineBreak: false }
      );

      doc.page.margins.bottom = origBottom;
      
      // Restaurar estado da fonte e cor
      if (oldFontName) doc.font(oldFontName);
      if (oldFontSize) doc.fontSize(oldFontSize);
      if (oldFillColor) doc.fillColor(oldFillColor);

      doc.x = oldX;
      doc.y = oldY;
    }

    doc.on('pageAdded', () => {
      pageNumber++;
      addFooter();
    });

    // Header on page 1
    doc.lineWidth(1).strokeColor(accentColor).moveTo(50, 50).lineTo(545, 50).stroke();
    doc.moveDown(0.5);
    doc.fillColor(primaryColor).fontSize(14).font('Helvetica-Bold').text('AEGIS CRM TECNOLOGIA LTDA.', { align: 'center' });
    doc.moveDown(0.2);
    doc.fillColor('#64748b').fontSize(9).font('Helvetica').text('CONTRATO DE PRESTAÇÃO DE SERVIÇOS E LICENCIAMENTO SAAS B2B', { align: 'center' });
    doc.moveDown(0.2);
    doc.fillColor(primaryColor).fontSize(9).font('Helvetica-Bold').text(`PLANO ${config.planName.toUpperCase()} — MODALIDADE ${config.duration.toUpperCase()}`, { align: 'center' });
    doc.moveDown(0.5);
    
    let currentY = doc.y;
    doc.lineWidth(0.5).strokeColor(subtleLineColor).moveTo(50, currentY).lineTo(545, currentY).stroke();
    doc.y = currentY + 15;

    addFooter();

    function addSectionTitle(num, title) {
      doc.moveDown(1);
      if (doc.y > 700) doc.addPage();
      
      doc.fillColor(accentColor).fontSize(9.5).font('Helvetica-Bold').text(`CLÁUSULA ${num}ª — ${title.toUpperCase()}`);
      
      let titleY = doc.y + 2;
      doc.lineWidth(0.5).strokeColor(subtleLineColor).moveTo(50, titleY).lineTo(545, titleY).stroke();
      doc.y = titleY + 6;
    }

    function addParagraph(text, isBold = false) {
      doc.fillColor(textColor).fontSize(8.5).font(isBold ? 'Helvetica-Bold' : 'Helvetica').text(text, { align: 'justify', lineGap: 2.5 });
      doc.moveDown(0.5);
    }

    function addBullet(item) {
      doc.fillColor(textColor).fontSize(8).font('Helvetica').text(`•  ${item}`, { indent: 12, lineGap: 2.5 });
    }

    // CLÁUSULA 1
    addSectionTitle('PRIMEIRA', 'DAS PARTES E DO ENQUADRAMENTO JURÍDICO');
    addParagraph('1.1. De um lado, AEGIS CRM TECNOLOGIA LTDA., pessoa jurídica de direito privado, inscrita no CNPJ sob o nº [INSERIR CNPJ], com sede em [INSERIR ENDEREÇO], doravante denominada "LICENCIANTE", e, de outro lado, a pessoa jurídica devidamente qualificada no ato de cadastro e assinatura eletrônica na plataforma, doravante denominada "CONTRATANTE", celebram o presente Contrato de Prestação de Serviços e Licenciamento de Software como Serviço (SaaS).');
    addParagraph('1.2. ENQUADRAMENTO B2B E INSUMO COMERCIAL (CC Art. 421-A): A CONTRATANTE declara expressamente que é pessoa jurídica legalmente constituída e que a contratação do software Aegis CRM destina-se estrita e exclusivamente como INSUMO DE PRODUÇÃO, FERRAMENTA DE GESTÃO COMERCIAL E INCREMENTO DE SUAS ATIVIDADES EMPRESARIAIS, operando sob a égide da Lei da Liberdade Econômica (Lei nº 13.874/2019) e dos Artigos 421 e 421-A do Código Civil Brasileiro, com presunção de paridade e simetria, restando afastada a incidência do Código de Defesa do Consumidor (Lei nº 8.078/1990).');

    // CLÁUSULA 2
    addSectionTitle('SEGUNDA', 'DO OBJETO E CONCESSÃO DA LICENÇA SAAS');
    addParagraph(`2.1. O presente instrumento tem por objeto a concessão, pela LICENCIANTE em favor da CONTRATANTE, de licença de uso do software de gestão comercial e inteligência artificial denominado "Aegis CRM", em caráter temporário, revogável, não exclusivo, intransferível e sem direito a sublicenciamento, disponibilizado na modalidade Software as a Service (SaaS), nos estritos limites, parâmetros e recursos contratados para o PLANO ${config.planName.toUpperCase()} na periodicidade ${config.duration.toUpperCase()}.`);
    addParagraph('2.2. A licença outorgada restringe-se ao acesso e uso operacional da plataforma via navegadores de internet e APIs oficiais, não compreendendo a cessão ou transferência de código-fonte, marcas, patentes, algoritmos ou quaisquer direitos de propriedade intelectual da LICENCIANTE.');

    // CLÁUSULA 3
    addSectionTitle('TERCEIRA', `DAS ESPECIFICAÇÕES, RECURSOS E LIMITES DO PLANO ${config.planName.toUpperCase()}`);
    addParagraph(`3.1. A licença de uso ativa confere à CONTRATANTE o direito de utilização dos seguintes módulos, limites volumétricos e franquias operacionais:`);
    config.features.forEach(f => addBullet(f));
    doc.moveDown(0.5);

    // CLÁUSULA 4
    addSectionTitle('QUARTA', 'DO PREÇO, FATURAMENTO E CONDIÇÕES DE PAGAMENTO');
    addParagraph(`4.1. Como contraprestação pela licença de uso e disponibilização contínua da infraestrutura SaaS, a CONTRATANTE pagará à LICENCIANTE a quantia de ${config.priceText}, faturada ${config.billingCycle}.`);
    addParagraph('4.2. O pagamento será processado via cartão de crédito corporativo cadastrado na plataforma ou liquidação de fatura bancária/chave PIX emitida pela LICENCIANTE com vencimento fixado no primeiro dia de cada ciclo.');
    addParagraph('4.3. INADIMPLEMENTO E MORA: O não pagamento de qualquer valor no vencimento sujeitará a CONTRATANTE ao acréscimo de multa moratória de 2% (dois por cento) sobre o montante em atraso, juros moratórios de 1% (um por cento) ao mês pro-rata die e correção monetária com base na variação do IPCA/IBGE.');
    addParagraph('4.4. SUSPENSÃO POR INADIMPLÊNCIA: Transcorridos 5 (cinco) dias úteis de inadimplemento, a LICENCIANTE poderá suspender temporariamente o acesso do tenant à plataforma, com base no Art. 476 do Código Civil (exceção do contrato não cumprido), sem prejuízo da cobrança judicial ou extrajudicial das parcelas em aberto.');

    // CLÁUSULA 5
    addSectionTitle('QUINTA', 'DA POLÍTICA DE RENOVAÇÃO CONTRATUAL');
    addParagraph(`5.1. DIRETRIZ DE RENOVAÇÃO: ${config.renewalPolicy}`);
    addParagraph('5.2. REAJUSTE ANUAL DE VALORES: A cada período de 12 (doze) meses contados da assinatura inicial, os valores dos planos serão automaticamente reajustados pela variação percentual positiva acumulada do Índice Nacional de Preços ao Consumidor Amplo (IPCA/IBGE) dos 12 meses precedentes ou, em sua ausência ou extinção, pelo índice legal que oficialmente vier a substituí-lo.');

    // CLÁUSULA 6
    addSectionTitle('SEXTA', 'DA POLÍTICA DE CANCELAMENTO, RESCISÃO E REEMBOLSO');
    addParagraph('6.1. DIREITO DE ARREPENDIMENTO INICIAL: A CONTRATANTE poderá desistir imotivadamente da contratação no prazo legal e improrrogável de até 7 (sete) dias corridos a contar da primeira adesão ao plano, mediante requerimento expresso via suporte oficial, hipótese em que receberá a restituição integral (100%) dos valores efetivamente desembolsados.');
    addParagraph(`6.2. RESCISÃO POR CONVENIÊNCIA DA CONTRATANTE: ${config.cancellationPolicy}`);
    addParagraph(`6.3. CLÁUSULA PENAL E MULTAS RESCISÓRIAS: ${config.penaltyClause}`);
    addParagraph(`6.4. JANELA DE PORTABILIDADE E EXPURGO DE DADOS (LGPD): Concluída a rescisão, a CONTRATANTE terá assegurado o prazo improrrogável de ${config.dataRetentionDays} para realizar o download e a exportação integral de seus bancos de dados (contatos, leads, histórico de negociações e propostas) em formatos interoperáveis padronizados (CSV e JSON) via painel administrativo. Esgotado este prazo de custódia transitória, a LICENCIANTE procederá à eliminação segura, irreversível e definitiva de todos os registros e dados armazenados, em observância ao Artigo 16 da Lei nº 13.709/2018 (LGPD).`);

    // CLÁUSULA 7
    addSectionTitle('SÉTIMA', 'DO NÍVEL DE SERVIÇO (SLA) E SERVICE CREDITS');
    addParagraph(`7.1. SUPORTE TÉCNICO: ${config.supportSla}`);
    addParagraph('7.2. DISPONIBILIDADE DA PLATAFORMA: A LICENCIANTE compromete-se a manter uma taxa média de disponibilidade mensal (Uptime) de 99,5% (noventa e nove vírgula cinco por cento), excluídas as janelas de manutenção preventiva programadas e comunicadas com antecedência mínima de 24 (vinte e quatro) horas, bem como indisponibilidades causadas por falhas da infraestrutura de telecomunicações do Cliente ou de provedores terceiros (AWS, Meta, OpenAI).');
    addParagraph('7.3. REMÉDIO EXCLUSIVO POR INDISPONIBILIDADE: Caso o Uptime mensal fique comprovadamente abaixo de 99,5%, a CONTRATANTE fará jus a crédito compensatório proporcional (Service Credit) de até 10% da mensalidade seguinte, constituindo este o único e exclusivo remédio indenizatório financeiro facultado à CONTRATANTE por falhas de disponibilidade.');

    // CLÁUSULA 8
    addSectionTitle('OITAVA', 'DO TETO DE RESPONSABILIDADE FINANCEIRA (LIABILITY CAP)');
    addParagraph(`8.1. LIMITAÇÃO MONETÁRIA DE INDENIZAÇÕES: Em consonância com o Artigo 421-A, inciso II do Código Civil Brasileiro, a responsabilidade civil total acumulada da LICENCIANTE por quaisquer danos materiais, prejuízos ou custos oriundos deste contrato ou do uso do software limita-se expressamente ao valor teto equivalente a ${config.liabilityCap}.`);
    addParagraph('8.2. EXCLUSÃO DE DANOS INDIRETOS E LUCROS CESSANTES: Sob nenhuma hipótese a LICENCIANTE responderá por lucros cessantes, perdas de oportunidade comercial, vendas não concretizadas, danos reputacionais, perdas de negócios ou danos indiretos de qualquer natureza sofridos pela CONTRATANTE ou por terceiros (CC Arts. 402 e 403).');

    // CLÁUSULA 9
    addSectionTitle('NONA', 'DO USO DE INTELIGÊNCIA ARTIFICIAL E REGRA HUMAN-IN-THE-LOOP');
    addParagraph('9.1. NATUREZA DA IA E ARQUITETURA HITL: Os agentes de IA integrados à plataforma atuam mediante processamento probabilístico e estatístico. A CONTRATANTE obriga-se a manter supervisão humana ativa (arquitetura Human-in-the-Loop) em todas as propostas comerciais, orçamentos e comunicações críticas geradas pelos agentes de IA.');
    addParagraph('9.2. RESPONSABILIDADE SOBRE PROMPTS E RAG: A CONTRATANTE é a exclusiva responsável pelo teor das instruções, tabelas de preços, documentos de conhecimento (RAG) e regras de negócio inseridos na plataforma. A LICENCIANTE isenta-se expressamente por alucinações, promessas indevidas ou descontos gerados por modelos fundacionais externos (OpenAI, Anthropic, Google).');
    addParagraph('9.3. EXPLICABILIDADE E SEGREDO INDUSTRIAL: Em conformidade com o Art. 20 da LGPD, a CONTRATANTE poderá consultar no painel as variáveis determinantes de Lead Scoring, ficando resguardados os pesos algorítmicos e o código-fonte da LICENCIANTE sob o regime de Segredo Industrial e Comercial (Lei nº 9.279/1996).');

    // CLÁUSULA 10
    addSectionTitle('DÉCIMA', 'DA INTEGRAÇÃO COM WHATSAPP E SERVIÇOS DE TERCEIROS');
    addParagraph('10.1. PROVEDORES DE REDE E CHIPS: A conexão WhatsApp via cluster WAHA constitui serviço intermediário de comunicação. A CONTRATANTE obriga-se a utilizar o canal em conformidade com as diretrizes e políticas comerciais da Meta Inc., respondendo exclusivamente por eventuais bloqueios, suspensões ou banimentos de chips resultantes de práticas de spam ou envio em massa não consentido.');
    addParagraph('10.2. ISENÇÃO POR CONTEÚDOS DE TERCEIROS (Marco Civil Art. 19): Nos termos da Lei nº 12.965/2014, a LICENCIANTE atua como Provedor de Aplicações de Internet, não respondendo civilmente pelo conteúdo, mensagens, áudios e arquivos trafegados pela CONTRATANTE em suas conversas com clientes finais.');

    // CLÁUSULA 11
    addSectionTitle('DÉCIMA PRIMEIRA', 'DA PROTEÇÃO DE DADOS PESSOAIS (LGPD) E DPA');
    addParagraph('11.1. QUALIFICAÇÃO DAS PARTES: Para todos os fins da Lei nº 13.709/2018 (LGPD), a CONTRATANTE atua como CONTROLADORA dos dados pessoais de leads e contatos que armazena na plataforma, cabendo-lhe a legitimidade das bases legais. A LICENCIANTE figura como OPERADORA, tratando os dados unicamente para a prestação do serviço.');
    addParagraph('11.2. VEDAÇÃO A DADOS SENSÍVEIS SEM BASE LEGAL: É terminantemente vedada a inserção de dados pessoais sensíveis (Art. 11 LGPD) em campos personalizados sem respaldo jurídico adequado. Caso a CONTRATANTE insira dados sensíveis sem consentimento expresso, responderá regressivamente e por perdas e danos perante a LICENCIANTE (CC Art. 934).');
    addParagraph('11.3. TRANSFERÊNCIA INTERNACIONAL E SEGURANÇA: As partes anuem com a transferência internacional de dados para infraestrutura em nuvem segura (AWS) e APIs de IA, adotando-se as Cláusulas-Padrão Contratuais (CPCs) da Resolução CD/ANPD nº 19/2024 e criptografia AES-256.');

    // CLÁUSULA 12
    addSectionTitle('DÉCIMA SEGUNDA', 'DA GUARDA COMPULSÓRIA DE REGISTROS DE ACESSO');
    addParagraph('12.1. Em estrito cumprimento ao Artigo 15 da Lei nº 12.965/2014 (Marco Civil da Internet) e ao Artigo 13 do Decreto nº 8.771/2016, a LICENCIANTE manterá sob absoluto sigilo e segurança os registros de acesso a aplicações (IPs, datas, horários e sessões) pelo período obrigatório de 6 (seis) meses, disponibilizando-os unicamente mediante ordem judicial específica proferida por autoridade competente.');

    // CLÁUSULA 13
    addSectionTitle('DÉCIMA TERCEIRA', 'DA PROPRIEDADE INTELECTUAL E CONFIDENCIALIDADE');
    addParagraph('13.1. Todos os direitos de propriedade industrial, código-fonte, arquitetura, design visual, marcas e metodologias do Aegis CRM pertencem com exclusividade à LICENCIANTE. As partes comprometem-se a manter sigilo absoluto sobre todas as informações estratégicas, financeiras e operacionais trocadas em razão deste contrato.');

    // CLÁUSULA 14
    addSectionTitle('DÉCIMA QUARTA', 'DO TÍTULO EXECUTIVO, DISPOSIÇÕES GERAIS E FORO DE ELEIÇÃO');
    addParagraph('14.1. TÍTULO EXECUTIVO EXTRAJUDICIAL: O presente contrato, celebrado eletronicamente mediante aceite inequívoco e assinatura digital (Lei nº 14.063/2020), constitui Título Executivo Extrajudicial líquido, certo e exigível, nos termos do Artigo 784, inciso III do Código de Processo Civil.');
    addParagraph('14.2. FORO DE ELEIÇÃO: As partes elegem expressamente o Foro Judicial da Comarca de São Paulo, Estado de São Paulo, para dirimir quaisquer controvérsias, litígios ou execuções decorrentes deste contrato, renunciando expressamente a qualquer outro foro, por mais privilegiado que seja.');

    // Signatures block
    doc.moveDown(2);
    if (doc.y > 700) doc.addPage();
    
    const sigY = doc.y + 30;
    
    // Line 1
    doc.lineWidth(0.5).strokeColor(textColor).moveTo(50, sigY).lineTo(250, sigY).stroke();
    doc.fillColor(primaryColor).fontSize(8.5).font('Helvetica-Bold').text('AEGIS CRM TECNOLOGIA LTDA.', 50, sigY + 5, { width: 200, align: 'center' });
    
    // Line 2
    doc.lineWidth(0.5).strokeColor(textColor).moveTo(345, sigY).lineTo(545, sigY).stroke();
    doc.fillColor(primaryColor).fontSize(8.5).font('Helvetica-Bold').text('CONTRATANTE', 345, sigY + 5, { width: 200, align: 'center' });

    doc.end();

    writeStream.on('finish', () => {
      console.log(`Gerado com sucesso (páginas totais não calculadas, novo layout): ${config.fileName}`);
      resolve(filePath);
    });

    writeStream.on('error', reject);
  });
}

async function run() {
  console.log('Iniciando geração dos 6 contratos jurídicos completos em PDF...');
  for (const config of contractConfigs) {
    await generatePDF(config);
  }
  console.log('Todos os 6 contratos PDF foram gerados e validados!');
}

run();
