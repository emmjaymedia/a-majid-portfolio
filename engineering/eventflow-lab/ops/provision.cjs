const { queues } = require('../server/store.cjs');
const { SEMP_URL = 'http://127.0.0.1:8080', SOLACE_VPN = 'default',
  SEMP_USER = 'admin', SEMP_PASSWORD } = process.env;
const root = '/SEMP/v2/config/msgVpns/' + encodeURIComponent(SOLACE_VPN) + '/queues';

async function request(method, path, body) {
  const response = await fetch(new URL(path, SEMP_URL), {
    method, headers: {
      Authorization: 'Basic ' + Buffer.from(SEMP_USER + ':' + SEMP_PASSWORD).toString('base64'),
      'Content-Type': 'application/json'
    },
    body: body ? JSON.stringify(body) : undefined,
    signal: AbortSignal.timeout(10000)
  });
  if (response.status === 404 && method === 'GET') return null;
  if (!response.ok) throw new Error(method + ' ' + path + ': ' + await response.text());
  return response.json();
}

async function provision() {
  if (!SEMP_PASSWORD) throw new Error('Set SEMP_PASSWORD');
  for (const queue of Object.values(queues)) {
    const dmq = queue.name.replace('.V1', '.DMQ');
    const common = { ingressEnabled: true, egressEnabled: true, maxMsgSpoolUsage: 100, permission: 'consume' };
    for (const [name, config] of [[dmq, common], [queue.name, { ...common, deadMsgQueue: dmq, maxRedeliveryCount: 3 }]]) {
      const path = root + '/' + encodeURIComponent(name);
      if (await request('GET', path)) await request('PATCH', path, config);
      else await request('POST', root, { queueName: name, accessType: 'exclusive', ...config });
    }
    const subscriptions = root + '/' + encodeURIComponent(queue.name) + '/subscriptions';
    if (!await request('GET', subscriptions + '/' + encodeURIComponent(queue.topic))) {
      await request('POST', subscriptions, { subscriptionTopic: queue.topic });
    }
    console.log(queue.topic + ' → ' + queue.name + ' → ' + dmq);
  }
}
provision().catch(error => { console.error(error.message); process.exitCode = 1; });
