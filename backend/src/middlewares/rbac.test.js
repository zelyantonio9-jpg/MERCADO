import test from 'node:test';
import assert from 'node:assert/strict';
import { requirePermission } from './rbac.js';

function mockRes() {
  return {};
}

test('requirePermission bloqueia pedido sem utilizador autenticado (401)', () => {
  const req = {};
  const middleware = requirePermission('orders.read');
  let errorPassed;
  middleware(req, mockRes(), (err) => { errorPassed = err; });

  assert.equal(errorPassed.statusCode, 401);
});

test('requirePermission bloqueia utilizador sem a permissão exigida (403)', () => {
  const req = { user: { id: 'user-1', permissions: ['cart.read'] } };
  const middleware = requirePermission('orders.read');
  let errorPassed;
  middleware(req, mockRes(), (err) => { errorPassed = err; });

  assert.equal(errorPassed.statusCode, 403);
});

test('requirePermission permite utilizador com a permissão exigida', () => {
  const req = { user: { id: 'user-1', permissions: ['orders.read'] } };
  const middleware = requirePermission('orders.read');
  let nextCalledWithoutError = false;
  middleware(req, mockRes(), (err) => { nextCalledWithoutError = err === undefined; });

  assert.equal(nextCalledWithoutError, true);
});

test('requirePermission aceita se pelo menos uma das permissões coincidir', () => {
  const req = { user: { id: 'user-1', permissions: ['company.orders.approve'] } };
  const middleware = requirePermission('orders.read', 'company.orders.approve');
  let nextCalledWithoutError = false;
  middleware(req, mockRes(), (err) => { nextCalledWithoutError = err === undefined; });

  assert.equal(nextCalledWithoutError, true);
});
