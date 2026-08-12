# Original User Request

## Initial Request — 2026-08-11T14:56:09-03:00

Pesquisa jurídica aprofundada na legislação brasileira e elaboração de contratos de assinatura SaaS para o Aegis CRM — um CRM SaaS B2B para gestão de vendas em PMEs brasileiras. O projeto exige dois conjuntos de contratos parametrizados (B2B puro e com proteções CDC) para três planos (Essencial, Crescimento, Enterprise) nas modalidades mensal e anual, com entrega em Markdown e HTML estilizado.

Working directory: c:\Users\victor.aragao\Downloads\AegisLandingPage
Integrity mode: development

## Contexto do Produto (Referência Obrigatória)

O **Aegis CRM** é um software SaaS B2B para gestão de vendas com as seguintes características:

| Plano | Preço Mensal | Preço Anual | Equiv. Mensal (Anual) | Desconto |
|-------|-------------|-------------|----------------------|----------|
| Essencial | R$ 497/mês | R$ 4.970/ano | R$ 414/mês | 16% |
| Crescimento | R$ 997/mês | R$ 9.970/ano | R$ 830/mês | 16% |
| Enterprise | R$ 2.997/mês | R$ 29.970/ano | R$ 2.497/mês | 16% |

- **Trial gratuito**: 7 dias em todos os planos
- **Cancelamento**: Sem fidelidade ("Cancele quando quiser")
- **Funcionalidades com IA**: Agentes autônomos, copiloto de vendas, transcrição de áudio, análise de sentimento, RAG
- **Integrações**: WhatsApp (2-20 conexões conforme plano), API REST, Webhooks
- **Termos existentes**: O arquivo `termos.html` contém um contrato B2B baseado no CC Art. 421-A com SLA 99.5%, liability cap 12 meses, e supervisão human-in-the-loop. Usar como referência e base — preservar o que já está bom e complementar/corrigir conforme a pesquisa.
- **Privacidade existente**: O arquivo `privacidade.html` contém política de privacidade e LGPD.
- **Idioma**: Todos os contratos devem ser redigidos em Português Brasileiro formal-jurídico.
- **Público-alvo**: PMEs brasileiras (gestores comerciais)

## Requirements

### R1. Pesquisa Jurídica Aprofundada

Realizar pesquisa abrangente nas seguintes legislações brasileiras e quaisquer outras que a pesquisa identifique como relevantes para proteger a empresa legalmente:

- **Lei nº 8.078/1990** — Código de Defesa do Consumidor (CDC)
- **Lei nº 10.406/2002** — Código Civil, com ênfase nos Art. 421-A (contratos B2B, paridade contratual) e artigos sobre contratos de prestação de serviço
- **Lei nº 12.965/2014** — Marco Civil da Internet (responsabilidade de provedores de aplicação, guarda de registros, neutralidade)
- **Lei nº 13.709/2018** — LGPD (tratamento de dados pessoais, bases legais, DPO, incidentes)
- **Decreto nº 7.962/2013** — Regulamentação do comércio eletrônico (informações claras, atendimento facilitado, direito de arrependimento)
- **PL 3.514/2015** e legislação sobre comércio eletrônico em tramitação
- **Jurisprudência relevante** sobre classificação de SaaS/CRM como produto digital vs. serviço, e aplicabilidade do CDC a relações B2B quando há hipossuficiência

A pesquisa deve produzir um **relatório jurídico estruturado** (arquivo Markdown) documentando cada legislação, os artigos específicos aplicáveis ao Aegis CRM, e suas implicações práticas para a redação dos contratos.

### R2. Análise de Enquadramento Jurídico: Produto Digital vs. Serviço B2B

Produzir uma **análise formal** (arquivo Markdown separado) que investigue e conclua:

