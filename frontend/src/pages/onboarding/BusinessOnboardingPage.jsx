import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '../../components/layout/Header.jsx';
import { Footer } from '../../components/layout/Footer.jsx';
import { api } from '../../services/api.js';

const CAPABILITIES = [
  { value: 'COMPRAR', label: 'Comprar' },
  { value: 'VENDER', label: 'Vender' },
  { value: 'TRANSPORTAR', label: 'Transportar' },
];

export function BusinessOnboardingPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    legalName: '', tradeName: '', nif: '', sector: '', phone: '', email: '',
    province: '', municipality: '', address: '',
    legalRepName: '', legalRepBi: '',
    capabilities: [],
    adminFullName: '', adminEmail: '', adminPassword: '', adminConfirmPassword: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function updateField(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  function toggleCapability(value) {
    setForm((f) => ({
      ...f,
      capabilities: f.capabilities.includes(value)
        ? f.capabilities.filter((c) => c !== value)
        : [...f.capabilities, value],
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);

    if (form.capabilities.length === 0) {
      setError('Selecione pelo menos uma forma de utilização (comprar, vender ou transportar).');
      return;
    }

    setLoading(true);
    try {
      await api.companies.register(form);
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
            <h1>Cadastrar empresa</h1>
            <p>Uma empresa pode comprar, vender e transportar no AO MARKET — selecione o que se aplica.</p>
          </header>

          <form onSubmit={handleSubmit} style={{ maxWidth: 520 }}>
            <h2 style={{ fontSize: 18 }}>Dados da empresa</h2>

            <div className="form-field">
              <label htmlFor="legalName">Razão social</label>
              <input id="legalName" required value={form.legalName} onChange={updateField('legalName')} />
            </div>

            <div className="form-field">
              <label htmlFor="tradeName">Nome comercial</label>
              <input id="tradeName" value={form.tradeName} onChange={updateField('tradeName')} />
            </div>

            <div className="form-field">
              <label htmlFor="nif">NIF</label>
              <input id="nif" required value={form.nif} onChange={updateField('nif')} />
            </div>

            <div className="form-field">
              <label htmlFor="sector">Setor de atividade</label>
              <input id="sector" value={form.sector} onChange={updateField('sector')} />
            </div>

            <div className="form-field">
              <label htmlFor="phone">Telefone</label>
              <input id="phone" value={form.phone} onChange={updateField('phone')} />
            </div>

            <div className="form-field">
              <label htmlFor="email">Email corporativo</label>
              <input id="email" type="email" value={form.email} onChange={updateField('email')} />
            </div>

            <div className="form-field">
              <label htmlFor="province">Província</label>
              <input id="province" value={form.province} onChange={updateField('province')} />
            </div>

            <div className="form-field">
              <label htmlFor="municipality">Município</label>
              <input id="municipality" value={form.municipality} onChange={updateField('municipality')} />
            </div>

            <div className="form-field">
              <label htmlFor="address">Endereço</label>
              <input id="address" value={form.address} onChange={updateField('address')} />
            </div>

            <div className="form-field">
              <label htmlFor="legalRepName">Representante legal</label>
              <input id="legalRepName" required value={form.legalRepName} onChange={updateField('legalRepName')} />
            </div>

            <div className="form-field">
              <label htmlFor="legalRepBi">BI do representante</label>
              <input id="legalRepBi" required value={form.legalRepBi} onChange={updateField('legalRepBi')} />
            </div>

            <div className="form-field">
              <label>Como pretende utilizar o AO MARKET?</label>
              {CAPABILITIES.map((c) => (
                <label key={c.value} style={{ display: 'block', fontWeight: 400, marginTop: 6 }}>
                  <input
                    type="checkbox"
                    checked={form.capabilities.includes(c.value)}
                    onChange={() => toggleCapability(c.value)}
                    style={{ width: 'auto', marginRight: 8 }}
                  />
                  {c.label}
                </label>
              ))}
            </div>

            <h2 style={{ fontSize: 18, marginTop: 28 }}>Conta do administrador</h2>
            <p style={{ fontSize: 13.5, color: 'var(--am-ink-muted)' }}>
              Esta conta vai gerir a empresa no AO MARKET (aprovações, utilizadores, pedidos).
            </p>

            <div className="form-field">
              <label htmlFor="adminFullName">Nome completo</label>
              <input id="adminFullName" required value={form.adminFullName} onChange={updateField('adminFullName')} />
            </div>

            <div className="form-field">
              <label htmlFor="adminEmail">Email</label>
              <input id="adminEmail" type="email" required value={form.adminEmail} onChange={updateField('adminEmail')} />
            </div>

            <div className="form-field">
              <label htmlFor="adminPassword">Palavra-passe</label>
              <input id="adminPassword" type="password" required value={form.adminPassword} onChange={updateField('adminPassword')} />
            </div>

            <div className="form-field">
              <label htmlFor="adminConfirmPassword">Confirmar palavra-passe</label>
              <input id="adminConfirmPassword" type="password" required value={form.adminConfirmPassword} onChange={updateField('adminConfirmPassword')} />
            </div>

            {error && <p className="error-text">{error}</p>}

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'A registar empresa...' : 'Registar empresa'}
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
