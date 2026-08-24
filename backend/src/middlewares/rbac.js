import { AppError } from './errorHandler.js';

// Exige que o utilizador autenticado possua PELO MENOS UMA das permissões indicadas.
// As permissões chegam no token JWT (definidas no login, a partir da tabela
// RolePermission), nunca a partir do corpo/query do pedido.
export function requirePermission(...permissionKeys) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Autenticação necessária.', 401));
    }

    const hasPermission = permissionKeys.some((key) => req.user.permissions.includes(key));

    if (!hasPermission) {
      return next(new AppError('Não tem permissão para executar esta ação.', 403));
    }

    next();
  };
}

// Exige que o utilizador pertença a uma empresa (qualquer que seja o seu papel nela).
export function requireCompanyMembership(req, res, next) {
  if (!req.user?.companyId) {
    return next(new AppError('Esta ação está reservada a utilizadores de empresa.', 403));
  }
  next();
}
