import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

// Header profissional e enxuto: logo, navegação principal, entrar/criar
// conta — ou nome do utilizador + sair, quando há sessão. No mobile,
// colapsa para logo + menu (não um header gigantesco).
export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, status, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    setMenuOpen(false);
    navigate('/');
  }

  return (
    <header className="am-header">
      <div className="am-header__bar">
        <Link to="/" className="am-logo">
          AO <span>MARKET</span>
        </Link>

        <nav aria-label="Navegação principal">
          <ul className="am-header__nav">
            <li><Link to="/marketplace">Comprar</Link></li>
            <li><Link to="/vender">Vender</Link></li>
            <li><Link to="/transportar">Transportar</Link></li>
            <li><Link to="/empresas">Empresas</Link></li>
            <li><Link to="/como-funciona">Como funciona</Link></li>
          </ul>
        </nav>

        <div className="am-header__actions">
          {status === 'authenticated' && user ? (
            <>
              <span style={{ fontSize: 14 }}>Olá, {user.fullName?.split(' ')[0]}</span>
              <button type="button" className="btn btn-secondary" onClick={handleLogout}>Sair</button>
            </>
          ) : (
            <>
              <Link to="/entrar" className="btn btn-secondary">Entrar</Link>
              <Link to="/criar-conta" className="btn btn-primary">Criar conta</Link>
            </>
          )}
          <button
            type="button"
            className="am-header__menu-toggle"
            aria-expanded={menuOpen}
            aria-controls="am-mobile-nav"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="am-mobile-nav" aria-label="Navegação móvel" className="am-header__nav--mobile">
          <Link to="/marketplace" onClick={() => setMenuOpen(false)}>Comprar</Link>
          <Link to="/vender" onClick={() => setMenuOpen(false)}>Vender</Link>
          <Link to="/transportar" onClick={() => setMenuOpen(false)}>Transportar</Link>
          <Link to="/empresas" onClick={() => setMenuOpen(false)}>Empresas</Link>
          <Link to="/como-funciona" onClick={() => setMenuOpen(false)}>Como funciona</Link>
          {status === 'authenticated' && user ? (
            <button type="button" className="btn btn-secondary" onClick={handleLogout}>Sair</button>
          ) : (
            <>
              <Link to="/entrar" onClick={() => setMenuOpen(false)}>Entrar</Link>
              <Link to="/criar-conta" className="btn btn-primary" onClick={() => setMenuOpen(false)}>Criar conta</Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
