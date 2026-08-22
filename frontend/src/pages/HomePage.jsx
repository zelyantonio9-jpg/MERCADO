import { Header } from '../components/layout/Header.jsx';
import { Footer } from '../components/layout/Footer.jsx';
import { Hero } from '../components/home/Hero.jsx';
import { CategorySection } from '../components/home/CategorySection.jsx';
import { FeaturedProducts } from '../components/home/FeaturedProducts.jsx';
import { ProducerSection } from '../components/home/ProducerSection.jsx';
import { HowItWorks } from '../components/home/HowItWorks.jsx';
import { BusinessSection } from '../components/home/BusinessSection.jsx';
import { SellerSection } from '../components/home/SellerSection.jsx';
import { TransportSection } from '../components/home/TransportSection.jsx';
import { TrustSection } from '../components/home/TrustSection.jsx';
import { StoriesSection } from '../components/home/StoriesSection.jsx';
import { FinalCTA } from '../components/home/FinalCTA.jsx';

// Homepage pública do AO MARKET. Composição editorial: hero assimétrico,
// pesquisa central, categorias e produtos em faixa horizontal, produtores
// com verificação real, e o motivo de "linha de rota" como assinatura
// visual na secção de Transporte.
export function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <CategorySection />
        <FeaturedProducts />
        <ProducerSection />
        <HowItWorks />
        <BusinessSection />
        <SellerSection />
        <TransportSection />
        <TrustSection />
        <StoriesSection />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
