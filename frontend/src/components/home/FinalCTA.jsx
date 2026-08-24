import { Link } from 'react-router-dom';

const LINKS = [
  { label: 'Quero comprar', to: '/marketplace' },
  { label: 'Quero vender', to: '/vender' },
  { label: 'Quero transportar', to: '/transportar' },
  { label: 'Quero cadastrar a minha empresa', to: '/empresas' },
];

export function FinalCTA() {
  return (
    <section className="am-final-cta">
      <div className="am-container">
        <h2>O próximo negócio pode começar aqui.</h2>

        <div className="am-final-cta__grid">
          {LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="am-final-cta__link">
              {link.label} →
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
