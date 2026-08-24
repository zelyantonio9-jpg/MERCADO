const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Cliente HTTP simples e centralizado. Todas as chamadas ao backend passam
// por aqui, para manter tratamento de erros e envio do token consistentes.
// `credentials: 'include'` é essencial: é o que faz o cookie httpOnly do
// refresh token viajar em cada pedido (login, refresh, logout), mesmo
// sendo frontend e backend origens diferentes em desenvolvimento.
async function request(path, { method = 'GET', body, token } = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.error?.message || 'Ocorreu um erro. Tente novamente.';
    const error = new Error(message);
    error.details = data?.error?.details;
    error.status = response.status;
    throw error;
  }

  return data;
}

export const api = {
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  registerProducer: (payload) => request('/auth/register-producer', { method: 'POST', body: payload }),
  registerTransporter: (payload) => request('/auth/register-transporter', { method: 'POST', body: payload }),
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  // Troca o cookie httpOnly do refresh token por um novo access token.
  // Chamado automaticamente pelo AuthContext ao iniciar a app.
  refresh: () => request('/auth/refresh', { method: 'POST' }),
  logout: () => request('/auth/logout', { method: 'POST' }),

  companies: {
    register: (payload) => request('/companies/register', { method: 'POST', body: payload }),
  },

  // Marketplace — ligado aos endpoints públicos reais do catálogo
  // (backend/src/routes/catalog.routes.js). Sem autenticação necessária.
  marketplace: {
    listCategories: () => request('/categories'),
    listProducts: ({ q, categoria, page } = {}) => {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (categoria) params.set('categoria', categoria);
      if (page) params.set('page', page);
      const qs = params.toString();
      return request(`/products${qs ? `?${qs}` : ''}`);
    },
    getFeaturedProducts: () => request('/products/featured'),
    getProduct: (id) => request(`/products/${id}`),
    getFeaturedProducers: () => request('/producers/featured'),
    getProducer: (id) => request(`/producers/${id}`),
  },

  // Segurança Social (módulo INSS) — scope: 'user' (perfil pessoal) ou
  // 'company' (perfil da empresa a que o utilizador pertence).
  socialSecurity: {
    getProfile: (scope, token) => request(`/social-security/profile?scope=${scope}`, { token }),
    updateProfile: (scope, payload, token) =>
      request(`/social-security/profile?scope=${scope}`, { method: 'PUT', body: payload, token }),
    getStatus: (scope, token) => request(`/social-security/status?scope=${scope}`, { token }),
    listDocuments: (scope, token) => request(`/social-security/documents?scope=${scope}`, { token }),
    requestVerification: (scope, token) =>
      request(`/social-security/verification?scope=${scope}`, { method: 'POST', token }),
    uploadDocument: async (scope, formData, token) => {
      // Upload multipart não passa pelo helper `request` (que assume JSON).
      const response = await fetch(`${API_BASE_URL}/social-security/documents?scope=${scope}`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) {
        const error = new Error(data?.error?.message || 'Não foi possível enviar o documento.');
        error.status = response.status;
        throw error;
      }
      return data;
    },
  },

  // Administração — verificações pendentes.
  adminSocialSecurity: {
    listPending: (token, status = 'PENDING') =>
      request(`/admin/social-security/verifications?status=${status}`, { token }),
    approve: (documentId, token) =>
      request(`/admin/social-security/verifications/${documentId}/approve`, { method: 'POST', token }),
    reject: (documentId, reason, token) =>
      request(`/admin/social-security/verifications/${documentId}/reject`, {
        method: 'POST',
        body: { reason },
        token,
      }),
  },
};
