// Os quatro passos são uma sequência real (ordem importa), por isso a
// numeração 01-04 encoda informação verdadeira, não é decoração.
const STEPS = [
  { number: '01', title: 'Encontre', text: 'Pesquise produtos e produtores.' },
  { number: '02', title: 'Escolha', text: 'Compare preço, localização e disponibilidade.' },
  { number: '03', title: 'Compre', text: 'Faça o seu pedido.' },
  { number: '04', title: 'Receba', text: 'Escolha entrega ou levantamento.' },
];

export function HowItWorks() {
  return (
    <section className="am-section am-section--tight" aria-labelledby="am-how-heading">
      <div className="am-container">
        <div className="am-section__head">
          <span className="am-eyebrow">Como funciona</span>
          <h2 id="am-how-heading">Comprar no AO MARKET é simples.</h2>
        </div>

        <ol className="am-steps" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {STEPS.map((step) => (
            <li className="am-step" key={step.number}>
              <div className="am-step__number">{step.number}</div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
