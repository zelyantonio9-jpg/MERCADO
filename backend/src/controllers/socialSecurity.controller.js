import * as socialSecurityService from '../services/socialSecurity/SocialSecurityService.js';
import { AppError } from '../middlewares/errorHandler.js';

// Resolve se este pedido diz respeito ao perfil pessoal do utilizador ou
// ao perfil da empresa a que pertence, com base em req.query.scope.
// Nunca aceita um userId/companyId vindo do cliente — usa sempre req.user.
function resolveOwner(req) {
  const scope = req.query.scope === 'company' ? 'company' : 'user';
  if (scope === 'company') {
    if (!req.user.companyId) {
      throw new AppError('Este utilizador não está associado a nenhuma empresa.', 403);
    }
    return { companyId: req.user.companyId };
  }
  return { userId: req.user.id };
}

export async function getMyProfile(req, res, next) {
  try {
    const owner = resolveOwner(req);
    const profile = await socialSecurityService.getOrCreateProfile(owner);
    res.json({ profile: socialSecurityService.toPublicProfile(profile) });
  } catch (err) {
    next(err);
  }
}

export async function updateMyProfile(req, res, next) {
  try {
    const owner = resolveOwner(req);
    const profile = await socialSecurityService.getOrCreateProfile(owner);
    const updated = await socialSecurityService.declare({
      profileId: profile.id,
      actorId: req.user.id,
      ...req.body,
    });
    res.json({ profile: socialSecurityService.toPublicProfile(updated) });
  } catch (err) {
    next(err);
  }
}

export async function getStatus(req, res, next) {
  try {
    const owner = resolveOwner(req);
    const profile = await socialSecurityService.getOrCreateProfile(owner);
    const status = await socialSecurityService.getStatus(profile.id);
    res.json(status);
  } catch (err) {
    next(err);
  }
}

export async function requestVerification(req, res, next) {
  try {
    const owner = resolveOwner(req);
    const profile = await socialSecurityService.getOrCreateProfile(owner);
    const updated = await socialSecurityService.submitForVerification({
      profileId: profile.id,
      actorId: req.user.id,
    });
    res.json({ profile: socialSecurityService.toPublicProfile(updated) });
  } catch (err) {
    next(err);
  }
}

export async function listMyDocuments(req, res, next) {
  try {
    const owner = resolveOwner(req);
    const profile = await socialSecurityService.getOrCreateProfile(owner);
    const documents = await socialSecurityService.listDocuments(profile.id);
    res.json({ documents: documents.map(toPublicDocument) });
  } catch (err) {
    next(err);
  }
}

export async function uploadDocument(req, res, next) {
  try {
    if (!req.file) {
      throw new AppError('É necessário enviar um ficheiro.', 400);
    }
    const owner = resolveOwner(req);
    const profile = await socialSecurityService.getOrCreateProfile(owner);
    const document = await socialSecurityService.uploadDocument({
      profileId: profile.id,
      actorId: req.user.id,
      type: req.body.type,
      fileUrl: req.file.path,
      issuedAt: req.body.issuedAt,
      validUntil: req.body.validUntil,
    });
    res.status(201).json({ document: toPublicDocument(document) });
  } catch (err) {
    next(err);
  }
}

// Nunca devolve reviewedBy/rejectionReason a quem não seja o próprio ou um
// operador autorizado — este mapeamento é o formato do lado do utilizador.
function toPublicDocument(document) {
  return {
    id: document.id,
    type: document.type,
    status: document.status,
    issuedAt: document.issuedAt,
    validUntil: document.validUntil,
    rejectionReason: document.status === 'REJECTED' ? document.rejectionReason : null,
    createdAt: document.createdAt,
  };
}
