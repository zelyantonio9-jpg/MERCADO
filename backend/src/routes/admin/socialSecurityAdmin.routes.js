import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../middlewares/auth.js';
import { requirePermission } from '../../middlewares/rbac.js';
import { validateBody } from '../../utils/validate.js';
import * as controller from '../../controllers/admin/socialSecurityAdmin.controller.js';

const router = Router();

router.use(requireAuth);
router.use(requirePermission('social_security.verify'));

const rejectSchema = z.object({
  reason: z.string().min(5, 'O motivo da rejeição é obrigatório.'),
});

// GET /api/admin/social-security/verifications?status=PENDING
router.get('/verifications', controller.listPendingVerifications);

// POST /api/admin/social-security/verifications/:id/approve
router.post('/verifications/:id/approve', controller.approveDocument);

// POST /api/admin/social-security/verifications/:id/reject
router.post('/verifications/:id/reject', validateBody(rejectSchema), controller.rejectDocument);

export default router;
