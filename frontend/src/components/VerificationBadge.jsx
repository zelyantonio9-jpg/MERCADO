// Mostra o estado de verificação de forma honesta: nunca exibe "verificado"
// sem que o nível corresponda a uma verificação real, e distingue sempre
// a origem (declarado / verificado pelo AO MARKET / verificado no INSS).
const LEVEL_LABELS = {
  DECLARED: 'Informação declarada',
  DOCUMENT_VERIFIED: 'Verificado documentalmente pelo AO MARKET',
  OFFICIAL_VERIFIED: 'Verificado junto do INSS',
};

const STATUS_LABELS = {
  NOT_REGISTERED: 'Não informado',
  DECLARED: 'Declarado',
  DOCUMENTS_PENDING: 'Aguarda documentos',
  PENDING_VERIFICATION: 'Em análise',
  VERIFIED: 'Verificado',
  REJECTED: 'Rejeitado',
  EXPIRED: 'Expirado',
  SUSPENDED: 'Suspenso',
};

export function VerificationBadge({ status, verificationLevel }) {
  const isVerified = status === 'VERIFIED';

  return (
    <div className={isVerified ? 'badge badge-verified' : 'badge badge-pending'}>
      <span className="badge-status">
        {isVerified ? '✓ ' : ''}
        {STATUS_LABELS[status] || status}
      </span>
      {verificationLevel && <span className="badge-source">{LEVEL_LABELS[verificationLevel]}</span>}
    </div>
  );
}
