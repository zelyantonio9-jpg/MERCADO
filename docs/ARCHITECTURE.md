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

- Login devolve um `accessToken` (JWT) com `sub` (userId), `roles` e
  `permissions` já resolvidos a partir de `Role → RolePermission → Permission`.
- `requireAuth` valida o token e popula `req.user`.
- `requirePermission('orders.read')` valida que `req.user.permissions`
  contém a permissão exigida antes de executar o controller.
- Nunca se confia em `role`, `userId` ou `companyId` enviados pelo cliente.

## Estado atual (Fase 1)

Implementado: estrutura do projeto, schema de dados completo (RBAC, perfis,
empresa, catálogo, carrinho, pedidos, pagamentos, transporte, chat,
avaliações, notificações, documentos, auditoria), autenticação base
(registo/login do comprador individual), RBAC no backend com testes.

Por implementar (fases seguintes, ver `docs/WORKFLOW.md`): cadastro por
etapas completo, marketplace, carrinho/checkout, pagamentos, transporte,
chat, empresa/aprovações, admin/suporte, Android/iOS.
