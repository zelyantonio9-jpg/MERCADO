import { useEffect, useState } from 'react';
import { CategoryCard } from './CategoryCard.jsx';
import { api } from '../../services/api.js';

// Lista de reserva: usada apenas se a API de categorias (já real,
// backend/src/routes/catalog.routes.js) estiver indisponível. Assim que
// o backend responde, a lista real substitui esta.
const FALLBACK_CATEGORIES = [
  'Agricultura', 'Frutas', 'Hortícolas', 'Cereais', 'Tubérculos',
  'Carne', 'Pescado', 'Laticínios', 'Produtos transformados', 'Artesanato', 'Outros',
];

export function CategorySection() {
  const [categories, setCategories] = useState(FALLBACK_CATEGORIES.map((name) => ({ id: name, name })));

  useEffect(() => {
    let cancelled = false;
    api.marketplace
      .listCategories()
      .then((data) => {
        if (!cancelled && data.categories?.length > 0) setCategories(data.categories);
      })
      .catch(() => {
        // Mantém a lista de reserva — nunca mostra um estado quebrado aqui.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="am-section" aria-labelledby="am-categories-heading">
      <div className="am-container">
        <div className="am-section__head">
          <span className="am-eyebrow">Categorias</span>
          <h2 id="am-categories-heading">O que procura?</h2>
        </div>

        <div className="am-scroll-row">
          {categories.map((c) => (
            <CategoryCard key={c.id} name={c.name} slug={c.name} />
          ))}
        </div>
      </div>
    </section>
  );
}
