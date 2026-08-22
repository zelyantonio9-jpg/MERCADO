import { Link } from 'react-router-dom';

export function ProductCard({ id, name, price, unit, producerName, location }) {
  return (
    <article className="am-product-card">
      <div className="am-product-card__frame" aria-hidden="true">Foto do produto</div>
      <div className="am-product-card__name">{name}</div>
      <div className="am-product-card__meta">{producerName} · {location}</div>
      <div className="am-product-card__price">{price} Kz / {unit}</div>
      <Link to={`/marketplace/produto/${id}`} className="am-product-card__link">Ver produto →</Link>
    </article>
  );
}
