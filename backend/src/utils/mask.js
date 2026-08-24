// Nunca expor o NISS completo: nem no perfil público, nem em logs,
// nem em mensagens de erro, nem em analytics.
export function maskNiss(last4) {
  if (!last4) return null;
  return `${'•'.repeat(8)}${last4}`;
}
