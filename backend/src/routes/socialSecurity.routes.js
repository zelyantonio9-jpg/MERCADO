import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middlewares/auth.js';
import { requirePermission } from '../middlewares/rbac.js';
import { validateBody } from '../utils/validate.js';
import { uploadSocialSecurityDocument } from '../middlewares/upload.js';
import * as controller from '../controllers/socialSecurity.controller.js';

const router = Router();

router.use(requireAuth);

const declareSchema = z.object({
  declaredEnrolled: z.boolean().nullable(),
  niss: z.string().min(5).max(20).optional(),
  category: z.string().max(120).optional(),
  activity: z.string().max(120).optional(),
});

const uploadMetaSchema = z.object({
  type: z.string().min(2, 'Indique o tipo de documento.'),
  issuedAt: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
});

// GET /api/social-security/profile?scope=user|company
router.get('/profile', requirePermission('social_security.read'), controller.getMyProfile);

// PUT /api/social-security/profile?scope=user|company
router.put(
  '/profile',
  requirePermission('social_security.manage'),
  validateBody(declareSchema),
  controller.updateMyProfile
);

// GET /api/social-security/status?scope=user|company
router.get('/status', requirePermission('social_security.read'), controller.getStatus);

// POST /api/social-security/verification?scope=user|company
router.post('/verification', requirePermission('social_security.manage'), controller.requestVerification);

// GET /api/social-security/documents?scope=user|company
router.get('/documents', requirePermission('social_security.documents.read'), controller.listMyDocuments);

// POST /api/social-security/documents  (multipart/form-data, campo "document")
router.post(
  '/documents',
  requirePermission('social_security.documents.upload'),
  uploadSocialSecurityDocument,
  validateBody(uploadMetaSchema),
  controller.uploadDocument
);

export default router;
