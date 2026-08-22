import { Component } from 'react';

// Sem isto, um erro de render em qualquer componente deixa a app inteira
// em branco, sem explicação nem forma de recuperar. Um ErrorBoundary é a
// única forma (em React) de apanhar esses erros — não existe equivalente
// via hooks.
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Em produção isto deve ir para um serviço de monitorização de erros
    // do frontend (ex: Sentry) — por agora fica registado na consola.
    console.error('Erro não tratado na interface:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container" style={{ padding: '64px 0', textAlign: 'center' }}>
          <h1>Algo correu mal</h1>
          <p>Ocorreu um erro inesperado. Tente recarregar a página.</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Recarregar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
