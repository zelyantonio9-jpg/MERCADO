// Reflete o módulo Segurança Social já implementado: nunca afirma que
// todos os utilizadores são verificados, apenas explica o que PODE
// existir quando a verificação for real.
const TRUST_ITEMS = [
  { title: 'Identidade', text: 'Confirmação dos dados de quem vende ou compra.' },
  { title: 'NIF', text: 'Número de identificação fiscal, quando aplicável.' },
  { title: 'Dados comerciais', text: 'Informação sobre a atividade declarada.' },
  { title: 'Segurança Social', text: 'Situação declarada ou verificada documentalmente.' },
  { title: 'Documentação', text: 'Documentos analisados por um operador autorizado.' },
  { title: 'Perfil empresarial', text: 'Dados da empresa e do seu representante legal.' },
];

export function TrustSection() {
  return (
    <section className="am-section am-section--dark" aria-labelledby="am-trust-heading">
      <div className="am-container">
        <div className="am-section__head">
          <span className="am-eyebrow">Confiança</span>
          <h2 id="am-trust-heading">Comércio com mais confiança.</h2>
          <p style={{ maxWidth: '56ch' }}>
            Perfis e empresas podem apresentar informações verificadas, aumentando a confiança
            entre compradores e vendedores.
          </p>
        </div>

        <div className="am-trust-grid">
          {TRUST_ITEMS.map((item) => (
            <div className="am-trust-item" key={item.title}>
              <h3 style={{ color: 'var(--am-cream)' }}>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
