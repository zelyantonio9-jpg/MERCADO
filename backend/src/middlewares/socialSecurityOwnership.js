import { prisma } from '../config/prisma.js';
import { AppError } from './errorHandler.js';

// Garante que req.user só acede a um SocialSecurityProfile que é seu
// (userId) ou da empresa a que pertence com papel de gestão (companyId).
// Nunca confia num profileId vindo do cliente sem esta verificação.
// O perfil resolvido fica disponível em req.socialSecurityProfile.
export async function loadOwnedProfile(req, res, next) {
  try {
    const { profileId } = req.params;
    const profile = await prisma.socialSecurityProfile.findUnique({ where: { id: profileId } });

    if (!profile) {
      return next(new AppError('Perfil de Segurança Social não encontrado.', 404));
    }

    const isOwnerUser = profile.userId && profile.userId === req.user.id;
    const isOwnerCompany = profile.companyId && profile.companyId === req.user.companyId;

    if (!isOwnerUser && !isOwnerCompany) {
      return next(new AppError('Não tem acesso a este perfil de Segurança Social.', 403));
    }

    req.socialSecurityProfile = profile;
    next();
  } catch (err) {
    next(err);
  }
}