1. Se um CRM SaaS como o Aegis pode ser classificado como "produto digital" sob a legislação brasileira
2. Em quais cenários o CDC se aplica mesmo em relações B2B (ex: MEI, microempresa como destinatário final, teoria finalista mitigada)
3. Quais são as diferenças práticas nas obrigações contratuais entre os regimes B2B puro (CC Art. 421-A) e consumerista (CDC)
4. Recomendações práticas sobre como o Aegis CRM deve se posicionar contratualmente para máxima proteção legal

A análise deve citar artigos de lei, jurisprudência e doutrina sempre que possível.

### R3. Contrato Parametrizado B2B (Código Civil — Art. 421-A)

Redigir um **contrato único parametrizado** para o regime B2B puro, com tabelas de condições que variam por plano (Essencial, Crescimento, Enterprise) e modalidade (mensal/anual). O contrato deve cobrir TODAS as seguintes áreas com cláusulas detalhadas:

1. **SLA e Uptime** — Nível de serviço garantido, métricas, service credits, exceções
2. **Cancelamento e Reembolso** — Regras para trial de 7 dias, rescisão mensal, rescisão antecipada de anual, reembolso proporcional
3. **IA e Automação** — Responsabilidades do cliente (human-in-the-loop), limitação de responsabilidade por outputs de IA, uso de tokens
4. **LGPD e Proteção de Dados** — Papel de controlador/operador, DPA (Data Processing Agreement), incidentes, sub-processadores
5. **Propriedade Intelectual** — Licenciamento do software (não venda), dados do cliente, conteúdo gerado por IA
6. **Limitação de Responsabilidade** — Liability cap, danos indiretos, exclusões
7. **Foro e Resolução de Conflitos** — Cláusula arbitral ou foro judicial, mediação
8. **Inadimplência e Anti-chargeback** — Suspensão de acesso, negativação, cobrança
9. **Disposições Gerais** — Vigência, renovação automática, cessão, comunicações, alterações contratuais

Cada cláusula deve referenciar o(s) artigo(s) de lei que a fundamenta.

### R4. Contrato Parametrizado com Proteções CDC

Redigir um **segundo contrato parametrizado** que incorpore todas as proteções do CDC aplicáveis, mantendo a mesma estrutura de R3 mas adaptando cláusulas para cenários consumeristas. Deve incluir adicionalmente:

- Direito de arrependimento (Art. 49 do CDC — 7 dias)
- Informações claras sobre contratação (Decreto 7.962/2013)
- Cláusulas que NÃO seriam consideradas abusivas (Art. 51 do CDC)
- Transparência em precificação e reajustes
- Garantia legal de adequação do serviço (Art. 18-20 do CDC)

### R5. Entrega em Markdown + HTML

Todos os documentos devem ser entregues em:

1. **Markdown (.md)** — Documento de referência completo, com cláusulas numeradas, seções claras, e referências legais
2. **HTML (.html)** — Versão estilizada para publicação no site, seguindo o mesmo padrão visual do `termos.html` existente (usar `style-light.css` como folha de estilos, mesma estrutura de header/nav/footer, filtros por seção)

## Acceptance Criteria

### Pesquisa Jurídica (R1)
- [ ] Relatório Markdown contém análise de pelo menos 5 legislações brasileiras distintas
- [ ] Cada legislação analisada cita artigos específicos (não apenas o nome da lei)
- [ ] O relatório identifica pelo menos 3 implicações práticas por legislação para a redação dos contratos
- [ ] O relatório está em Português Brasileiro formal

### Análise de Enquadramento (R2)
- [ ] Documento separado em Markdown com análise de pelo menos 2.000 palavras
- [ ] Conclusão clara sobre se CRM SaaS é produto digital ou serviço
- [ ] Análise de pelo menos 3 cenários de aplicabilidade do CDC em relações B2B
- [ ] Referências a jurisprudência real (tribunais brasileiros) quando disponíveis
- [ ] Recomendações práticas numeradas e acionáveis

