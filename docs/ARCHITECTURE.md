# Arquitetura — AO MARKET

## Visão geral

```
Frontend (React + Vite)
        ↓ REST/JSON (fetch, Bearer token)
Backend (Node.js + Express)
        ↓ Prisma Client
PostgreSQL
```

O mesmo backend serve o frontend Web e, mais tarde, as aplicações Android/iOS
geradas a partir do mesmo código React embrulhado em Capacitor. Não existe
lógica de negócio duplicada por plataforma — tudo o que é regra de negócio
vive no backend.

## Estrutura de pastas

```
ao-market/
├── backend/
│   ├── src/
│   │   ├── config/         # env, cliente Prisma
│   │   ├── controllers/    # recebem req/res, chamam services
│   │   ├── services/       # regras de negócio, acesso a dados via Prisma
│   │   ├── middlewares/    # auth, rbac, tratamento de erros
│   │   ├── routes/         # definição dos endpoints REST
│   │   └── utils/          # validação, helpers
│   └── prisma/
│       ├── schema.prisma   # modelo de dados
│       └── seed.js         # roles e permissões iniciais
├── frontend/
│   └── src/
│       ├── pages/          # ecrãs
│       ├── components/     # componentes reutilizáveis
│       ├── router/         # rotas React Router
│       ├── services/       # cliente API
│       └── styles/         # CSS global
├── docs/
└── .github/workflows/      # CI
```

## Camadas do backend

`route → controller → service → prisma → postgres`

- **Routes**: apenas ligam método HTTP + caminho a um controller, e aplicam
  middlewares (`requireAuth`, `requirePermission`, `validateBody`).
- **Controllers**: traduzem `req`/`res`, não contêm lógica de negócio.
- **Services**: contêm as regras de negócio e são a única camada que fala
  com o Prisma. É aqui que ownership e multi-tenancy são impostos (o
  `userId`/`companyId` usados nas queries vêm sempre de `req.user`, nunca
  do corpo do pedido).

## Autenticação e RBAC

- **Access token**: JWT de vida curta (`JWT_EXPIRES_IN`, 15 min por omissão) com
  `sub` (userId), `roles` e `permissions` já resolvidos a partir de
  `Role → RolePermission → Permission`. Vive só em memória no frontend
  (`AuthContext`) — nunca em `localStorage`.
- **Refresh token**: valor opaco (não é JWT), entregue num cookie `httpOnly`
  + `SameSite=Lax` com `path=/api/auth`. Só o **hash** (SHA-256) fica
  persistido na tabela `RefreshToken` — o valor em si nunca é recuperável a
  partir da base de dados. Cada uso roda o token: o antigo é revogado e um
  novo é emitido na mesma "família" (`familyId`). Reutilizar um token já
  revogado é tratado como sinal de roubo e **revoga toda a família**,
  forçando novo login em todos os dispositivos dessa sessão.
- `POST /api/auth/refresh` troca o cookie por um novo access token, sem
  pedir credenciais — é o que o `AuthContext` chama ao arrancar a app para
  restaurar a sessão entre recarregamentos de página.
- `POST /api/auth/logout` revoga apenas o refresh token do dispositivo
  atual (não afeta sessões noutros dispositivos).
- `requireAuth` valida o access token e popula `req.user`.
- `requirePermission('orders.read')` valida que `req.user.permissions`
  contém a permissão exigida antes de executar o controller.
- `authLimiter`/`refreshLimiter` (`middlewares/rateLimiters.js`) aplicam
  limites dedicados e mais apertados a `/auth/login`, `/auth/register*` e
  `/auth/refresh` — separados do limite global da aplicação.
- No frontend, `<RequireAuth>` espelha isto para efeitos de UX (evita
  mostrar uma página que o backend ia recusar), mas a aplicação real da
  regra continua a ser sempre o backend.
- Nunca se confia em `role`, `userId` ou `companyId` enviados pelo cliente.

## Observabilidade

- `utils/logger.js`: logging estruturado em JSON (nível, timestamp,
  contexto), sem dependências externas.
- `middlewares/requestId.js`: atribui um `requestId` a cada pedido
  (reaproveitando `x-request-id` se já vier de um proxy/gateway),
  devolvido no header de resposta e incluído em todo log de erro — é o
  que permite seguir um pedido específico do princípio ao fim quando algo
  corre mal em produção.
- `server.js` implementa encerramento controlado (`SIGTERM`/`SIGINT`):
  para de aceitar ligações novas, deixa os pedidos em curso terminarem, só
  depois fecha a ligação Prisma — e captura `unhandledRejection`/
  `uncaughtException` para nunca morrer em silêncio.

## Estado atual

Implementado: estrutura do projeto, schema de dados completo (RBAC, perfis,
empresa, catálogo, carrinho, pedidos, pagamentos, transporte, chat,
avaliações, notificações, documentos, auditoria, refresh tokens),
autenticação completa com refresh/logout, RBAC no backend com testes,
módulo Segurança Social (INSS), homepage, marketplace de leitura pública,
cadastro de produtor/transportador/empresa, logging estruturado,
encerramento controlado.

Por implementar (fases seguintes, ver `docs/WORKFLOW.md`): carrinho/checkout,
pagamentos, transporte real, chat, aprovações empresariais, admin/suporte,
Android/iOS, verificação de email/telefone, recuperação de password,
testes de integração contra Postgres real.
