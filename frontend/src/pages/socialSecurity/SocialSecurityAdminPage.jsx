import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';

// Administração → Segurança Social → Verificações pendentes.
// Acessível apenas a operadores com a permissão social_security.verify
// (o backend valida isto de forma independente do frontend).
export function SocialSecurityAdminPage() {
  const { accessToken: token } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.adminSocialSecurity.listPending(token);
      setDocuments(data.documents);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleApprove(documentId) {
    setError(null);
    try {
      await api.adminSocialSecurity.approve(documentId, token);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleReject(documentId) {
    const reason = window.prompt('Motivo da rejeição (obrigatório):');
    if (!reason) return;
    setError(null);
    try {
      await api.adminSocialSecurity.reject(documentId, reason, token);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p>A carregar...</p>;

  return (
    <div className="container">
      <header className="page-header">
        <h1>Segurança Social — Verificações pendentes</h1>
      </header>

      {error && <p className="error-text">{error}</p>}

      {documents.length === 0 && <p>Não há verificações pendentes.</p>}

      {documents.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Utilizador / Empresa</th>
              <th>Tipo de documento</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {documents.map((doc) => (
              <tr key={doc.id}>
                <td>
                  {doc.profile.ownerType === 'USER'
                    ? `${doc.profile.user?.fullName} (${doc.profile.user?.email})`
                    : `${doc.profile.company?.legalName} (NIF ${doc.profile.company?.nif})`}
                </td>
                <td>{doc.type}</td>
                <td>{new Date(doc.createdAt).toLocaleDateString('pt-PT')}</td>
                <td>
                  <button className="btn btn-primary" onClick={() => handleApprove(doc.id)}>Aprovar</button>{' '}
                  <button className="btn btn-secondary" onClick={() => handleReject(doc.id)}>Rejeitar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
