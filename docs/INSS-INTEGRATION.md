# Módulo Segurança Social (INSS) — AO MARKET

## Princípio fundamental

**O AO MARKET não é o INSS.** Este módulo apenas recolhe dados autorizados
pelo utilizador, organiza documentação, apresenta um estado de verificação
e — quando existir autorização e serviço técnico oficial — integra com o
INSS. Nunca simula, nunca faz scraping do portal do INSS, nunca guarda
credenciais do INSS de utilizadores, e nunca mostra "verificado junto do
INSS" sem uma verificação oficial real por trás.

## Objetivo

Permitir a produtores, trabalhadores por conta própria, empresas,
trabalhadores de empresas, transportadores e prestadores de serviços:

- associar um NISS (Número de Identificação da Segurança Social);
- registar a situação declarada por si próprios;
- carregar documentação comprovativa;
- acompanhar o estado de verificação;
- controlar a validade dos documentos enviados;
- passar por uma verificação manual/documental feita por um operador
  autorizado do AO MARKET;
- estar preparado para uma integração oficial futura com o INSS.

## Arquitetura

```
SocialSecurityService
        ↓
SocialSecurityProvider (contrato/interface)
        ↓
   ┌────────────┴─────────────┐
ManualProvider          INSSProvider
(ativo hoje)             (adapter preparado, INSS_INTEGRATION_ENABLED=false)
```

- `SocialSecurityService` (`backend/src/services/socialSecurity/SocialSecurityService.js`)
  contém toda a lógica de negócio: perfis, documentos, declarações,
  verificação manual, notificações e auditoria. É a única camada que fala
  com a base de dados via Prisma.
- `SocialSecurityProvider.js` documenta o contrato que qualquer provider
  deve respeitar (`verifyNISS`, `getContributorStatus`, `verifyIdentity`,
  `getContributionStatus`, `isAvailable`).
- `ManualProvider` é o provider ativo enquanto não existir integração
  oficial. Todos os seus métodos de consulta oficial devolvem
  explicitamente `{ available: false }` — nunca inventam uma resposta.
- `INSSProvider` é o adapter preparado para a futura API oficial. Enquanto
  `INSS_INTEGRATION_ENABLED=false`, todos os seus métodos lançam um erro
  explícito a dizer que a integração não está implementada. Não existe
  nenhuma chamada de rede fictícia neste ficheiro.

## Dados

| Entidade | Descrição |
|---|---|
| `SocialSecurityProfile` | Um por `User` OU um por `Company` (nunca ambos — imposto por CHECK constraint em SQL, ver `prisma/manual-sql/social_security_check_constraint.sql`). Guarda estado, nível de verificação, NISS cifrado e categoria/atividade. |
| `SocialSecurityDocument` | Documentos carregados, com tipo (configurável), validade, estado e quem reviu. |
| `SocialSecurityVerification` | Registo formal de cada decisão de verificação (documental ou, futuramente, oficial). |
| `SocialSecurityVerificationEvent` | Histórico detalhado de todos os eventos do módulo (declaração, upload, verificação, rejeição, expiração). |

O NISS nunca é gravado em texto simples: é cifrado com AES-256-GCM
(`backend/src/utils/crypto.js`) usando a variável `SOCIAL_SECURITY_ENCRYPTION_KEY`.
Só os últimos 3 dígitos (`nissLast4`) ficam disponíveis em claro, exclusivamente
para permitir a exibição mascarada (`••••••••901`) sem ter de decifrar o
valor em cada pedido.

## Estados (`SocialSecurityStatus`)

```
NOT_REGISTERED → DECLARED → DOCUMENTS_PENDING → PENDING_VERIFICATION → VERIFIED
                                                                       ↘ REJECTED
VERIFIED → EXPIRED (quando os documentos perdem validade)
qualquer estado → SUSPENDED (ação administrativa)
```

Nunca se atribui `VERIFIED` apenas porque o utilizador escreveu um NISS.

## Níveis de verificação (`SocialSecurityVerificationLevel`)

| Nível | Quando se aplica | Texto mostrado ao utilizador |
|---|---|---|
| `DECLARED` | Utilizador respondeu que está inscrito, sem prova | "Informação declarada" |
| `DOCUMENT_VERIFIED` | Documentos analisados e aprovados por um operador do AO MARKET | "Verificado documentalmente pelo AO MARKET" |
| `OFFICIAL_VERIFIED` | Resultado de uma integração oficial com o INSS | "Verificado junto do INSS" |

`OFFICIAL_VERIFIED` só pode ser atribuído pelo `INSSProvider` quando a
integração oficial existir e estiver ativa. Enquanto isso não acontecer,
o nível máximo alcançável no AO MARKET é `DOCUMENT_VERIFIED`.

## RBAC

Permissões introduzidas por este módulo:

```
social_security.read
social_security.manage
social_security.verify
social_security.documents.read
social_security.documents.upload
```

Atribuição por papel (ver `backend/prisma/seed.js`):

| Papel | Permissões |
|---|---|
| `PRODUCER` | read, manage, documents.read, documents.upload |
| `TRANSPORTER` | read, manage, documents.read, documents.upload |
| `COMPANY_ADMIN` | read, manage, documents.read, documents.upload |
| `ADMIN` | todas |
| `SUPPORT` | read, verify |
| `BUYER` | nenhuma por omissão — nem todo comprador precisa de NISS |

`social_security.verify` está reservada a operadores explicitamente
autorizados (Admin/Suporte) — é a única permissão que permite aprovar ou
rejeitar documentos.

## Ownership

- Perfil pessoal: só o próprio `User` (`profile.userId === req.user.id`).
- Perfil de empresa: só utilizadores com `companyId` correspondente
  (`profile.companyId === req.user.companyId`), imposto pelo middleware
  `loadOwnedProfile` (`backend/src/middlewares/socialSecurityOwnership.js`).
