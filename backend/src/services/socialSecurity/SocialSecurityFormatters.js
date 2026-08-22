import { maskNiss } from '../../utils/mask.js';

// Módulo sem dependências externas (nem Prisma, nem rede) — só formata
// dados já carregados em memória. Mantido separado do SocialSecurityService
// para poder ser testado de forma isolada e rápida.
//
// Devolve o perfil já formatado para exibição segura: o NISS aparece
// sempre mascarado, nunca o valor cifrado nem em texto simples. Também
// nunca inclui reviewedBy/rejectionReason de documentos de terceiros.
export function toPublicProfile(profile) {
  return {
    id: profile.id,
    status: profile.status,
    verificationLevel: profile.verificationLevel,
    declaredEnrolled: profile.declaredEnrolled,
    category: profile.category,
    activity: profile.activity,
    nissMasked: maskNiss(profile.nissLast4),
    lastVerifiedAt: profile.lastVerifiedAt,
    updatedAt: profile.updatedAt,
  };
}
