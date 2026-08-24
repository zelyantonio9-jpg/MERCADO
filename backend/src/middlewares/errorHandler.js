import { logger } from '../utils/logger.js';

export class AppError extends Error {
  constructor(message, statusCode = 400, details = undefined) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function notFoundHandler(req, res, next) {
  next(new AppError(`Rota não encontrada: ${req.method} ${req.originalUrl}`, 404));
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;
  const isServerError = statusCode >= 500;

  if (isServerError) {
    // Em produção o agregador de logs deve indexar por requestId — é o
    // que permite cruzar "o utilizador reportou um erro" com a linha
    // exata que o causou, sem expor stack traces à pessoa.
    logger.error(err.message, {
      requestId: req.id,
      statusCode,
      path: req.originalUrl,
      method: req.method,
      userId: req.user?.id ?? null,
      stack: err.stack,
    });
  } else {
    logger.warn(err.message, {
      requestId: req.id,
      statusCode,
      path: req.originalUrl,
      method: req.method,
    });
  }

  res.status(statusCode).json({
    error: {
      message: isServerError ? 'Ocorreu um erro interno. Tente novamente mais tarde.' : err.message,
      details: isServerError ? undefined : err.details,
      requestId: req.id,
    },
  });
}
