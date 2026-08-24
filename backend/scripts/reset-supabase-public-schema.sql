-- Reset do schema "public" no Supabase — usar APENAS num projeto novo,
-- sem dados reais que precises de manter (é o caso deste projeto: nunca
-- houve utilizadores/pedidos reais gravados nesta base de dados).
--
-- Como usar:
--   1. Supabase → o teu projeto → SQL Editor → New query
--   2. Cola este ficheiro inteiro → Run
--   3. Confirma que "Table Editor" mostra o schema "public" vazio
--   4. Só depois corres `prisma migrate deploy` (local ou via Render)
--
-- O que isto faz: apaga o schema "public" inteiro (todas as tabelas,
-- funções, tipos, extensões nele instaladas) e recria-o vazio, com as
-- permissões por omissão do Supabase. Não toca nos schemas "auth",
-- "storage", "extensions", etc. — só afeta o schema onde o Prisma escreve.

DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

COMMENT ON SCHEMA public IS 'standard public schema';
