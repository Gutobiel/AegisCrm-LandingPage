# Original User Request

## Initial Request — 2026-06-09T18:08:44-03:00

Criar um novo brainstorm completo e redesenhar a landing page do Aegis CRM para eliminar todos os sinais de "cara de IA" (AI slop). Uma análise exaustiva encontrou 100+ problemas: copy genérica repetida ("piloto automático" 3x), 4 depoimentos fabricados com estrutura idêntica, ~25 emojis, layouts simétricos de 3 colunas em 4 seções, paleta usando cores Tailwind default sem refinamento, e zero imagens reais. O objetivo é um redesign completo que pareça feito por um designer e copywriter humanos de alto nível, seguindo as regras do `.cursorrules` do projeto.

Working directory: c:\Users\victor.aragao\Downloads\AegisLandingPage
Integrity mode: development

## Contexto

Landing page estática (HTML + CSS + JS vanilla) para o Aegis CRM — um CRM para gestores comerciais de PMEs brasileiras. Toda a copy em português brasileiro. Roda em `http://localhost:3000` via `node server.js`.

**LEIA PRIMEIRO**: O arquivo `.cursorrules` na raiz contém as diretrizes anti-AI-slop que DEVEM ser seguidas. Os diretórios `git-portable` e `node-portable` NÃO devem ser tocados.

**CORES DA EMPRESA**: Azul, preto, branco e cinza. A paleta DEVE permanecer nessa família — porém os hexadecimais devem ser refinados e personalizados (NÃO usar os valores exatos padrão do Tailwind como `#2563EB`, `#3B82F6`, `#EF4444`, `#10B981`). Criar tons de azul próprios, com personalidade, e usar cinzas quentes ou frios intencionalmente.

## Referência: Problemas Identificados na Análise (100+)

**Copy (19 ocorrências de jargão IA):**
- "piloto automático" 3x, "deixando na mesa" 2x, "de verdade" 2x
- Estruturas triádicas genéricas, hipérboles vazias ("mágico", "absurdo")
- "Não acredite em nós. Acredite nos números." = clichê absoluto
- FOMO bar com urgência artificial ("Restam 7 vagas", "Válido até sexta")

**Depoimentos fabricados (4/4):**
- Estrutura idêntica em todos: quote → avatar-letra → nome → cargo-empresa → métrica-emoji
- Métricas redondas perfeitas (+42%, -60%, +R$ 180k, 3x)
- Nomes de empresas genéricos, absolutismos ("nunca mais")

**~25 emojis excessivos** incluindo 🚀 múltiplas vezes

**Layout simétrico (violação direta do .cursorrules):**
- 4 seções usando `repeat(3, 1fr)`: pain cards, kanban, métricas, pricing
- "Antes vs Depois" com ✕/✓ = clichê #1
- Features em zig-zag alternado = padrão de template
- Sequência de seções = template exato de SaaS B2B genérico

**Visual:**
- Cores Tailwind default sem refinamento
- Combo Playfair Display + Inter = a mais genérica para "premium SaaS"
- Gradientes blue-to-purple em tudo = template
- Dark mode com #0D1117 = literalmente a cor do GitHub Dark

**Animações template (10+):**
- Scroll reveal = AOS.js, counter 0→target, typewriter, confetti, marquee

## Requirements

### R1. Novo Brainstorm Completo
Antes de tocar no código, criar um documento de brainstorm (salvar como artefato markdown) que redesenhe a landing page inteira com abordagem anti-AI-slop. O brainstorm deve propor: nova estrutura de seções (quebrando o template SaaS genérico), nova direção de copy (conversacional, imperfeita, brasileira), direção visual (layouts assimétricos, bento grids, whitespace editorial), e uma paleta refinada de azul/preto/branco/cinza que não use valores Tailwind default. O brainstorm deve justificar cada decisão com base no `.cursorrules`.

### R2. Copy Autêntica
Reescrever toda a copy da página para soar humana. Zero jargão corporativo de IA. Depoimentos reescritos com detalhes específicos impossíveis de fabricar, números não-redondos, linguagem coloquial imperfeita. Emojis reduzidos drasticamente (máximo 3 em toda a página, exceto simulador WhatsApp). FOMO bar sem urgência artificial.

### R3. Layout e Composição Anti-Genérico
Redesenhar seções que violam o `.cursorrules`: pain-points, pricing, métricas, selos de confiança, "Antes vs Depois". Aplicar assimetria, bento grids, whitespace variado. As seções não precisam seguir a ordem padrão de template SaaS.

### R4. Recursos Visuais Reais
A página não tem nenhuma imagem real. Gerar imagens usando `generate_image` para: screenshots realistas do produto, avatares fotográficos para depoimentos, e og:image para social sharing. Salvar na raiz do projeto.

### R5. Paleta Refinada e Micro-interações Orgânicas
Manter a família azul/preto/branco/cinza mas criar tons próprios e personalizados. Adicionar imperfeições nas animações: delays variados, easings distintos, hover states fluidos e únicos entre elementos. Substituir efeitos template (confetti, marquee genérico) por feedback mais elegante.

## Acceptance Criteria

### Brainstorm
- [ ] Documento de brainstorm existe como artefato markdown com pelo menos 5 seções cobrindo: estrutura, copy, visual, paleta, interatividade
- [ ] Cada proposta do brainstorm referencia qual regra do `.cursorrules` está sendo seguida

### Copy
- [ ] Zero instâncias de: "piloto automático", "deixando na mesa", "de verdade" (como filler), "mágico", "absurdo", "seamless", "revolutionary", "landscape"
- [ ] Cada depoimento contém pelo menos 1 detalhe específico impossível de fabricar
- [ ] Máximo 3 emojis em toda a página (exceto simulador WhatsApp)
- [ ] FOMO bar não usa urgência artificial ("vagas limitadas", "restam X")

### Layout
- [ ] Seção pain-points NÃO usa grid simétrico de 3 colunas iguais
- [ ] Seção pricing NÃO usa 3 cards idênticos alinhados na mesma altura
- [ ] Seção "Antes vs Depois" não usa padrão ✕/✓ lado a lado

### Visual
- [ ] A paleta usa tons de azul, preto, branco e cinza — mas NENHUM hexadecimal exato do Tailwind default (#2563EB, #3B82F6, #EF4444, #10B981, #F59E0B)
- [ ] Pelo menos 3 imagens reais geradas estão no HTML e servidas corretamente
- [ ] Avatares dos depoimentos usam imagens fotográficas

### Orgânico
- [ ] Pelo menos 3 elementos têm timing/easing visivelmente diferente entre si
- [ ] Página servida em http://localhost:3000 funciona corretamente após as mudanças
