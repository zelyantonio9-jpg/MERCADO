import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      // login() do AuthContext trata do access token (memória) e do
      // cookie httpOnly do refresh token (definido pelo backend) — a
      // página não mexe em nenhum token diretamente.
      await login(form);
      const redirectTo = location.state?.from?.pathname || '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <header className="page-header">
        <h1>Entrar</h1>
      </header>

      <form onSubmit={handleSubmit} style={{ maxWidth: 420 }}>
        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div className="form-field">
          <label htmlFor="password">Palavra-passe</label>
          <input
            id="password"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'A entrar...' : 'Entrar'}
        </button>

        <p style={{ marginTop: 16 }}>
          Ainda não tens conta? <Link to="/criar-conta">Criar conta</Link>
        </p>
      </form>
    </div>
  );
}
