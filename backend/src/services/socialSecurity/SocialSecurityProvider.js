// Interface conceptual que qualquer provider de Segurança Social deve
// respeitar. JavaScript não tem interfaces formais — isto documenta o
// contrato e serve de guia para quem implementar um novo provider.
//
// Um provider NUNCA deve:
// - inventar respostas;
// - fazer scraping de portais oficiais;
// - guardar credenciais do INSS de utilizadores;
// - devolver "verified: true" sem uma fonte oficial real por trás.
//
// Métodos que um provider pode implementar (todos assíncronos):
//
//   async isAvailable(): Promise<boolean>
//     Indica se este provider está operacional (ex: API oficial configurada
//     e acessível). O ManualProvider devolve sempre true (é sempre possível
//     seguir o fluxo documental). O INSSProvider devolve false enquanto
//     INSS_INTEGRATION_ENABLED=false.
//
//   async verifyNISS(niss): Promise<{ available: boolean, valid?: boolean }>
//     Verificação formal do número junto da fonte oficial. Não implementado
//     enquanto não existir API oficial — deve devolver { available: false }.
//
//   async getContributorStatus(niss): Promise<{ available: boolean, status?: string }>
//     Situação contributiva. Idem.
//
//   async verifyIdentity(payload): Promise<{ available: boolean, valid?: boolean }>
//     Verificação de identidade associada ao NISS. Idem.
//
//   async getContributionStatus(niss): Promise<{ available: boolean, status?: string }>
//     Estado das contribuições. Idem.
//
// Este ficheiro não exporta código executável — é a documentação do
// contrato que ManualProvider e INSSProvider implementam.
export const SOCIAL_SECURITY_PROVIDER_CONTRACT = Object.freeze({
  methods: ['isAvailable', 'verifyNISS', 'getContributorStatus', 'verifyIdentity', 'getContributionStatus'],
});
