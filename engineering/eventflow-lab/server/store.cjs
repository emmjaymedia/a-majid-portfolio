const { DatabaseSync } = require('node:sqlite');
const { randomUUID } = require('node:crypto');

const queues = {
  payment: { name: 'Q.PAYMENT.V1', topic: 'lab/payment/requested/v1', target: 2000 },
  onboarding: { name: 'Q.ONBOARDING.V1', topic: 'lab/onboarding/requested/v1', target: 5000 }
};
const scenarios = ['normal', 'transient', 'reject'];

function createStore(path) {
  const db = new DatabaseSync(path);
  db.exec(`PRAGMA journal_mode=WAL;
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY, kind TEXT NOT NULL, scenario TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Outbox', attempts INTEGER NOT NULL DEFAULT 0,
      created INTEGER NOT NULL, updated INTEGER NOT NULL
    );`);
  const get = db.prepare('SELECT * FROM events WHERE id=?');
  return {
    create(kind, scenario) {
      const now = Date.now();
      const id = randomUUID();
      db.prepare('INSERT INTO events(id,kind,scenario,created,updated) VALUES(?,?,?,?,?)').run(id, kind, scenario, now, now);
      return get.get(id);
    },
    list: () => db.prepare('SELECT * FROM events ORDER BY created DESC LIMIT 100').all(),
    pending: () => db.prepare("SELECT * FROM events WHERE status='Outbox' ORDER BY created LIMIT 25").all(),
    sent(id) {
      db.prepare("UPDATE events SET status='Queued',updated=? WHERE id=? AND status='Outbox'").run(Date.now(), id);
    },
    receive(id, kind) {
      const event = get.get(id);
      if (!event || event.kind !== kind) return 'REJECTED';
      if (event.status === 'Completed') return 'ACCEPTED';
      if (event.status === 'Rejected') return 'REJECTED';
      const attempts = event.attempts + 1;
      const status = event.scenario === 'reject' ? 'Rejected' :
        event.scenario === 'transient' && attempts === 1 ? 'Retrying' : 'Completed';
      db.prepare('UPDATE events SET status=?,attempts=?,updated=? WHERE id=?').run(status, attempts, Date.now(), id);
      return { Rejected: 'REJECTED', Retrying: 'FAILED', Completed: 'ACCEPTED' }[status];
    },
    close: () => db.close()
  };
}
module.exports = { queues, scenarios, createStore };
