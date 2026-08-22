import { Link } from 'react-router-dom';

export function CategoryCard({ name, slug }) {
  return (
    <Link to={`/marketplace?categoria=${slug}`} className="am-category-card">
      <div className="am-category-card__frame" aria-hidden="true">
        Foto
      </div>
      <span className="am-category-card__name">{name}</span>
    </Link>
  );
}
