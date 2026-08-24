import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SUGGESTIONS = ['Tomate', 'Milho', 'Banana', 'Arroz', 'Pescado', 'Fornecedores', 'Transportadores'];

// A pesquisa está preparada para o marketplace real (Fase 4). Enquanto essa
// fase não estiver ligada, o envio simplesmente navega para /marketplace
// com o termo na query string — nunca inventa resultados aqui.
export function SearchBar() {
  const navigate = useNavigate();
  const [term, setTerm] = useState('');

  function handleSubmit(event) {
    event.preventDefault();
    const query = term.trim();
    navigate(query ? `/marketplace?q=${encodeURIComponent(query)}` : '/marketplace');
  }

  return (
    <div>
      <form className="am-search" onSubmit={handleSubmit} role="search">
        <label htmlFor="am-search-input" className="sr-only" style={{ position: 'absolute', left: -9999 }}>
          O que procura hoje?
        </label>
        <input
          id="am-search-input"
          type="search"
          placeholder="O que procura hoje?"
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />
        <button type="submit">Pesquisar</button>
      </form>

      <div className="am-search__suggestions">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            className="am-search__suggestion"
            onClick={() => navigate(`/marketplace?q=${encodeURIComponent(s)}`)}
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
