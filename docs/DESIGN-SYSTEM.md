# Sistema de Design — Homepage AO MARKET

## Identidade

- **Cor**: `#17392B` verde-floresta profundo (marca, CTA primário), `#B8862E` dourado/âmbar
  (destaque restrito — links de rota, eyebrows, hover), `#F6F2EA` creme (fundo principal),
  `#211D18` carvão (texto, rodapé, secção de confiança), `#DDD5C6` linha quente (divisores).
  Proporção aproximada: 80% neutros, 15% marca, 5% destaque.
- **Tipografia**: Manrope (700/800) nos títulos, Inter (400/500/600) no corpo e interface.
  Carregadas via Google Fonts em `index.html`; variáveis em `styles/tokens.css`
  (`--am-font-display`, `--am-font-body`).
- **Composição**: editorial, não SaaS — divisores finos (`border-bottom: 1px solid`) em vez
  de sombras/cards flutuantes; hero assimétrico 60/40; categorias e produtos em faixa de
  scroll horizontal; produtores em duas colunas com checklist simples de verificação.
- **Assinatura visual**: motivo de "linha de rota" (origem — linha tracejada — destino),
  usado literalmente em `TransportSection.jsx` (`.am-route`). Os números 01–04 só aparecem
  em "Como funciona", porque ali representam uma sequência real — não é decoração aplicada
  a qualquer lista.

## Ficheiros

```
frontend/src/styles/tokens.css      Variáveis de cor e tipografia
frontend/src/styles/homepage.css    Layout e componentes da homepage
frontend/src/components/layout/     Header, Footer (reutilizáveis em toda a app)
frontend/src/components/home/       Hero, SearchBar, CategorySection, CategoryCard,
                                     FeaturedProducts, ProductCard, ProducerSection,
                                     ProducerCard, HowItWorks, BusinessSection,
                                     SellerSection, TransportSection, TrustSection,
                                     StoriesSection, FinalCTA
frontend/src/pages/HomePage.jsx     Composição de todas as secções
frontend/src/pages/placeholder/     Destinos honestos para CTAs de secções
                                     ainda não implementadas (marketplace,
                                     vender, transportar, empresas)
```

## Dados reais vs. placeholders

- `FeaturedProducts` e `ProducerSection` chamam `api.marketplace.getFeaturedProducts()`
  e `api.marketplace.getFeaturedProducers()`. Estes endpoints ainda não existem no
  backend (a Fase 4 — marketplace — não está implementada). Enquanto isso, os
  componentes tratam a falha de forma explícita e mostram um estado vazio
  (`.am-empty-state`) em vez de dados inventados.
- Fotografias: todas as áreas de imagem (hero, empresas, vender, produtores) são
  placeholders com `aria-label`/legenda a dizer claramente "a confirmar" — devem ser
  substituídas por fotografia editorial real antes do lançamento.
- Selos de verificação (`ProducerCard`) só aparecem preenchidos (`✓`, cor verde) quando
  `verifications.identity` / `.businessData` / `.socialSecurity` vierem `true` da API —
  nunca por omissão.
- Histórias de produtores (`StoriesSection`): estrutura pronta, sem testemunhos
  inventados.
- Contactos no rodapé: "a definir" — nunca um telefone/email fictício.

## CTAs → destino real

| CTA | Rota | Estado |
|---|---|---|
| Começar a comprar / Comprar | `/marketplace` | Placeholder honesto ("em construção") |
| Quero vender / Começar a vender | `/vender` | Placeholder honesto |
| Encontrar transporte / Transportar | `/transportar` | Placeholder honesto |
| Comprar para a minha empresa / Empresas | `/empresas` | Placeholder honesto |
| Entrar | `/entrar` | Funcional (login real) |
| Criar conta | `/criar-conta` | Funcional (registo real, Fase 1) |

À medida que as Fases 3/4 do roteiro (`docs/WORKFLOW.md`) forem implementadas, estas
páginas placeholder devem ser substituídas pelas páginas reais — as rotas já estão no
sítio certo, não é preciso mudar links no header/footer/CTAs.

## Acessibilidade

- Todas as imagens/áreas visuais decorativas usam `role="img"` + `aria-label` descritivo,
  ou `aria-hidden="true"` quando são puramente decorativas (ex: molduras de categoria).
  - Formulário de pesquisa com `<label>` associada (visualmente oculta) e `role="search"`.
- Estados de foco visíveis (`:focus-visible`) em toda a homepage, com contraste sobre
  fundo claro e escuro.
- `prefers-reduced-motion: reduce` desativa transições/animações.
- Hierarquia semântica: um único `<h1>` (hero), `<h2>` por secção, `<h3>` dentro de
  "Como funciona" e "Confiança".

## Responsividade

Testado por breakpoints de CSS (não há execução visual disponível neste ambiente —
ver limitações no relatório de entrega): 480px, 700/760px, 860/900px, 1024px+.
Nenhuma secção usa `overflow` horizontal para além das faixas de scroll intencionais
(`.am-scroll-row`), que têm `scroll-snap` e barra de scroll fina.

## Performance

- Sem bibliotecas de animação adicionais — apenas `transition` CSS pontual (hover em
  categorias/links) e sem parallax.
- `loading` nativo do navegador deve ser adicionado (`loading="lazy"`) assim que
  fotografias reais substituírem os placeholders atuais.
- Fontes carregadas com `rel="preconnect"` e `display=swap`.
