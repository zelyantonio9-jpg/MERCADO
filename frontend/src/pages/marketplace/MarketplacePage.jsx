import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Header } from '../../components/layout/Header.jsx';
import { Footer } from '../../components/layout/Footer.jsx';
import { ProductCard } from '../../components/home/ProductCard.jsx';
import { api } from '../../services/api.js';

// Catálogo real, ligado ao backend (GET /api/products, /api/categories).
// Sem autenticação — qualquer visitante pode navegar e pesquisar. Estados
// loading/vazio/erro são geridos aqui, nunca produtos inventados.
export function MarketplacePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const categoria = searchParams.get('categoria') || '';
  const page = Number(searchParams.get('page')) || 1;

  const [categories, setCategories] = useState([]);
  const [state, setState] = useState({ status: 'loading', products: [], pagination: null });
  const [searchInput, setSearchInput] = useState(q);

  useEffect(() => {
    api.marketplace.listCategories()
      .then((data) => setCategories(data.categories))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, status: 'loading' }));
    api.marketplace
      .listProducts({ q, categoria, page })
      .then((data) => {
        if (!cancelled) setState({ status: 'ready', products: data.products, pagination: data.pagination });
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'unavailable', products: [], pagination: null });
      });
    return () => {
      cancelled = true;
    };
  }, [q, categoria, page]);

  function handleSearchSubmit(event) {
    event.preventDefault();
    const next = new URLSearchParams(searchParams);
    if (searchInput) next.set('q', searchInput);
    else next.delete('q');
    next.delete('page');
    setSearchParams(next);
  }

  function handleCategoryClick(name) {
    const next = new URLSearchParams(searchParams);
    if (categoria === name) next.delete('categoria');
    else next.set('categoria', name);
    next.delete('page');
    setSearchParams(next);
  }

  function goToPage(nextPage) {
    const next = new URLSearchParams(searchParams);
    next.set('page', nextPage);
    setSearchParams(next);
  }

  return (
    <>
      <Header />
      <main>
        <div className="container" style={{ padding: '40px 0' }}>
          <header className="page-header">
            <h1>Marketplace</h1>
            <p>Pesquise produtos, filtre por categoria e encontre produtores.</p>
          </header>

          <form onSubmit={handleSearchSubmit} className="am-search" style={{ maxWidth: 480, marginBottom: 20 }}>
            <input
              type="search"
              placeholder="O que procura hoje?"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit">Pesquisar</button>
          </form>

          {categories.length > 0 && (
            <div className="am-search__suggestions" style={{ marginBottom: 32 }}>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="am-search__suggestion"
                  style={categoria === c.name ? { borderColor: 'var(--am-forest)', color: 'var(--am-forest)' } : undefined}
                  onClick={() => handleCategoryClick(c.name)}
                >
                  {c.name}
                </button>
              ))}
            </div>
          )}

          {state.status === 'loading' && <p>A carregar produtos...</p>}

          {state.status === 'unavailable' && (
            <div className="am-empty-state">
              Não foi possível carregar o marketplace neste momento. Tente novamente mais tarde.
            </div>
          )}

          {state.status === 'ready' && state.products.length === 0 && (
            <div className="am-empty-state">
              {q || categoria
                ? 'Não encontrámos produtos para esta pesquisa.'
                : 'Ainda não há produtos publicados. Os primeiros produtores estão a preparar os seus catálogos.'}
            </div>
          )}

          {state.status === 'ready' && state.products.length > 0 && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 24 }}>
                {state.products.map((p) => (
                  <ProductCard key={p.id} {...p} />
                ))}
              </div>

              {state.pagination && state.pagination.totalPages > 1 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 32 }}>
                  <button
                    className="btn btn-secondary"
                    disabled={state.pagination.page <= 1}
                    onClick={() => goToPage(state.pagination.page - 1)}
                  >
                    Anterior
                  </button>
                  <span style={{ alignSelf: 'center', fontSize: 14 }}>
                    Página {state.pagination.page} de {state.pagination.totalPages}
                  </span>
                  <button
                    className="btn btn-secondary"
                    disabled={state.pagination.page >= state.pagination.totalPages}
                    onClick={() => goToPage(state.pagination.page + 1)}
                  >
                    Seguinte
                  </button>
                </div>
              )}
            </>
          )}

          <p style={{ marginTop: 32 }}>
            <Link to="/vender">Tem produtos para vender? Comece por aqui →</Link>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
