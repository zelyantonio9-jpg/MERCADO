import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductCard } from './ProductCard.jsx';
import { api } from '../../services/api.js';

// Esta secção está preparada para consumir produtos reais da API assim
// que o marketplace (Fase 4) estiver ligado. Enquanto o endpoint não
// existir ou não devolver dados, mostra um estado vazio elegante — nunca
// produtos inventados a fazer-se passar por reais.
export function FeaturedProducts() {
  const [state, setState] = useState({ status: 'loading', products: [] });

  useEffect(() => {
    let cancelled = false;
    api.marketplace
      .getFeaturedProducts()
      .then((data) => {
        if (!cancelled) setState({ status: 'ready', products: data?.products ?? [] });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'unavailable', products: [] });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="am-section" aria-labelledby="am-featured-heading">
      <div className="am-container">
        <div className="am-section__head am-section__head--wide">
          <div>
            <span className="am-eyebrow">Novidades</span>
            <h2 id="am-featured-heading">Produtos que estão a chegar ao mercado</h2>
          </div>
          <Link to="/marketplace" className="btn btn-secondary">Ver marketplace</Link>
        </div>

        {state.status === 'loading' && <p>A carregar produtos...</p>}

        {state.status === 'ready' && state.products.length > 0 && (
          <div className="am-scroll-row">
            {state.products.map((p) => (
              <ProductCard key={p.id} {...p} />
            ))}
          </div>
        )}

        {(state.status === 'unavailable' || (state.status === 'ready' && state.products.length === 0)) && (
          <div className="am-empty-state">
            Ainda estamos a preparar esta secção. Em breve vai poder ver aqui produtos publicados por produtores reais.
          </div>
        )}
      </div>
    </section>
  );
}
