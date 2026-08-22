import crypto from 'node:crypto';
import { env } from '../config/env.js';

// Cifra campos sensíveis (ex: NISS) com AES-256-GCM antes de gravar na
// base de dados. Nunca guardar o NISS em texto simples.
const ALGORITHM = 'aes-256-gcm';

function getKey() {
  // A chave deve ter 32 bytes. Em produção deve vir de um secret manager,
  // nunca de um valor fixo no código.
  const raw = env.socialSecurityEncryptionKey;
  return crypto.createHash('sha256').update(raw).digest();
}

export function encryptSensitive(plainText) {
  if (!plainText) return null;
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(String(plainText), 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // Formato: iv:authTag:ciphertext, tudo em base64.
  return [iv, authTag, encrypted].map((b) => b.toString('base64')).join(':');
}

export function decryptSensitive(payload) {
  if (!payload) return null;
  const [ivB64, authTagB64, dataB64] = payload.split(':');
  if (!ivB64 || !authTagB64 || !dataB64) return null;
  const key = getKey();
  const iv = Buffer.from(ivB64, 'base64');
  const authTag = Buffer.from(authTagB64, 'base64');
  const data = Buffer.from(dataB64, 'base64');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return decrypted.toString('utf8');
}

// Últimos 4 caracteres, para permitir exibição mascarada sem decifrar.
export function lastDigits(value, count = 3) {
  if (!value) return null;
  return String(value).slice(-count);
}
