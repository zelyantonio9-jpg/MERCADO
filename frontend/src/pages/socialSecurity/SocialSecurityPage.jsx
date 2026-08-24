import { useEffect, useState } from 'react';
import { api } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { VerificationBadge } from '../../components/VerificationBadge.jsx';

// Página "Segurança Social" — usada no perfil do produtor, do trabalhador
// por conta própria, do transportador, e no perfil da empresa (passando
// scope="company"). A interface é deliberadamente simples: estado atual,
// pergunta inicial, e ação seguinte — sem gráficos nem elementos decorativos.
export function SocialSecurityPage({ scope = 'user' }) {
  const { accessToken: token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [profileData, documentsData] = await Promise.all([
          api.socialSecurity.getProfile(scope, token),
          api.socialSecurity.listDocuments(scope, token),
        ]);
        if (!cancelled) {
          setProfile(profileData.profile);
          setDocuments(documentsData.documents);
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [scope, token]);

  async function handleDeclare(declaredEnrolled) {
    setError(null);
    try {
      const niss = declaredEnrolled ? window.prompt('Indique o NISS (Número de Identificação da Segurança Social):') : undefined;
      const data = await api.socialSecurity.updateProfile(scope, { declaredEnrolled, niss: niss || undefined }, token);
      setProfile(data.profile);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUpload(event) {
    event.preventDefault();
    const fileInput = event.target.elements.document;
    const typeInput = event.target.elements.type;

    if (!fileInput.files[0]) {
      setError('Escolha um ficheiro antes de enviar.');
      return;
    }

    const formData = new FormData();
    formData.append('document', fileInput.files[0]);
    formData.append('type', typeInput.value);

    setError(null);
    try {
      await api.socialSecurity.uploadDocument(scope, formData, token);
      const documentsData = await api.socialSecurity.listDocuments(scope, token);
      setDocuments(documentsData.documents);
      event.target.reset();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleRequestVerification() {
    setError(null);
    try {
      const data = await api.socialSecurity.requestVerification(scope, token);
      setProfile(data.profile);
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <p>A carregar...</p>;

  return (
    <div className="container">
      <header className="page-header">
        <h1>Segurança Social</h1>
      </header>

      {error && <p className="error-text">{error}</p>}

      {profile && (
        <section style={{ marginBottom: 24 }}>
          <VerificationBadge status={profile.status} verificationLevel={profile.verificationLevel} />
          {profile.nissMasked && <p>NISS: {profile.nissMasked}</p>}
          {profile.lastVerifiedAt && <p>Última verificação: {new Date(profile.lastVerifiedAt).toLocaleDateString('pt-PT')}</p>}
        </section>
      )}

      {profile?.status === 'NOT_REGISTERED' && (
        <section style={{ marginBottom: 24 }}>
          <h2>Está inscrito no INSS?</h2>
          <button className="btn btn-primary" onClick={() => handleDeclare(true)}>Sim</button>{' '}
          <button className="btn btn-secondary" onClick={() => handleDeclare(false)}>Não</button>{' '}
          <button className="btn btn-secondary" onClick={() => handleDeclare(null)}>Não sei / Informar mais tarde</button>
        </section>
      )}

      {(profile?.status === 'DOCUMENTS_PENDING' || profile?.status === 'REJECTED') && (
        <section style={{ marginBottom: 24 }}>
          <h2>Enviar documento</h2>
          <form onSubmit={handleUpload} style={{ maxWidth: 420 }}>
            <div className="form-field">
              <label htmlFor="type">Tipo de documento</label>
              <input id="type" name="type" required placeholder="ex: declaracao_inss" />
            </div>
            <div className="form-field">
              <label htmlFor="document">Ficheiro (PDF, JPG ou PNG)</label>
              <input id="document" name="document" type="file" accept=".pdf,.jpg,.jpeg,.png" required />
            </div>
            <button type="submit" className="btn btn-primary">Enviar documento</button>
          </form>
        </section>
      )}

      {documents.length > 0 && (
        <section>
          <h2>Documentos enviados</h2>
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => (
                <tr key={doc.id}>
                  <td>{doc.type}</td>
                  <td>{doc.status}{doc.rejectionReason ? ` — ${doc.rejectionReason}` : ''}</td>
                  <td>{new Date(doc.createdAt).toLocaleDateString('pt-PT')}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {profile?.status === 'PENDING_VERIFICATION' && documents.some((d) => d.status === 'PENDING') && (
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={handleRequestVerification}>
              Pedir verificação
            </button>
          )}
        </section>
      )}
    </div>
  );
}
