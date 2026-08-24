import crypto from 'node:crypto';

// Funções puras extraídas de auth.service.js para poderem ser testadas
// sem depender do Prisma. auth.service.js importa e usa estas mesmas
// funções — não há lógica duplicada.
export function generateOpaqueToken() {
  return crypto.randomBytes(48).toString('hex');
}

export function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

export function parseDurationToMs(duration) {
  const match = /^(\d+)([smhd])$/.exec(duration);
  if (!match) return 30 * 24 * 60 * 60 * 1000;
  const value = Number(match[1]);
  const unit = match[2];
  const unitMs = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return value * unitMs[unit];
}
