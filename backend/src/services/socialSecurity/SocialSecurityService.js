import { prisma } from '../../config/prisma.js';
import { AppError } from '../../middlewares/errorHandler.js';
import { encryptSensitive, lastDigits } from '../../utils/crypto.js';
import { logAudit } from '../../utils/audit.js';
import { notify } from '../../utils/notify.js';
import { ManualProvider } from './providers/ManualProvider.js';
import { INSSProvider } from './providers/INSSProvider.js';
import { toPublicProfile } from './SocialSecurityFormatters.js';

export { toPublicProfile };

// SocialSecurityService orquestra o módulo. Nunca fala diretamente com o
// INSS — delega essa parte ao provider ativo. Enquanto não existir
// integração oficial, o provider ativo é sempre o ManualProvider, e o
// nível máximo de verificação alcançável é DOCUMENT_VERIFIED.
async function getActiveProvider() {
  if (await INSSProvider.isAvailable()) {
    return INSSProvider;
  }
  return ManualProvider;
}

// --- Perfil ---

export async function getOrCreateProfile({ userId = null, companyId = null }) {
  if (!userId && !companyId) {
    throw new AppError('É necessário indicar um utilizador ou uma empresa.', 400);
  }
  if (userId && companyId) {
    throw new AppError('Um perfil de Segurança Social pertence a um utilizador OU a uma empresa, nunca aos dois.', 400);
  }

  const where = userId ? { userId } : { companyId };
  const existing = await prisma.socialSecurityProfile.findFirst({ where });
  if (existing) return existing;

  return prisma.socialSecurityProfile.create({ data: userId ? { userId } : { companyId } });
}

// Etapa "Está inscrito no INSS?" — nunca atribui VERIFIED aqui. No máximo
// leva o estado a DECLARED ou DOCUMENTS_PENDING (quando um NISS é indicado
// e ainda precisa de confirmação documental).
export async function declare({ profileId, actorId, declaredEnrolled, niss, category, activity }) {
  const profile = await getProfileByIdOrThrow(profileId);

  const data = {
    declaredEnrolled,
    category: category ?? profile.category,
    activity: activity ?? profile.activity,
  };

  if (declaredEnrolled === true && niss) {
    data.nissEncrypted = encryptSensitive(niss);
    data.nissLast4 = lastDigits(niss, 3);
    data.status = 'DOCUMENTS_PENDING';
    data.verificationLevel = 'DECLARED';
  } else if (declaredEnrolled === true) {
    data.status = 'DECLARED';
    data.verificationLevel = 'DECLARED';
  } else if (declaredEnrolled === false) {
    data.status = 'NOT_REGISTERED';
    data.verificationLevel = null;
  } else {
    // "Não sei" / "Prefiro informar mais tarde"
    data.status = 'NOT_REGISTERED';
  }

  const updated = await prisma.socialSecurityProfile.update({ where: { id: profile.id }, data });

  await recordEvent(profile.id, 'USER_DECLARED', actorId, { declaredEnrolled });
  await logAudit({
    userId: actorId,
    action: 'SOCIAL_SECURITY_DECLARED',
    entity: 'SocialSecurityProfile',
    entityId: profile.id,
    metadata: { declaredEnrolled, hasNiss: Boolean(niss) }, // nunca o NISS em si
  });

  await notifyOwner(updated, 'Informação de Segurança Social atualizada', 'A tua informação de Segurança Social foi atualizada.');

  return updated;
}

// --- Documentos ---

export async function uploadDocument({ profileId, actorId, type, fileUrl, issuedAt, validUntil }) {
  const profile = await getProfileByIdOrThrow(profileId);

  const document = await prisma.socialSecurityDocument.create({
    data: {
      profileId: profile.id,
      type,
      fileUrl,
      issuedAt: issuedAt ? new Date(issuedAt) : null,
      validUntil: validUntil ? new Date(validUntil) : null,
      status: 'PENDING',
      uploadedBy: actorId,
    },
  });

  await prisma.socialSecurityProfile.update({
    where: { id: profile.id },
    data: { status: 'PENDING_VERIFICATION' },
  });

  await recordEvent(profile.id, 'DOCUMENT_UPLOADED', actorId, { documentId: document.id, type });
  await logAudit({
    userId: actorId,
    action: 'SOCIAL_SECURITY_DOCUMENT_UPLOADED',
    entity: 'SocialSecurityDocument',
    entityId: document.id,
    metadata: { profileId: profile.id, type },
  });

  await notifyOwner(profile, 'Documentação recebida', 'Recebemos o teu documento. Vai ser analisado por um operador autorizado.');

  return document;
}

export async function listDocuments(profileId) {
  return prisma.socialSecurityDocument.findMany({
    where: { profileId },
    orderBy: { createdAt: 'desc' },
  });
}

// Confirmação explícita do utilizador/empresa de que os documentos já
// carregados devem seguir para análise. Não altera o resultado — só
// garante que o estado reflete que o pedido de verificação foi formalizado.
export async function submitForVerification({ profileId, actorId }) {
  const profile = await getProfileByIdOrThrow(profileId);

  const pendingDocuments = await prisma.socialSecurityDocument.count({
    where: { profileId: profile.id, status: { in: ['PENDING', 'UNDER_REVIEW'] } },
  });

  if (pendingDocuments === 0) {
    throw new AppError('Envie pelo menos um documento antes de pedir a verificação.', 400);
  }

  const updated = await prisma.socialSecurityProfile.update({
    where: { id: profile.id },
    data: { status: 'PENDING_VERIFICATION' },
  });

  await prisma.socialSecurityDocument.updateMany({
    where: { profileId: profile.id, status: 'PENDING' },
    data: { status: 'UNDER_REVIEW' },
  });

  await recordEvent(profile.id, 'STATUS_CHANGED', actorId, { status: 'PENDING_VERIFICATION' });
  await logAudit({
    userId: actorId,
    action: 'SOCIAL_SECURITY_VERIFICATION_REQUESTED',
    entity: 'SocialSecurityProfile',
    entityId: profile.id,
  });
  await notifyOwner(updated, 'Documentação em análise', 'O teu pedido de verificação foi enviado e está em análise.');

  return updated;
}

