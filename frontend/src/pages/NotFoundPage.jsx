import { Link } from 'react-router-dom';
import { Header } from '../components/layout/Header.jsx';
import { Footer } from '../components/layout/Footer.jsx';

export function NotFoundPage() {
  return (
    <>
      <Header />
      <main>
        <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
          <h1>Página não encontrada</h1>
          <p>O endereço que procura não existe ou foi movido.</p>
          <Link to="/" className="btn btn-primary">Voltar ao início</Link>
        </div>
      </main>
      <Footer />
    </>
  );
}
