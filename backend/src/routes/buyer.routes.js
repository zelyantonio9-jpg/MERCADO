import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import { requirePermission } from '../middlewares/rbac.js';
import * as buyerController from '../controllers/buyer.controller.js';

const router = Router();
router.use(requireAuth);

// GET /api/buyer/profile
router.get('/profile', requirePermission('buyer.profile.read'), buyerController.getProfile);

// GET /api/buyer/addresses
router.get('/addresses', requirePermission('addresses.read'), buyerController.listAddresses);

// GET /api/buyer/favorites
router.get('/favorites', requirePermission('favorites.manage'), buyerController.listFavorites);

// GET /api/buyer/orders
router.get('/orders', requirePermission('orders.read'), buyerController.listOrders);

// GET /api/buyer/orders/:id
router.get('/orders/:id', requirePermission('orders.read'), buyerController.getOrder);

// GET /api/buyer/documents
router.get('/documents', requirePermission('documents.read'), buyerController.listDocuments);

export default router;