// --- Estado ---

export async function getStatus(profileId) {
  const profile = await getProfileByIdOrThrow(profileId);
  const provider = await getActiveProvider();
  return {
    ...toPublicProfile(profile),
    // Informa a origem possível de uma verificação futura, sem nunca
    // simular um resultado.
    officialIntegrationAvailable: await provider.isAvailable(),
  };
}

// --- Verificação (nível 2 — documental, feita por operador autorizado) ---

export async function adminListPendingVerifications({ status, take = 50, skip = 0 } = {}) {
  return prisma.socialSecurityDocument.findMany({
    where: { status: status ?? 'PENDING' },
    include: {
      profile: {
        include: {
          user: { select: { id: true, fullName: true, email: true } },
          company: { select: { id: true, legalName: true, nif: true } },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
    take,
    skip,
  });
}

export async function adminApproveDocument({ documentId, reviewerId }) {
  const document = await prisma.socialSecurityDocument.findUnique({ where: { id: documentId } });
  if (!document) throw new AppError('Documento não encontrado.', 404);

  const updatedDocument = await prisma.socialSecurityDocument.update({
    where: { id: documentId },
    data: { status: 'VALID', reviewedBy: reviewerId, reviewedAt: new Date(), rejectionReason: null },
  });

  const updatedProfile = await prisma.socialSecurityProfile.update({
    where: { id: document.profileId },
    data: { status: 'VERIFIED', verificationLevel: 'DOCUMENT_VERIFIED', lastVerifiedAt: new Date() },
  });

  await prisma.socialSecurityVerification.create({
    data: {
      profileId: document.profileId,
      level: 'DOCUMENT_VERIFIED',
      result: 'VERIFIED',
      performedBy: reviewerId,
      provider: 'MANUAL',
    },
  });

  await recordEvent(document.profileId, 'DOCUMENT_VERIFICATION', reviewerId, { documentId, result: 'APPROVED' });
  await logAudit({
    userId: reviewerId,
    action: 'SOCIAL_SECURITY_DOCUMENT_APPROVED',
    entity: 'SocialSecurityDocument',
    entityId: documentId,
    metadata: { profileId: document.profileId },
  });

  await notifyOwner(updatedProfile, 'Documentação aprovada', 'O teu documento de Segurança Social foi verificado com sucesso.');

  return updatedDocument;
}

export async function adminRejectDocument({ documentId, reviewerId, reason }) {
  if (!reason) throw new AppError('É obrigatório indicar o motivo da rejeição.', 400);

  const document = await prisma.socialSecurityDocument.findUnique({ where: { id: documentId } });
  if (!document) throw new AppError('Documento não encontrado.', 404);

  const updatedDocument = await prisma.socialSecurityDocument.update({
    where: { id: documentId },
    data: { status: 'REJECTED', reviewedBy: reviewerId, reviewedAt: new Date(), rejectionReason: reason },
  });

  const updatedProfile = await prisma.socialSecurityProfile.update({
    where: { id: document.profileId },
    data: { status: 'REJECTED' },
  });

  await prisma.socialSecurityVerification.create({
    data: {
      profileId: document.profileId,
      level: 'DOCUMENT_VERIFIED',
      result: 'REJECTED',
      performedBy: reviewerId,
      provider: 'MANUAL',
      reason,
    },
  });

  await recordEvent(document.profileId, 'DOCUMENT_REJECTED', reviewerId, { documentId, reason });
  await logAudit({
    userId: reviewerId,
    action: 'SOCIAL_SECURITY_DOCUMENT_REJECTED',
    entity: 'SocialSecurityDocument',
    entityId: documentId,
    metadata: { profileId: document.profileId, reason },
  });

  await notifyOwner(updatedProfile, 'Documentação rejeitada', `O teu documento foi rejeitado. Motivo: ${reason}`);

  return updatedDocument;
}

// --- Helpers internos ---

async function getProfileByIdOrThrow(profileId) {
  const profile = await prisma.socialSecurityProfile.findUnique({ where: { id: profileId } });
  if (!profile) throw new AppError('Perfil de Segurança Social não encontrado.', 404);
  return profile;
}

async function recordEvent(profileId, eventType, actorId, metadata) {
  await prisma.socialSecurityVerificationEvent.create({
    data: { profileId, eventType, actorId: actorId ?? null, metadata: metadata ?? undefined },
  });
}

async function notifyOwner(profile, title, message) {
  if (profile.userId) {
    await notify(profile.userId, title, message);
    return;
  }
  if (profile.companyId) {
    // Notifica os membros da empresa com papel de gestão (Administrador/Financeiro).
    const managers = await prisma.companyMembership.findMany({
      where: { companyId: profile.companyId, role: { in: ['ADMINISTRADOR', 'FINANCEIRO'] } },
      select: { userId: true },
    });
    await Promise.all(managers.map((m) => notify(m.userId, title, message)));
  }
}
