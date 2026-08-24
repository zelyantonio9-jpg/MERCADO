import { Link } from 'react-router-dom';

const FLOW = ['Criar perfil', 'Publicar produtos', 'Receber pedidos', 'Preparar', 'Entregar'];

export function SellerSection() {
  return (
    <section className="am-section" aria-labelledby="am-seller-heading">
      <div className="am-container">
        <div className="am-split am-split--reverse">
          <div>
            <span className="am-eyebrow">Vender</span>
            <h2 id="am-seller-heading">Tem produtos para vender?</h2>
            <p style={{ maxWidth: '46ch', marginBottom: 20 }}>
              Coloque os seus produtos diante de compradores que procuram fornecedores.
            </p>

            <p style={{ fontSize: 14.5, color: 'var(--am-ink-muted)', marginBottom: 24 }}>
              {FLOW.join('  →  ')}
            </p>

            <Link to="/vender" className="btn btn-primary">Começar a vender</Link>
          </div>

          <div className="am-split__visual" role="img" aria-label="Fotografia de produtor angolano a preparar produtos (a substituir por imagem real)">
            Fotografia a confirmar
          </div>
        </div>
      </div>
    </section>
  );
}
