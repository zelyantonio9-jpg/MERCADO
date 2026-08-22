import { useEffect, useState } from 'react';
import { ProducerCard } from './ProducerCard.jsx';
import { api } from '../../services/api.js';

// Só mostra selos de verificação quando existir uma verificação real por
// trás (ver módulo Segurança Social) — nunca por omissão.
export function ProducerSection() {
  const [state, setState] = useState({ status: 'loading', producers: [] });

  useEffect(() => {
    let cancelled = false;
    api.marketplace
      .getFeaturedProducers()
      .then((data) => {
        if (!cancelled) setState({ status: 'ready', producers: data?.producers ?? [] });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'unavailable', producers: [] });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="am-section" aria-labelledby="am-producers-heading">
      <div className="am-container">
        <div className="am-producer">
          <div className="am-producer__photo" aria-hidden="true" />
          <div>
            <span className="am-eyebrow">Produtores</span>
            <h2 id="am-producers-heading">Conheça quem está por trás do produto.</h2>
            <p style={{ maxWidth: '52ch', marginBottom: 24 }}>
              No AO MARKET, pode conhecer os produtores e descobrir de onde vêm os produtos que compra.
            </p>

            {state.status === 'loading' && <p>A carregar produtores...</p>}

            {state.status === 'ready' && state.producers.length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
                {state.producers.map((p) => (
                  <ProducerCard key={p.id} {...p} />
                ))}
              </div>
            )}

            {(state.status === 'unavailable' || (state.status === 'ready' && state.producers.length === 0)) && (
              <div className="am-empty-state">
                Ainda estamos a apresentar os primeiros produtores verificados. Volte em breve.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
