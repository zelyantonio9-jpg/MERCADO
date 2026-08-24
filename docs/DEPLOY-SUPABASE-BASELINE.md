# Resolver o erro P3005 (Supabase + Render + Prisma)

## O que aconteceu

```
Error: P3005
The database schema is not empty.
```

Duas causas juntam-se aqui:

1. **Este projeto nunca gerou ficheiros de migration reais.** O `schema.prisma`
   sempre existiu, mas `prisma migrate dev` nunca correu contra uma base de
   dados Postgres viva (foi desenvolvido num ambiente sem rede/BD) — por
   isso `backend/prisma/migrations/` está vazia. `prisma migrate deploy`
   não tem nada para aplicar.
2. **O schema `public` no Supabase não está vazio.** Projetos Supabase por
   vezes deixam objetos no schema `public` (extensões como `pgcrypto`,
   `uuid-ossp`, etc., dependendo da versão/opções do projeto) mesmo sem
   nenhuma tabela tua. O Prisma recusa-se a assumir que sabe o estado de
   uma base de dados não vazia sem uma tabela de controlo
   (`_prisma_migrations`) — por segurança, não tenta adivinhar.

## Resolução (projeto sem dados reais a preservar)

Como esta base de dados **nunca teve utilizadores/pedidos reais gravados**
(o projeto ainda não foi lançado), o caminho mais simples é limpar o
schema `public` e começar do zero, gerando a primeira migration real.

### Passo 1 — Limpar o schema `public` no Supabase

No Supabase: **SQL Editor → New query** → cola o conteúdo de
`backend/scripts/reset-supabase-public-schema.sql` → **Run**.

Confirma no **Table Editor** que o schema `public` ficou vazio.

### Passo 2 — Gerar a migration inicial (na tua máquina, com rede)

Isto tem de correr onde há acesso à internet e ao Prisma CLI — não é
possível gerar isto num ambiente sem rede.

```bash
cd backend
cp .env.example .env
# edita .env: cola o DATABASE_URL do Supabase (ligação direta, porta 5432)

npm install
npx prisma migrate dev --name init
```

Isto vai:
- Ligar-se à tua base de dados Supabase (agora vazia).
- Criar `backend/prisma/migrations/<timestamp>_init/migration.sql` com o
  SQL completo das 41 tabelas.
- Aplicar essa migration à tua base de dados Supabase diretamente.
- Criar a tabela `_prisma_migrations` que o Prisma usa para saber o que
  já foi aplicado.

**Nota sobre o CHECK constraint do XOR:** depois deste comando, abre o
ficheiro de migration gerado (`migration.sql`) e acrescenta no final o
conteúdo de `backend/prisma/manual-sql/social_security_check_constraint.sql`
— é o constraint que garante que um `SocialSecurityProfile` pertence a um
`User` OU a uma `Company`, nunca aos dois. Depois de editares o ficheiro,
corre novamente `npx prisma migrate dev` (sem `--name`, ele deteta que o
ficheiro já existe e só reaplica) ou aplica esse bocado de SQL manualmente
no SQL Editor do Supabase, uma única vez.

### Passo 3 — Semear RBAC e categorias

```bash
npm run prisma:seed
```

### Passo 4 — Commit e push

```bash
git add prisma/migrations
git commit -m "chore(db): migration inicial gerada contra o Supabase"
git push
```

### Passo 5 — Deploy no Render

Agora que existe uma migration real no repositório e a `_prisma_migrations`
já está de acordo com o Supabase, o `prisma migrate deploy` que corre no
`start` do serviço do Render vai encontrar tudo consistente e arrancar
normalmente — não deve voltar a dar P3005.

## Alternativa: se já tiveres dados que precisas de preservar

Se entretanto já meteste dados reais no Supabase que não podes perder, não
uses o reset do Passo 1. Em vez disso, "baseline" a base de dados existente
(diz ao Prisma "trata esta migration como já aplicada, não a corras"):

```bash
npx prisma migrate dev --create-only --name init
npx prisma migrate resolve --applied <nome_da_pasta_gerada>
```

Ver documentação oficial: https://pris.ly/d/migrate-baseline

## Daqui para a frente

Qualquer alteração futura ao `schema.prisma` segue o fluxo normal:

```bash
npx prisma migrate dev --name descricao_da_alteracao
git add prisma/migrations && git commit -m "..." && git push
```

O Render aplica-a automaticamente no próximo deploy (via `prisma migrate
deploy` no `start`). Nunca editar o schema em produção diretamente pelo
SQL Editor do Supabase sem também gerar a migration correspondente — isso
volta a criar o mesmo desalinhamento que causou este incidente.
