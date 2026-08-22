import * as socialSecurityService from '../../services/socialSecurity/SocialSecurityService.js';

// Área "Administração → Segurança Social → Verificações pendentes".
// Só acessível a quem tenha a permissão social_security.verify
// (ver middleware requirePermission na rota).

export async function listPendingVerifications(req, res, next) {
  try {
    const { status } = req.query;
    const documents = await socialSecurityService.adminListPendingVerifications({ status });
    res.json({
      documents: documents.map((doc) => ({
        id: doc.id,
        type: doc.type,
        status: doc.status,
        createdAt: doc.createdAt,
        profile: {
          id: doc.profile.id,
          ownerType: doc.profile.userId ? 'USER' : 'COMPANY',
          user: doc.profile.user
            ? { id: doc.profile.user.id, fullName: doc.profile.user.fullName, email: doc.profile.user.email }
            : null,
          company: doc.profile.company
            ? { id: doc.profile.company.id, legalName: doc.profile.company.legalName, nif: doc.profile.company.nif }
            : null,
        },
      })),
    });
  } catch (err) {
    next(err);
  }
}

export async function approveDocument(req, res, next) {
  try {
    const document = await socialSecurityService.adminApproveDocument({
      documentId: req.params.id,
      reviewerId: req.user.id,
    });
    res.json({ document });
  } catch (err) {
    next(err);
  }
}

export async function rejectDocument(req, res, next) {
  try {
    const document = await socialSecurityService.adminRejectDocument({
      documentId: req.params.id,
      reviewerId: req.user.id,
      reason: req.body.reason,
    });
    res.json({ document });
  } catch (err) {
    next(err);
  }
}
