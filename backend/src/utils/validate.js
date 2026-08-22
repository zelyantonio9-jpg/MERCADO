import { AppError } from '../middlewares/errorHandler.js';

// Wrapper simples para validar req.body com um schema Zod e devolver
// um erro 400 consistente em caso de falha.
export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const details = result.error.flatten().fieldErrors;
      return next(new AppError('Dados inválidos.', 400, details));
    }
    req.body = result.data;
    next();
  };
}
