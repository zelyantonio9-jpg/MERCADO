import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { requirePermission } from '../middlewares/rbac.js';
import * as buyerController from '../controllers/buyer.controller.js';

const router = Router();
router.use(requireAuth);

// GET /api/cart — o backend recalcula sempre o subtotal a partir do
// preço atual do produto (ver buyer.service.js#getCart).
router.get('/', requirePermission('cart.read'), buyerController.getCart);

export default router;
