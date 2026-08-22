import test from 'node:test';
import assert from 'node:assert/strict';
import { toPublicProfile } from './SocialSecurityFormatters.js';

// Este teste corre sem base de dados: valida apenas a função pura que
// formata a saída pública do perfil, garantindo que:
// 1. o NISS nunca sai em texto simples;
// 2. nunca se mostra "verificação oficial" sem verificationLevel = OFFICIAL_VERIFIED.
test('toPublicProfile nunca expõe nissEncrypted, apenas a versão mascarada', () => {
  const profile = {
    id: 'profile-1',
    status: 'VERIFIED',
    verificationLevel: 'DOCUMENT_VERIFIED',
    declaredEnrolled: true,
    category: 'Trabalhador por conta própria',
    activity: 'Comércio',
    nissEncrypted: 'iv:tag:ciphertext-nao-deve-aparecer',
    nissLast4: '901',
    lastVerifiedAt: new Date('2026-08-21'),
    updatedAt: new Date('2026-08-21'),
  };

  const publicProfile = toPublicProfile(profile);

  assert.equal(publicProfile.nissMasked, '••••••••901');
  assert.equal('nissEncrypted' in publicProfile, false, 'nissEncrypted nunca deve estar na resposta pública');
  assert.equal('nissLast4' in publicProfile, false, 'nissLast4 bruto nunca deve estar na resposta pública');
});

test('toPublicProfile com nível DOCUMENT_VERIFIED nunca deve ser confundido com verificação oficial', () => {
  const profile = {
    id: 'profile-2',
    status: 'VERIFIED',
    verificationLevel: 'DOCUMENT_VERIFIED',
    nissLast4: '123',
    updatedAt: new Date(),
  };

  const publicProfile = toPublicProfile(profile);

  assert.equal(publicProfile.verificationLevel, 'DOCUMENT_VERIFIED');
  assert.notEqual(publicProfile.verificationLevel, 'OFFICIAL_VERIFIED');
});
