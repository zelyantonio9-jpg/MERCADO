import { Link } from 'react-router-dom';

export function BusinessSection() {
  return (
    <section className="am-section" aria-labelledby="am-business-heading">
      <div className="am-container">
        <div className="am-split">
          <div>
            <span className="am-eyebrow">Empresas</span>
            <h2 id="am-business-heading">Precisa comprar para o seu negócio?</h2>
            <p style={{ maxWidth: '48ch' }}>
              Restaurantes, hotéis, supermercados, distribuidores, empresas e instituições podem
              encontrar fornecedores no AO MARKET.
            </p>

            <ul className="am-benefit-list">
              <li>Comprar em quantidade</li>
              <li>Encontrar vários fornecedores</li>
              <li>Organizar pedidos</li>
              <li>Solicitar transporte</li>
              <li>Acompanhar entregas</li>
            </ul>

            <Link to="/empresas" className="btn btn-primary">Comprar para a minha empresa</Link>
          </div>

          <div className="am-split__visual" role="img" aria-label="Fotografia de contexto empresarial angolano (a substituir por imagem real)">
            Fotografia a confirmar
          </div>
        </div>
      </div>
    </section>
  );
}
