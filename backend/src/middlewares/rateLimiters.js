import rateLimit from 'express-rate-limit';
import { AppError } from './errorHandler.js';

// Limite apertado para login/registo — são os alvos óbvios de força bruta
// e credential stuffing. Muito mais restritivo que o limite global da
// aplicação (que protege contra abuso genérico, não ataques direcionados
// a autenticação).
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  // Chave por IP + email tentado (quando existir no corpo), para não
  // bloquear toda a gente atrás do mesmo NAT/proxy só porque uma pessoa
  // está a tentar credenciais erradas repetidamente.
  keyGenerator: (req) => `${req.ip}:${req.body?.email ?? ''}`,
  handler: (req, res, next) => {
    next(new AppError('Demasiadas tentativas. Aguarde alguns minutos antes de tentar novamente.', 429));
  },
});

// Limite específico para o pedido de refresh de token — mais permissivo
// que login (é chamado automaticamente pelo frontend), mas ainda limitado
// para impedir abuso de um token roubado a gerar acessos em massa.
export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new AppError('Demasiados pedidos. Tente novamente mais tarde.', 429));
  },
});
