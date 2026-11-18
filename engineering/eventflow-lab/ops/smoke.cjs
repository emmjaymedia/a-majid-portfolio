const assert = require('node:assert/strict');
const { setTimeout: delay } = require('node:timers/promises');
const origin = process.env.API_ORIGIN || 'http://127.0.0.1:4000';

async function request(path, options) {
  const response = await fetch(origin + path, options);
  assert.ok(response.ok, path + ' returned ' + response.status);
  return response.json();
}

async function smoke() {
  await request('/ready');
  for (const [kind, scenario, status, attempts] of [
    ['payment', 'normal', 'Completed', 1],
    ['onboarding', 'transient', 'Completed', 2],
    ['payment', 'reject', 'Rejected', 1]
  ]) {
    const { id } = await request('/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kind, scenario })
    });
    const deadline = Date.now() + 15000;
    let item;
    do {
      const { events } = await request('/events');
      item = events.find(event => event.id === id);
      if (item?.status === status) break;
      await delay(250);
    } while (Date.now() < deadline);
    assert.equal(item?.status, status);
    assert.equal(item.attempts, attempts);
    console.log(kind, scenario, id, status);
  }
}
smoke().catch(error => { console.error(error); process.exitCode = 1; });
