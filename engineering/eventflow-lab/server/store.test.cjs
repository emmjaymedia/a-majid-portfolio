const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createStore } = require('./store.cjs');

test('outbox survives restart and late broker ACK cannot overwrite completed work', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'eventflow-'));
  const filename = path.join(directory, 'events.sqlite');
  let store = createStore(filename);
  try {
    const event = store.create('payment', 'normal');
    store.close();
    store = createStore(filename);
    assert.equal(store.pending()[0].id, event.id);
    assert.equal(store.receive(event.id, 'payment'), 'ACCEPTED');
    store.sent(event.id);
    assert.equal(store.receive(event.id, 'payment'), 'ACCEPTED');
    assert.equal(store.list()[0].status, 'Completed');
    assert.equal(store.list()[0].attempts, 1);
    assert.equal(store.pending().length, 0);
  } finally {
    store.close();
    fs.rmSync(directory, { recursive: true });
  }
});
test('one transient failure is retried and invalid deliveries are rejected', () => {
  const store = createStore(':memory:');
  try {
    const retry = store.create('onboarding', 'transient');
    store.sent(retry.id);
    assert.equal(store.receive(retry.id, 'payment'), 'REJECTED');
    assert.equal(store.receive(retry.id, 'onboarding'), 'FAILED');
    assert.equal(store.receive(retry.id, 'onboarding'), 'ACCEPTED');
    assert.equal(store.list().find(event => event.id === retry.id).attempts, 2);
    const poison = store.create('payment', 'reject');
    assert.equal(store.receive(poison.id, 'payment'), 'REJECTED');
    assert.equal(store.receive(poison.id, 'payment'), 'REJECTED');
    assert.equal(store.list().find(event => event.id === poison.id).attempts, 1);
  } finally { store.close(); }
});
