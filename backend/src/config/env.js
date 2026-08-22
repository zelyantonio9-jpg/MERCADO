import dotenv from 'dotenv';

dotenv.config();

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Variável de ambiente obrigatória em falta: ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4000,
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
  // Curto de propósito: agora que o refresh token funciona de facto
  // (rotação + revogação, ver auth.service.js), o access token não
  // precisa de viver muito — quanto mais curto, menor a janela de abuso
  // se for roubado. O frontend renova-o sozinho via /api/auth/refresh.
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  uploadMaxSizeMb: Number(process.env.UPLOAD_MAX_SIZE_MB) || 5,

  // --- Módulo Segurança Social (INSS) ---
  // Chave usada para cifrar campos sensíveis (ex: NISS) antes de gravar na
  // base de dados. Em produção deve vir de um secret manager.
  socialSecurityEncryptionKey: required(
    'SOCIAL_SECURITY_ENCRYPTION_KEY',
    process.env.NODE_ENV === 'production' ? undefined : 'dev-only-insecure-key-change-me'
  ),
  // Enquanto false, o módulo funciona em modo documental/manual.
  // Só passar a true quando existir uma integração oficial autorizada
  // pelo INSS e as credenciais estiverem configuradas.
  inssIntegrationEnabled: process.env.INSS_INTEGRATION_ENABLED === 'true',
  inssApiBaseUrl: process.env.INSS_API_BASE_URL || null,
  inssApiClientId: process.env.INSS_API_CLIENT_ID || null,
  inssApiClientSecret: process.env.INSS_API_CLIENT_SECRET || null,
};
