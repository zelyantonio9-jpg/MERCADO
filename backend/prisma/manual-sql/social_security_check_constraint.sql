-- Garante que um SocialSecurityProfile pertence exatamente a um User OU a
-- uma Company, nunca aos dois nem a nenhum.
-- Prisma não expressa CHECK constraints no schema.prisma diretamente,
-- por isso este SQL deve ser adicionado manualmente à migration gerada
-- por `prisma migrate dev --name add_social_security`, ou aplicado depois
-- com `prisma migrate dev --create-only` seguido de edição do ficheiro SQL.

ALTER TABLE "SocialSecurityProfile"
  ADD CONSTRAINT "social_security_profile_owner_xor"
  CHECK (
    ("userId" IS NOT NULL AND "companyId" IS NULL) OR
    ("userId" IS NULL AND "companyId" IS NOT NULL)
  );
