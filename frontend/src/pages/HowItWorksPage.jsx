import { Header } from '../components/layout/Header.jsx';
import { Footer } from '../components/layout/Footer.jsx';
import { HowItWorks } from '../components/home/HowItWorks.jsx';

export function HowItWorksPage() {
  return (
    <>
      <Header />
      <main>
        <HowItWorks />
      </main>
      <Footer />
    </>
  );
}
