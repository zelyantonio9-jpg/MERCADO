export function ProducerCard({ name, location, category, verifications = {} }) {
  return (
    <article style={{ borderTop: '1px solid var(--am-line)', paddingTop: 16 }}>
      <strong>{name}</strong>
      <p style={{ margin: '2px 0 8px', fontSize: 14 }}>{location} · {category}</p>
      <ul className="am-verification-list">
        <li data-verified={verifications.identity ? 'true' : 'false'}>
          {verifications.identity ? '✓' : '—'} Identidade verificada
        </li>
        <li data-verified={verifications.businessData ? 'true' : 'false'}>
          {verifications.businessData ? '✓' : '—'} Dados comerciais
        </li>
        <li data-verified={verifications.socialSecurity ? 'true' : 'false'}>
          {verifications.socialSecurity ? '✓' : '—'} Segurança Social verificada
        </li>
      </ul>
    </article>
  );
}
