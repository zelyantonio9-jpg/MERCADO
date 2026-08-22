import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../services/api.js';

// Estado de autenticação centralizado. O access token vive só em memória
// (nunca em localStorage — mitiga roubo por XSS); a sessão persiste entre
// recarregamentos de página através do cookie httpOnly do refresh token,
// que o backend lê sozinho em POST /api/auth/refresh.
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  // 'loading' enquanto tenta restaurar a sessão a partir do cookie;
  // só depois disso é seguro decidir se uma rota protegida deve ou não
  // redirecionar para o login.
  const [status, setStatus] = useState('loading');

  const restoreSession = useCallback(async () => {
    try {
      const data = await api.refresh();
      setUser(data.user);
      setAccessToken(data.accessToken);
      setStatus('authenticated');
    } catch {
      setUser(null);
      setAccessToken(null);
      setStatus('unauthenticated');
    }
  }, []);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  async function login(credentials) {
    const data = await api.login(credentials);
    setUser(data.user);
    setAccessToken(data.accessToken);
    setStatus('authenticated');
    return data.user;
  }

  async function logout() {
    try {
      await api.logout();
    } finally {
      setUser(null);
      setAccessToken(null);
      setStatus('unauthenticated');
    }
  }

  return (
    <AuthContext.Provider value={{ user, accessToken, status, login, logout, restoreSession }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>.');
  }
  return context;
}