### Contrato B2B (R3)
- [ ] Contrato único com tabela parametrizada cobrindo os 3 planos e 2 modalidades
- [ ] Todas as 9 áreas de cláusulas listadas estão cobertas com pelo menos 2 subcláusulas cada
- [ ] Cada cláusula referencia artigo(s) de lei específico(s)
- [ ] Valores, prazos e condições consistentes com os dados da tabela de preços do Aegis
- [ ] Linguagem jurídica formal em Português Brasileiro
- [ ] Versão Markdown E versão HTML entregues

### Contrato CDC (R4)
- [ ] Contrato separado incorporando todas as proteções do CDC listadas
- [ ] Nenhuma cláusula que seria considerada abusiva sob Art. 51 do CDC
- [ ] Direito de arrependimento claramente previsto e mais favorável que o mínimo legal
- [ ] Versão Markdown E versão HTML entregues

### Consistência e Qualidade (R5)
- [ ] Arquivos HTML usam `style-light.css` e seguem a estrutura visual de `termos.html`
- [ ] Header com navegação de volta ao site (logo, link para index.html, link para privacidade.html)
- [ ] Seções filtráveis com pills (como no termos.html existente)
- [ ] Funcionalidade de busca no documento
- [ ] Todos os links internos entre documentos funcionam
- [ ] Conteúdo preserva e complementa (não contradiz) os termos existentes em termos.html

## Continuation Request — 2026-08-12T13:37:32-03:00

Pesquisa jurídica aprofundada na legislação brasileira e elaboração de contratos de assinatura SaaS para o Aegis CRM — um CRM SaaS B2B para gestão de vendas em PMEs brasileiras. O projeto exige dois conjuntos de contratos parametrizados (B2B puro e com proteções CDC) para três planos (Essencial, Crescimento, Enterprise) nas modalidades mensal e anual, com entrega em Markdown e HTML estilizado.

Working directory: c:\Users\victor.aragao\Downloads\AegisLandingPage
Integrity mode: development

## ⚠️ CRITICAL: CONTINUATION FROM PREVIOUS RUN

A equipe ANTERIOR já completou a MAIORIA do trabalho antes de cair por erro 429. Os arquivos já existem no disco. O estado atual é:

### MARCOS COMPLETOS (NÃO REFAZER):
- **M1 (R1)**: `pesquisa_juridica.md` — GATE PASS ✔️ (43.711 bytes, aprovado por 2 revisores + 1 auditor)
- **M2 (R2)**: `analise_enquadramento.md` — GATE PASS ✔️ (30.428 bytes, 4.413 palavras, aprovado)
- **M3 (R3+R5)**: `contrato_b2b.md` + `contrato_b2b.html` — GATE PASS ✔️ (24.756 + 43.493 bytes, 2 iterações)
- **M4 (R4+R5)**: `contrato_cdc.md` + `contrato_cdc.html` — Conteúdo pronto (21.571 + 38.702 bytes)

### O QUE FALTA (CONTINUAR DAQUI):
1. **Validação final do Gate M4/M5 (Iteração 6)**: O último worker (worker_m4_v3) corrigiu os placeholders `[INSERIR...]` em `privacidade.html` e `termos.html`, substituindo por `develop.ags@gmail.com`, `develop.ags@gmail.com` e `Endereço a definir`. O worker reportou REMEDIATION COMPLETE com 0 placeholders restantes. MAS o Gate final (Reviewer + Auditor) NUNCA foi executado porque o erro 429 interrompeu.

2. **Revisão/Auditoria final**: Precisa de Reviewer(s) e Auditor para validar que:
   - `contrato_cdc.html` contém a subcláusula 6.3 (inserida pelo worker_m4_v2)
   - O typo na linha 513 de `contrato_cdc.html` foi corrigido
   - Links de navegação para os novos contratos foram adicionados em `privacidade.html`
   - Zero placeholders `[INSERIR...]` existem em qualquer arquivo HTML
   - Todos os `mailto:` links apontam para emails válidos
   - Consistência visual com `termos.html` (style-light.css, filtros, busca)
   - Links internos entre documentos funcionam

3. **Relatório final**: Consolidar um relatório final de todos os entregáveis.

