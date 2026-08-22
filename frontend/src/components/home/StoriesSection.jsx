// Estrutura preparada para histórias reais de produtores. Enquanto não
// existirem testemunhos reais recolhidos, mostra um placeholder explícito
// em vez de inventar depoimentos.
export function StoriesSection() {
  return (
    <section className="am-section am-section--tight" aria-labelledby="am-stories-heading">
      <div className="am-container">
        <span className="am-eyebrow">Histórias</span>
        <h2 id="am-stories-heading">Quem produz também tem uma história.</h2>

        <div className="am-story-placeholder">
          As histórias dos primeiros produtores do AO MARKET vão aparecer aqui.
        </div>
      </div>
    </section>
  );
}
