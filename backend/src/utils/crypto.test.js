import test from 'node:test';
import assert from 'node:assert/strict';
import { encryptSensitive, decryptSensitive, lastDigits } from './crypto.js';
import { maskNiss } from './mask.js';

test('encryptSensitive/decryptSensitive: o valor cifrado nunca contém o NISS em texto simples', () => {
  const niss = '12345678901';
  const encrypted = encryptSensitive(niss);

  assert.ok(encrypted);
  assert.ok(!encrypted.includes(niss), 'o texto cifrado não deve conter o NISS em claro');

  const decrypted = decryptSensitive(encrypted);
  assert.equal(decrypted, niss);
});

test('encryptSensitive devolve null para valores vazios', () => {
  assert.equal(encryptSensitive(''), null);
  assert.equal(encryptSensitive(null), null);
});

test('lastDigits devolve apenas os últimos N caracteres', () => {
  assert.equal(lastDigits('12345678901', 3), '901');
  assert.equal(lastDigits(null), null);
});

test('maskNiss nunca expõe o NISS completo, apenas os últimos dígitos', () => {
  const masked = maskNiss('901');
  assert.equal(masked, '••••••••901');
  assert.ok(!masked.includes('12345678'), 'não deve conter dígitos do NISS original');
});

test('maskNiss devolve null quando não há dados', () => {
  assert.equal(maskNiss(null), null);
});