- As notificações de eventos do perfil de empresa vão para os membros com
  papel `ADMINISTRADOR` ou `FINANCEIRO`.

## Fluxo documental/manual (ativo hoje)

1. Utilizador/empresa responde "Está inscrito no INSS?" → `declare()`.
   Estado passa a `DECLARED` (sem NISS) ou `DOCUMENTS_PENDING` (com NISS,
   ainda por confirmar).
2. Utilizador carrega um documento → `uploadDocument()`. Estado passa a
   `PENDING_VERIFICATION`. Documento fica `PENDING`.
3. Utilizador pode confirmar explicitamente o pedido de verificação →
   `submitForVerification()` (`POST /api/social-security/verification`),
   que move documentos `PENDING` para `UNDER_REVIEW`.
4. Um operador autorizado (`social_security.verify`) analisa em
   **Administração → Segurança Social → Verificações pendentes**.
5. Aprovação (`adminApproveDocument`): documento passa a `VALID`, perfil
   passa a `VERIFIED` com `verificationLevel = DOCUMENT_VERIFIED`.
6. Rejeição (`adminRejectDocument`): motivo é **obrigatório**, documento
   passa a `REJECTED`, perfil volta a `REJECTED`.
7. Todas as transições geram: um evento (`SocialSecurityVerificationEvent`),
   um registo em `AuditLog`, e uma notificação ao dono do perfil.

## Fluxo de verificação oficial (futuro)

Só existirá quando o INSS disponibilizar um serviço técnico oficial e o AO
MARKET obtiver autorização/credenciais. Nessa altura:

1. Implementar os métodos de `INSSProvider` com a chamada HTTP real
   (autenticação, timeouts, tratamento de erros).
2. Configurar `INSS_API_BASE_URL`, `INSS_API_CLIENT_ID`,
   `INSS_API_CLIENT_SECRET` como segredos de ambiente.
3. Ativar `INSS_INTEGRATION_ENABLED=true`.
4. `SocialSecurityService` passa a preferir `INSSProvider` sobre
   `ManualProvider` sempre que `INSSProvider.isAvailable()` for `true`.
5. Só nesse momento o sistema pode atribuir `verificationLevel = OFFICIAL_VERIFIED`.

**A integração oficial depende da existência de serviços técnicos e
autorização do INSS.**

## Variáveis de ambiente

```
SOCIAL_SECURITY_ENCRYPTION_KEY   # obrigatória; chave de cifra do NISS
INSS_INTEGRATION_ENABLED         # false por omissão
INSS_API_BASE_URL                # vazio até existir integração oficial
INSS_API_CLIENT_ID               # vazio até existir integração oficial
INSS_API_CLIENT_SECRET           # vazio até existir integração oficial
```

Nenhum destes valores reais deve estar no `.env.example`, no código-fonte
ou no repositório Git. As credenciais futuras do INSS devem viver apenas em
variáveis de ambiente ou num secret manager.

## Segurança e privacidade

- NISS cifrado em repouso (AES-256-GCM); nunca em texto simples na base
  de dados, em URLs, em logs, em mensagens de erro ou em analytics.
- Exibição sempre mascarada (`••••••••901`).
- Perfil público nunca mostra o NISS, o BI, dados bancários, documentos
  privados ou o endereço privado — apenas um selo (`✓ Segurança Social
  verificada`) ou "Dados de Segurança Social fornecidos", conforme o
  estado.
- Nenhum utilizador pode alterar manualmente o estado de um documento
  para `VALID` — só a rota administrativa protegida por
  `social_security.verify` o consegue fazer.
- Minimização de dados: só se recolhem os campos indicados no fluxo; a
  categoria/atividade/tipo de documento são texto configurável, não
  requisitos legais fixados no código.

## Endpoints

Lado do utilizador/empresa (`requireAuth` + permissão indicada):

```
GET  /api/social-security/profile?scope=user|company      social_security.read
PUT  /api/social-security/profile?scope=user|company      social_security.manage
GET  /api/social-security/status?scope=user|company       social_security.read
POST /api/social-security/verification?scope=user|company social_security.manage
GET  /api/social-security/documents?scope=user|company    social_security.documents.read
POST /api/social-security/documents                        social_security.documents.upload
```

Administração (`requireAuth` + `social_security.verify`):

```
GET  /api/admin/social-security/verifications
POST /api/admin/social-security/verifications/:id/approve
POST /api/admin/social-security/verifications/:id/reject
```

## Notificações

`Documentação recebida`, `Documentação em análise`, `Documentação
aprovada`, `Documentação rejeitada` (com motivo), `Documento expirado`
(a implementar via job de manutenção — ver "Limitações"), `Informação de
Segurança Social atualizada`.

## Limitações conhecidas / próximos passos

- **Expiração automática de documentos**: o estado `EXPIRED` está
  modelado, mas ainda não existe um job agendado que marque documentos
  como expirados quando `validUntil` passa. A implementar como tarefa
  periódica que reutiliza `SocialSecurityService` (não duplicar lógica).
- **CHECK constraint SQL**: como o Prisma não expressa restrições XOR
  nativamente, o SQL em `prisma/manual-sql/social_security_check_constraint.sql`
  deve ser incorporado à migration gerada por
  `prisma migrate dev --name add_social_security` no ambiente do
  utilizador (este sandbox não tem acesso a uma base de dados real para
  gerar e aplicar a migration).
- **Armazenamento de ficheiros**: o upload usa disco local
  (`backend/uploads/social-security`) apenas para desenvolvimento. Em
  produção deve ser substituído por armazenamento de objetos, mantendo a
  mesma interface de `req.file`.
