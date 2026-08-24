import test from 'node:test';
import assert from 'node:assert/strict';
import { requirePermission } from './rbac.js';

function mockRes() {
  return {};
}

test('Comprador sem permissão social_security.documents.upload é bloqueado (403)', () => {
  const req = { user: { id: 'buyer-1', permissions: ['orders.read', 'cart.read'] } };
  const middleware = requirePermission('social_security.documents.upload');
  let error;
  middleware(req, mockRes(), (err) => { error = err; });

  assert.equal(error.statusCode, 403);
});

test('Utilizador sem social_security.verify não pode aprovar/rejeitar documentos (403)', () => {
  const req = { user: { id: 'producer-1', permissions: ['social_security.read', 'social_security.manage'] } };
  const middleware = requirePermission('social_security.verify');
  let error;
  middleware(req, mockRes(), (err) => { error = err; });

  assert.equal(error.statusCode, 403);
});

test('Operador com social_security.verify pode aceder à área de administração', () => {
  const req = { user: { id: 'admin-1', permissions: ['social_security.verify', 'social_security.read'] } };
  const middleware = requirePermission('social_security.verify');
  let nextCalledWithoutError = false;
  middleware(req, mockRes(), (err) => { nextCalledWithoutError = err === undefined; });

  assert.equal(nextCalledWithoutError, true);
});

test('Produtor com social_security.manage consegue declarar/atualizar o próprio perfil', () => {
  const req = { user: { id: 'producer-1', permissions: ['social_security.read', 'social_security.manage'] } };
  const middleware = requirePermission('social_security.manage');
  let nextCalledWithoutError = false;
  middleware(req, mockRes(), (err) => { nextCalledWithoutError = err === undefined; });

  assert.equal(nextCalledWithoutError, true);
});
