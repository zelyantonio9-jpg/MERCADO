import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Header } from '../../components/layout/Header.jsx';
import { Footer } from '../../components/layout/Footer.jsx';
import { api } from '../../services/api.js';

export function ProductDetailPage() {
  const { id } = useParams();
  const [state, setState] = useState({ status: 'loading', product: null });

  useEffect(() => {
    let cancelled = false;
    api.marketplace
      .getProduct(id)
      .then((data) => {
        if (!cancelled) setState({ status: 'ready', product: data.product });
      })
      .catch((err) => {
        if (!cancelled) setState({ status: err.status === 404 ? 'not-found' : 'error', product: null });
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  return (
    <>
      <Header />
      <main>
        <div className="container" style={{ padding: '40px 0' }}>
          {state.status === 'loading' && <p>A carregar produto...</p>}

          {state.status === 'not-found' && (
            <div className="am-empty-state">
              Este produto não foi encontrado. Pode já não estar disponível.
              <br />
              <Link to="/marketplace">← Voltar ao marketplace</Link>
            </div>
          )}

          {state.status === 'error' && (
            <div className="am-empty-state">Não foi possível carregar este produto agora.</div>
          )}

          {state.status === 'ready' && state.product && (
            <>
              <Link to="/marketplace">← Voltar ao marketplace</Link>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, marginTop: 20 }}>
                <div className="am-product-card__frame" style={{ aspectRatio: '4 / 3' }} aria-hidden="true">
                  Foto do produto
                </div>

                <div>
                  <h1>{state.product.name}</h1>
                  <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--am-forest)' }}>
                    {state.product.price} Kz / {state.product.unit}
                  </p>
                  {state.product.producerName && <p>Produtor: {state.product.producerName}</p>}
                  {state.product.location && <p>Localização: {state.product.location}</p>}
                  {state.product.category && <p>Categoria: {state.product.category}</p>}
                  {state.product.inStock === false && (
                    <p className="error-text">Sem stock disponível de momento.</p>
                  )}
                  {state.product.description && (
                    <p style={{ marginTop: 20 }}>{state.product.description}</p>
                  )}

                  {/* O carrinho/checkout correspondem à Fase 5 do roteiro
                      (docs/WORKFLOW.md) e ainda não estão implementados. */}
                  <button className="btn btn-primary" disabled title="Disponível quando o carrinho estiver implementado (Fase 5)">
                    Adicionar ao carrinho
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
