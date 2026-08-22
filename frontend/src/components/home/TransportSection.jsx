import { Link } from 'react-router-dom';

// O motivo "linha de rota" é a assinatura visual da homepage — aqui usado
// literalmente, e ecoado discretamente noutras secções como divisor.
export function TransportSection() {
  return (
    <section className="am-section" aria-labelledby="am-transport-heading">
      <div className="am-container">
        <span className="am-eyebrow">Transporte</span>
        <h2 id="am-transport-heading">Do produtor até à sua porta.</h2>
        <p style={{ maxWidth: '48ch' }}>
          Encontre soluções de transporte para levar os seus produtos até ao destino.
        </p>

        <div className="am-route" aria-hidden="true">
          <div className="am-route__point">
            <span className="am-route__point-label">Origem</span>
            Icolo e Bengo
          </div>
          <div className="am-route__line" />
          <div className="am-route__point" style={{ textAlign: 'right' }}>
            <span className="am-route__point-label">Destino</span>
            Luanda
          </div>
        </div>

        <Link to="/transportar" className="btn btn-primary">Encontrar transporte</Link>
      </div>
    </section>
  );
}
