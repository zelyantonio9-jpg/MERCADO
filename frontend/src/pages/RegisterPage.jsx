import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api.js';

// Etapa 1 do cadastro do comprador individual (Conta).
// As etapas seguintes — Identificação, Localização, Preferências,
// Verificação — serão implementadas na Fase 3, ligadas ao BuyerProfile.
export function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function updateField(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.register(form);
      navigate('/entrar');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <header className="page-header">
        <h1>Criar conta</h1>
        <p>Etapa 1 de 5 — Conta</p>
      </header>

      <form onSubmit={handleSubmit} style={{ maxWidth: 420 }}>
        <div className="form-field">
          <label htmlFor="fullName">Nome completo</label>
          <input id="fullName" required value={form.fullName} onChange={updateField('fullName')} />
        </div>

        <div className="form-field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" required value={form.email} onChange={updateField('email')} />
        </div>

        <div className="form-field">
          <label htmlFor="phone">Telefone</label>
          <input id="phone" value={form.phone} onChange={updateField('phone')} />
        </div>

        <div className="form-field">
          <label htmlFor="password">Palavra-passe</label>
          <input id="password" type="password" required value={form.password} onChange={updateField('password')} />
        </div>

        <div className="form-field">
          <label htmlFor="confirmPassword">Confirmar palavra-passe</label>
          <input
            id="confirmPassword"
            type="password"
            required
            value={form.confirmPassword}
            onChange={updateField('confirmPassword')}
          />
        </div>

        {error && <p className="error-text">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'A criar conta...' : 'Continuar'}
        </button>

        <p style={{ marginTop: 16 }}>
          Já tens conta? <Link to="/entrar">Entrar</Link>
        </p>
      </form>
    </div>
  );
}
