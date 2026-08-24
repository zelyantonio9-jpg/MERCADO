import test from 'node:test';
import assert from 'node:assert/strict';
import { generateOpaqueToken, hashToken, parseDurationToMs } from './tokens.js';

test('generateOpaqueToken gera valores diferentes a cada chamada', () => {
  const a = generateOpaqueToken();
  const b = generateOpaqueToken();
  assert.notEqual(a, b);
  assert.equal(a.length, 96); // 48 bytes em hex = 96 caracteres
});

test('hashToken é determinístico (mesmo input -> mesmo hash)', () => {
  const raw = 'um-token-qualquer';
  assert.equal(hashToken(raw), hashToken(raw));
});

test('hashToken nunca devolve o valor original', () => {
  const raw = 'segredo-do-refresh-token';
  const hashed = hashToken(raw);
  assert.notEqual(hashed, raw);
  assert.ok(!hashed.includes(raw));
});

test('parseDurationToMs converte "30d" corretamente', () => {
  assert.equal(parseDurationToMs('30d'), 30 * 24 * 60 * 60 * 1000);
});

test('parseDurationToMs converte "15m" corretamente', () => {
  assert.equal(parseDurationToMs('15m'), 15 * 60 * 1000);
});

test('parseDurationToMs converte "12h" corretamente', () => {
  assert.equal(parseDurationToMs('12h'), 12 * 60 * 60 * 1000);
});

test('parseDurationToMs usa fallback de 30 dias para formato inválido', () => {
  assert.equal(parseDurationToMs('formato-invalido'), 30 * 24 * 60 * 60 * 1000);
});
