import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { requirePermission } from '../middlewares/rbac.js';
import * as buyerController from '../controllers/buyer.controller.js';

const router = Router();
router.use(requireAuth);

// GET /api/payments — só pagamentos de encomendas do próprio comprador.
router.get('/', requirePermission('payments.read'), buyerController.listPayments);

export default router;
