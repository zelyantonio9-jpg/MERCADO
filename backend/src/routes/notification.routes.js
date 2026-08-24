import { Router } from 'express';
import { requireAuth } from '../middlewares/auth.js';
import * as buyerController from '../controllers/buyer.controller.js';

const router = Router();
router.use(requireAuth);

// GET /api/notifications?unread=true — sem permissão dedicada: qualquer
// utilizador autenticado vê só as suas próprias notificações (filtrado
// por userId no service, nunca por um valor vindo do pedido).
router.get('/', buyerController.listNotifications);

export default router;
