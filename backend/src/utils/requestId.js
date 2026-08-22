import crypto from 'node:crypto';

// Atribui um requestId único a cada pedido (ou reutiliza um vindo de um
// proxy/gateway em "x-request-id"), disponível em req.id e devolvido no
// header de resposta. É isto que permite seguir um pedido específico
// através dos logs quando algo corre mal em produção.
export function requestIdMiddleware(req, res, next) {
  req.id = req.headers['x-request-id'] || crypto.randomUUID();
  res.setHeader('x-request-id', req.id);
  next();
}
