import { Router } from 'express';
import { prisma } from '../config/prisma.js';

const router = Router();

router.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'ao-market-backend', timestamp: new Date().toISOString() });
});

// Verifica também a ligação à base de dados.
router.get('/db', async (req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    next(err);
  }
});

export default router;
