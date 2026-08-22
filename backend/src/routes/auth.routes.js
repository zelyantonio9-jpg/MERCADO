import { Router } from 'express';
import { z } from 'zod';
import { validateBody } from '../utils/validate.js';
import { authLimiter, refreshLimiter } from '../middlewares/rateLimiters.js';
import { requireAuth } from '../middlewares/auth.js';
import * as authController from '../controllers/auth.controller.js';

const router = Router();

const registerSchema = z
  .object({
    fullName: z.string().min(3, 'Nome completo é obrigatório.'),
    email: z.string().email('Email inválido.'),
    phone: z.string().min(9, 'Telefone inválido.').optional(),
    password: z.string().min(8, 'A palavra-passe deve ter pelo menos 8 caracteres.'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As palavras-passe não coincidem.',
    path: ['confirmPassword'],
  });

const registerProducerSchema = registerSchema.and(
  z.object({
    businessName: z.string().min(2, 'Indique o nome do negócio.'),
    sector: z.string().max(120).optional(),
  })
);

const registerTransporterSchema = registerSchema.and(
  z.object({
    operatingAreas: z.array(z.string().min(2)).min(1, 'Indique pelo menos uma área de atuação.'),
  })
);

const loginSchema = z.object({
  email: z.string().email('Email inválido.'),
  password: z.string().min(1, 'Palavra-passe é obrigatória.'),
});

// Cadastro do comprador individual — Etapa 1 (Conta).
// As etapas seguintes (identificação, localização, preferências, verificação)
// serão implementadas na Fase 3, sobre o BuyerProfile já criado aqui.
router.post('/register', authLimiter, validateBody(registerSchema), authController.register);

// Cadastro do produtor/vendedor.
router.post('/register-producer', authLimiter, validateBody(registerProducerSchema), authController.registerProducer);

// Cadastro do transportador.
router.post('/register-transporter', authLimiter, validateBody(registerTransporterSchema), authController.registerTransporter);

router.post('/login', authLimiter, validateBody(loginSchema), authController.login);

// Troca o refresh token (cookie httpOnly) por um novo access token.
// Chamado automaticamente pelo frontend, nunca requer palavra-passe.
router.post('/refresh', refreshLimiter, authController.refresh);

// Revoga a sessão atual (este dispositivo apenas).
router.post('/logout', authController.logout);

// Dados do utilizador autenticado. Exige um access token válido
// (Authorization: Bearer ...) — nunca lê nada do cookie do refresh token.
router.get('/me', requireAuth, authController.me);

export default router;
