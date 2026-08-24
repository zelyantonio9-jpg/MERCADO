import { env } from '../../../config/env.js';

// Adapter preparado para uma futura API oficial do INSS.
//
// IMPORTANTE: nenhum destes métodos faz atualmente uma chamada real.
// Não existe API oficial pública documentada e integrada neste projeto.
// Implementar aqui uma chamada fictícia ou fazer scraping do portal do
// INSS violaria os requisitos de segurança e confiança deste módulo.
//
// Quando o INSS disponibilizar oficialmente um serviço técnico e o AO
// MARKET obtiver autorização/credenciais:
//   1. Definir INSS_API_BASE_URL, INSS_API_CLIENT_ID, INSS_API_CLIENT_SECRET
//      nas variáveis de ambiente (nunca no código).
//   2. Implementar cada método abaixo com a chamada HTTP real ao serviço
//      oficial, incluindo autenticação, tratamento de erros e timeouts.
//   3. Mudar INSS_INTEGRATION_ENABLED para "true".
//   4. Só nesse momento o SocialSecurityService passa a usar este provider
//      em vez do ManualProvider, e só nesse momento o sistema pode atribuir
//      verificationLevel = OFFICIAL_VERIFIED.
export const INSSProvider = {
  name: 'INSS_OFFICIAL',

  async isAvailable() {
    return env.inssIntegrationEnabled && Boolean(env.inssApiBaseUrl);
  },

  async verifyNISS() {
    this._assertEnabled();
    // TODO: implementar quando a API oficial estiver disponível.
    throw new Error('Integração oficial com o INSS ainda não está implementada.');
  },

  async getContributorStatus() {
    this._assertEnabled();
    throw new Error('Integração oficial com o INSS ainda não está implementada.');
  },

  async verifyIdentity() {
    this._assertEnabled();
    throw new Error('Integração oficial com o INSS ainda não está implementada.');
  },

  async getContributionStatus() {
    this._assertEnabled();
    throw new Error('Integração oficial com o INSS ainda não está implementada.');
  },

  _assertEnabled() {
    if (!env.inssIntegrationEnabled) {
      throw new Error(
        'INSS_INTEGRATION_ENABLED está desativado. A integração oficial depende da existência de ' +
          'serviços técnicos e autorização do INSS — ver docs/INSS-INTEGRATION.md.'
      );
    }
  },
};
