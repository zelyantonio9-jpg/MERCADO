import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '../../components/layout/Header.jsx';
import { Footer } from '../../components/layout/Footer.jsx';
import { api } from '../../services/api.js';

// Cadastro do produtor/vendedor — cria a conta e o ProducerProfile associado
// (POST /api/auth/register-producer). A publicação de produtos em si
// corresponde à Fase 4 do roteiro e ainda não está implementada.
export function SellerOnboardingPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', password: '', confirmPassword: '',
    businessName: '', sector: '',
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
      await api.registerProducer(form);
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
            <h1>Vender no AO MARKET</h1>
            <p>Crie o seu perfil de produtor/vendedor.</p>
          </header>

          <form onSubmit={handleSubmit} style={{ maxWidth: 440 }}>
            <div className="form-field">
              <label htmlFor="fullName">Nome completo</label>
              <input id="fullName" required value={form.fullName} onChange={updateField('fullName')} />
            </div>

            <div className="form-field">
              <label htmlFor="businessName">Nome do negócio</label>
              <input id="businessName" required value={form.businessName} onChange={updateField('businessName')} />
            </div>

            <div className="form-field">
              <label htmlFor="sector">Setor / o que produz</label>
              <input id="sector" placeholder="ex: hortícolas, pescado, artesanato" value={form.sector} onChange={updateField('sector')} />
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
              {loading ? 'A criar conta...' : 'Criar conta de produtor'}
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
