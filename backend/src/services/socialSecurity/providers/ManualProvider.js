// Provider "documental/manual": é o que está ativo enquanto não existir uma
// integração oficial com o INSS. Nunca simula uma resposta do INSS — é
// explícito que nenhuma verificação oficial está disponível, e que o
// caminho correto é o fluxo documental (upload + revisão por um operador
// autorizado do AO MARKET).
export const ManualProvider = {
  name: 'MANUAL',

  async isAvailable() {
    return true; // o fluxo documental está sempre disponível.
  },

  async verifyNISS() {
    return { available: false, reason: 'Sem integração oficial com o INSS configurada. Utilize o fluxo documental.' };
  },

  async getContributorStatus() {
    return { available: false, reason: 'Sem integração oficial com o INSS configurada.' };
  },

  async verifyIdentity() {
    return { available: false, reason: 'Sem integração oficial com o INSS configurada.' };
  },

  async getContributionStatus() {
    return { available: false, reason: 'Sem integração oficial com o INSS configurada.' };
  },
};
