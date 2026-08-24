import { prisma } from '../config/prisma.js';

// Regista uma ação no AuditLog genérico. Reutiliza a entidade existente
// em vez de criar uma tabela de auditoria própria para o módulo.
// IMPORTANTE: nunca incluir o NISS em texto simples em `metadata`.
export async function logAudit({ userId = null, action, entity, entityId, metadata, ipAddress }) {
  await prisma.auditLog.create({
    data: { userId, action, entity, entityId, metadata, ipAddress },
  });
}
