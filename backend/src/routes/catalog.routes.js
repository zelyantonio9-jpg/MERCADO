import { Router } from 'express';
import * as catalogController from '../controllers/catalog.controller.js';

// Todas as rotas aqui são públicas — o marketplace deve poder ser
// navegado por um visitante sem sessão (perfil VISITANTE do projeto).
const router = Router();

router.get('/categories', catalogController.listCategories);

router.get('/products', catalogController.listProducts);
router.get('/products/featured', catalogController.getFeaturedProducts);
router.get('/products/:id', catalogController.getProduct);

router.get('/producers/featured', catalogController.getFeaturedProducers);
router.get('/producers/:id', catalogController.getProducer);

export default router;
