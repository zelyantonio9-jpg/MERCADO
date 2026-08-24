import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { requirePermission } from '../middlewares/rbac.js';
import * as buyerController from '../controllers/buyer.controller.js';

const router = Router();
router.use(requireAuth);

// GET /api/delivery/:id — só entregas ligadas a uma encomenda do próprio
// comprador (ou da empresa a que pertence).
router.get('/:id', requirePermission('delivery.read'), buyerController.getDelivery);

export default router;
