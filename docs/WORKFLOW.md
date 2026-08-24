# Roteiro de implementação — AO MARKET

| Fase | Conteúdo                                                  | Estado    |
|------|------------------------------------------------------------|-----------|
| 1    | Projeto, frontend, backend, base de dados, Prisma, Git, README | ✅ Concluída |
| 2    | Auth, Users, Roles, Permissions, RBAC                       | 🔶 Base pronta (login/registo simples); a expandir |
| 3    | Cadastro completo por etapas, perfis (comprador, produtor, transportador) | ⏳ Por fazer |
| 4    | Marketplace, categorias, produtos, stock                    | ⏳ Por fazer |
| 5    | Carrinho, checkout, pedidos                                 | ⏳ Por fazer |
| 6    | Pagamentos                                                   | ⏳ Por fazer |
| 7    | Transportadores, entregas, tracking                          | ⏳ Por fazer |
| 8    | Chat, notificações, avaliações                                | ⏳ Por fazer |
| 9    | Empresa, compras empresariais, aprovações                    | ⏳ Por fazer |
| 10   | Admin, suporte, auditoria                                    | ⏳ Por fazer |
| 11   | Android, iOS (Capacitor)                                      | ⏳ Por fazer |

## Módulos transversais

| Módulo | Conteúdo | Estado |
|---|---|---|
| Segurança Social (INSS) | Perfil, documentos, verificação manual, RBAC, auditoria, admin, adapter para futura API oficial | ✅ Implementado — ver `docs/INSS-INTEGRATION.md` |
| Homepage | Identidade visual editorial, header, hero, categorias, produtos em destaque, produtores, como funciona, empresas, vender, transporte, confiança, histórias, CTA final, footer | ✅ Implementada — ver `docs/DESIGN-SYSTEM.md` |
| Marketplace (leitura pública) | Catálogo real (produtos/categorias/produtores), pesquisa, filtro por categoria, paginação, página de produto | ✅ Implementado (só leitura — publicação de produtos ainda não existe) |
| Cadastro produtor/transportador/empresa | Registo real ligado ao backend, atribuição de RBAC, transação para empresa (Company + User + CompanyMembership) | ✅ Implementado |

## Auditoria de código profissional (correções aplicadas)

Ronda de correções a partir de uma auditoria fullstack ao estado do projeto
— por ordem de risco:

| Item | Estado | Nota |
|---|---|---|
| Refresh token real (rotação + revogação + deteção de roubo) | ✅ Corrigido e testado | Antes: emitido e esquecido, sem endpoint de refresh nem revogação |
| Token em cookie `httpOnly` (não `localStorage`) | ✅ Corrigido | Access token agora só em memória (`AuthContext`) |
| `RequireAuth` no frontend | ✅ Corrigido | Estava prometido em comentários há várias entregas, nunca implementado |
| `AuthContext` centralizado | ✅ Corrigido | Antes cada página lia `localStorage` diretamente |
| Rate limiting dedicado a `/auth/*` | ✅ Corrigido | Antes só existia o limite global (300/15min) |
| Logging estruturado + `requestId` | ✅ Corrigido | Antes era `console.error` sem correlação |
| Encerramento controlado (`SIGTERM`/`SIGINT`) | ✅ Corrigido | Antes o processo morria sem fechar a ligação Prisma |
| `ErrorBoundary` + página 404 (frontend) | ✅ Corrigido | Antes um erro de render partia a app inteira |
| `Cart` sem `@@unique(userId)` | ✅ Corrigido | Permitia carrinhos duplicados por utilizador |
| `registerBuyer` sem `UserRole` atribuído | ✅ Corrigido (detetado nesta ronda) | Compradores registados ficavam sem permissões nenhumas |
| Migration real contra Postgres | ⏳ Por fazer | Só validado via tradução para SQLite neste ambiente — falta correr `prisma migrate dev` contra Postgres real |
| Testes de integração contra Postgres | ⏳ Por fazer | Os 25 testes atuais são de lógica pura, sem BD real |
| Testes no frontend | ⏳ Por fazer | 0 ficheiros de teste no frontend |
| Verificação de email/telefone | ⏳ Por fazer | Estado `PENDING_VERIFICATION` fica assim para sempre |
| Recuperação de password | ⏳ Por fazer | — |
| CSP customizada / `compression` middleware | ⏳ Por fazer | — |

Cada fase só é considerada concluída quando cobrir: Frontend → API →
Backend → Database → Authorization → Validation → Error handling → Tests.
