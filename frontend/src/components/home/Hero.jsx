import { Link } from 'react-router-dom';
import { SearchBar } from './SearchBar.jsx';

// Hero assimétrico: texto + pesquisa à esquerda (mais peso), composição
// visual à direita. A imagem é um placeholder claramente identificado —
// deve ser substituída por fotografia editorial real do contexto angolano
// (produtor, mercado, logística) antes do lançamento.
export function Hero() {
  return (
    <section className="am-hero">
      <div className="am-hero__grid">
        <div>
          <h1>O que Angola produz, agora mais perto de si.</h1>
          <p className="am-hero__sub">
            Encontre produtos, produtores, empresas e soluções de transporte num só lugar.
          </p>

          <SearchBar />

          <div className="am-hero__ctas">
            <Link to="/marketplace" className="btn btn-primary">Começar a comprar</Link>
            <Link to="/vender" className="btn btn-secondary">Quero vender</Link>
          </div>
        </div>

        <div className="am-hero__visual" role="img" aria-label="Composição fotográfica de produtor e comércio angolano (a substituir por fotografia real)">
          <p className="am-hero__visual-placeholder">
            Espaço reservado para fotografia editorial<br />(produtor · mercado · logística)
          </p>
          <span className="am-hero__visual-caption">Fotografia a confirmar</span>
        </div>
      </div>
    </section>
  );
}
