import { Routes, Route } from 'react-router-dom';
import { HomePage } from '../pages/HomePage.jsx';
import { LoginPage } from '../pages/LoginPage.jsx';
import { RegisterPage } from '../pages/RegisterPage.jsx';
import { SocialSecurityPage } from '../pages/socialSecurity/SocialSecurityPage.jsx';
import { SocialSecurityAdminPage } from '../pages/socialSecurity/SocialSecurityAdminPage.jsx';
import { MarketplacePage } from '../pages/marketplace/MarketplacePage.jsx';
import { ProductDetailPage } from '../pages/marketplace/ProductDetailPage.jsx';
import { SellerOnboardingPage } from '../pages/onboarding/SellerOnboardingPage.jsx';
import { TransporterOnboardingPage } from '../pages/onboarding/TransporterOnboardingPage.jsx';
import { BusinessOnboardingPage } from '../pages/onboarding/BusinessOnboardingPage.jsx';
import { HowItWorksPage } from '../pages/HowItWorksPage.jsx';
import { NotFoundPage } from '../pages/NotFoundPage.jsx';
import { RequireAuth } from '../components/RequireAuth.jsx';

// Estrutura de rotas. Todas ligadas a funcionalidade real (nenhuma
// aponta para um "em construção" genérico) — ver docs/WORKFLOW.md para
// o que falta em cada fase (ex: carrinho/checkout ainda não existem,
// por isso o botão "Adicionar ao carrinho" em ProductDetailPage fica
// desativado com uma explicação, em vez de fingir funcionar).
//
// Rotas de Segurança Social exigem sessão — <RequireAuth> valida contra
// o AuthContext (que por sua vez confia só no que o backend confirma via
// cookie httpOnly, nunca em estado local não verificado). A área de
// administração exige ainda a permissão social_security.verify; mesmo
// assim, a aplicação real da regra continua a ser o backend — isto é
// só para não mostrar UI a quem sabe de antemão que vai levar 403.
export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/entrar" element={<LoginPage />} />
      <Route path="/criar-conta" element={<RegisterPage />} />

      <Route path="/marketplace" element={<MarketplacePage />} />
      <Route path="/marketplace/produto/:id" element={<ProductDetailPage />} />
      <Route path="/vender" element={<SellerOnboardingPage />} />
      <Route path="/transportar" element={<TransporterOnboardingPage />} />
      <Route path="/empresas" element={<BusinessOnboardingPage />} />
      <Route path="/como-funciona" element={<HowItWorksPage />} />

      {/* Segurança Social — perfil pessoal (produtor, TCP, transportador) */}
      <Route
        path="/perfil/seguranca-social"
        element={
          <RequireAuth permission="social_security.read">
            <SocialSecurityPage scope="user" />
          </RequireAuth>
        }
      />
      {/* Segurança Social — perfil da empresa */}
      <Route
        path="/empresa/seguranca-social"
        element={
          <RequireAuth permission="social_security.read">
            <SocialSecurityPage scope="company" />
          </RequireAuth>
        }
      />
      {/* Administração — verificações pendentes */}
      <Route
        path="/admin/seguranca-social"
        element={
          <RequireAuth permission="social_security.verify">
            <SocialSecurityAdminPage />
          </RequireAuth>
        }
      />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
