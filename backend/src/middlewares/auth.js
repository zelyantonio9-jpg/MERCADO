import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { AppError } from './errorHandler.js';

// Exige que o pedido tenha um token JWT válido.
// Nunca confiar em userId/role enviados pelo cliente: tudo é extraído
// do token assinado pelo servidor.
export function requireAuth(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    return next(new AppError('Autenticação necessária.', 401));
  }

  const token = header.slice('Bearer '.length);

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = {
      id: payload.sub,
      accountType: payload.accountType,
      roles: payload.roles || [],
      permissions: payload.permissions || [],
      companyId: payload.companyId || null,
    };
    next();
  } catch {
    next(new AppError('Token inválido ou expirado.', 401));
  }
}

// Middleware opcional: identifica o utilizador se o token existir,
// mas não bloqueia o pedido caso não exista (ex: marketplace público).
export function attachUserIfPresent(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return next();

  try {
    const payload = jwt.verify(header.slice('Bearer '.length), env.jwtSecret);
    req.user = {
      id: payload.sub,
      accountType: payload.accountType,
      roles: payload.roles || [],
      permissions: payload.permissions || [],
      companyId: payload.companyId || null,
    };
  } catch {
    // Token inválido em rota pública: ignora e segue sem utilizador autenticado.
  }
  next();
}
