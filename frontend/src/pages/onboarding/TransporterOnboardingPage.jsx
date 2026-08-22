import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '../../components/layout/Header.jsx';
import { Footer } from '../../components/layout/Footer.jsx';
import { api } from '../../services/api.js';

export function TransporterOnboardingPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', password: '', confirmPassword: '', operatingAreasText: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function updateField(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    const operatingAreas = form.operatingAreasText
      .split(',')
      .map((a) => a.trim())
      .filter(Boolean);

    if (operatingAreas.length === 0) {
      setError('Indique pelo menos uma área de atuação (ex: Luanda, Icolo e Bengo).');
      return;
    }

    setLoading(true);
    try {
      await api.registerTransporter({ ...form, operatingAreas });
      navigate('/entrar');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main>
        <div className="container" style={{ padding: '40px 0' }}>
          <header className="page-header">
            <h1>Transportar no AO MARKET</h1>
            <p>Crie o seu perfil de transportador.</p>
          </header>

          <form onSubmit={handleSubmit} style={{ maxWidth: 440 }}>
            <div className="form-field">
              <label htmlFor="fullName">Nome completo</label>
              <input id="fullName" required value={form.fullName} onChange={updateField('fullName')} />
            </div>

            <div className="form-field">
              <label htmlFor="operatingAreasText">Áreas de atuação</label>
              <input
                id="operatingAreasText"
                required
                placeholder="ex: Luanda, Icolo e Bengo, Bengo"
                value={form.operatingAreasText}
                onChange={updateField('operatingAreasText')}
              />
              <p style={{ fontSize: 13, color: 'var(--am-ink-muted)', margin: '4px 0 0' }}>
                Separe várias áreas por vírgula.
              </p>
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
              <input id="confirmPassword" type="password" required value={form.confirmPassword} onChange={updateField('confirmPassword')} />
            </div>

            {error && <p className="error-text">{error}</p>}

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'A criar conta...' : 'Criar conta de transportador'}
            </button>

            <p style={{ marginTop: 16 }}>
              Já tem conta? <Link to="/entrar">Entrar</Link>
            </p>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}
