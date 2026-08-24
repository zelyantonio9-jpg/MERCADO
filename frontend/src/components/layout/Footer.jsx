import { Link } from 'react-router-dom';

// Footer institucional. Contactos deixados como placeholders explícitos —
// nunca inventar um telefone/email/localização reais.
export function Footer() {
  return (
    <footer className="am-footer">
      <div className="am-container">
        <div className="am-footer__grid">
          <div>
            <div className="am-footer__brand">AO MARKET</div>
            <p style={{ maxWidth: '32ch' }}>De quem produz. Para quem precisa.</p>
          </div>

          <div>
            <h4>Plataforma</h4>
            <ul>
              <li><Link to="/marketplace">Comprar</Link></li>
              <li><Link to="/vender">Vender</Link></li>
              <li><Link to="/transportar">Transportar</Link></li>
              <li><Link to="/empresas">Empresas</Link></li>
              <li><Link to="/como-funciona">Como funciona</Link></li>
              <li><Link to="/ajuda">Ajuda</Link></li>
            </ul>
          </div>

          <div>
            <h4>Empresa</h4>
            <ul>
              <li><Link to="/sobre">Sobre</Link></li>
              <li><Link to="/termos">Termos</Link></li>
              <li><Link to="/privacidade">Privacidade</Link></li>
              <li><Link to="/contactos">Contactos</Link></li>
            </ul>
          </div>

          <div>
            <h4>Contacto</h4>
            <ul>
              <li>Email: a definir</li>
              <li>Telefone: a definir</li>
              <li>Angola</li>
            </ul>
          </div>
        </div>

        <div className="am-footer__bottom">
          <span>© {new Date().getFullYear()} AO MARKET</span>
          <span>Feito para o comércio angolano</span>
        </div>
      </div>
    </footer>
  );
}
