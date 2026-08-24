import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Protege rotas que exigem sessão. Espera pelo `status` deixar de ser
// 'loading' (restauração de sessão a partir do cookie httpOnly) antes de
// decidir — sem isto, um recarregamento de página redirecionaria sempre
// para /entrar por uma fração de segundo, mesmo com sessão válida.
//
// `permission` é opcional: quando indicada, exige que o utilizador tenha
// essa permissão (vinda do JWT, nunca inventada no frontend) — espelha o
// requirePermission do backend, mas é só uma conveniência de UX; a
// aplicação real da regra continua a ser feita no backend.
export function RequireAuth({ children, permission }) {
  const { user, status } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <p style={{ padding: 24 }}>A verificar sessão...</p>;
  }

  if (status === 'unauthenticated' || !user) {
    return <Navigate to="/entrar" state={{ from: location }} replace />;
  }

  if (permission && !user.permissions?.includes(permission)) {
    return (
      <div className="container" style={{ padding: '64px 0' }}>
        <h1>Sem permissão</h1>
        <p>Não tem acesso a esta área.</p>
      </div>
    );
  }

  return children;
}
