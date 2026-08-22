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

Cada fase só é considerada concluída quando cobrir: Frontend → API →
Backend → Database → Authorization → Validation → Error handling → Tests.
