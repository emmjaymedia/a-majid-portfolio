const solace = require('solclientjs');
const { queues } = require('./store.cjs');
solace.SolclientFactory.init({ profile: solace.SolclientFactoryProfiles.version10, logLevel: solace.LogLevel.WARN });

function connect(store, env = process.env) {
  const session = solace.SolclientFactory.createSession({
    url: env.SOLACE_URL || 'ws://127.0.0.1:8008',
    vpnName: env.SOLACE_VPN || 'default',
    userName: env.SOLACE_USER || 'default',
    password: env.SOLACE_PASSWORD || '',
    connectRetries: -1,
    reconnectRetries: -1
  });
  const bindings = new Map();
  const inFlight = new Map();
  let connected = false;

  session.on(solace.SessionEventCode.UP_NOTICE, () => {
    connected = true;
    if (bindings.size) return;
    for (const [kind, queue] of Object.entries(queues)) {
      const flow = session.createMessageConsumer({
        queueDescriptor: { name: queue.name, type: solace.QueueType.QUEUE, durable: true },
        acknowledgeMode: solace.MessageConsumerAcknowledgeMode.CLIENT,
        requiredSettlementOutcomes: [solace.MessageOutcome.FAILED, solace.MessageOutcome.REJECTED]
      });
      const binding = { flow, up: false };
      bindings.set(kind, binding);
      const codes = solace.MessageConsumerEventName;
      flow.on(codes.UP, () => { binding.up = true; });
      flow.on(codes.RECONNECTED, () => { binding.up = true; });
      for (const code of [codes.DOWN, codes.DOWN_ERROR, codes.CONNECT_FAILED_ERROR, codes.RECONNECTING]) {
        flow.on(code, details => {
          binding.up = false;
          console.error(queue.name, code, String(details));
        });
      }
      flow.on(codes.MESSAGE, message => {
        let id;
        try {
          const payload = JSON.parse(message.getBinaryAttachment().toString());
          if (payload.version === 1 && payload.kind === kind) id = payload.id;
        } catch {
          // Invalid envelopes are sent to the dead-message queue.
        }
        let outcome = 'REJECTED';
        if (typeof id === 'string') {
          try { outcome = store.receive(id, kind); }
          catch (error) {
            console.error('Consumer persistence failed', error.message);
            outcome = 'FAILED';
          }
        }
        message.settle(solace.MessageOutcome[outcome]);
      });
      flow.connect();
    }
  });
  const disconnect = () => {
    connected = false;
    inFlight.clear();
  };
  for (const code of ['DOWN_ERROR', 'CONNECT_FAILED_ERROR', 'RECONNECTING_NOTICE', 'DISCONNECTED']) {
    if (solace.SessionEventCode[code] !== undefined) session.on(solace.SessionEventCode[code], disconnect);
  }
  session.on(solace.SessionEventCode.RECONNECTED_NOTICE, () => { connected = true; });
  session.on(solace.SessionEventCode.ACKNOWLEDGED_MESSAGE, ({correlationKey}) => {
    inFlight.delete(correlationKey);
    store.sent(correlationKey);
  });
  session.on(solace.SessionEventCode.REJECTED_MESSAGE_ERROR, ({correlationKey}) => {
    inFlight.delete(correlationKey);
    console.error('Broker rejected publish', correlationKey);
  });
  session.connect();
  const ready = () => connected && bindings.size === 2 && [...bindings.values()].every(binding => binding.up);
  const timer = setInterval(() => {
    if (!ready()) return;
    for (const event of store.pending()) {
      if (Date.now() - (inFlight.get(event.id) || 0) < 10000) continue;
      const message = solace.SolclientFactory.createMessage();
      message.setDestination(solace.SolclientFactory.createTopicDestination(queues[event.kind].topic));
      message.setDeliveryMode(solace.MessageDeliveryModeType.PERSISTENT);
      message.setCorrelationKey(event.id);
      message.setDMQEligible(true);
      message.setBinaryAttachment(JSON.stringify({ version: 1, id: event.id, kind: event.kind }));
      try {
        session.send(message);
        inFlight.set(event.id, Date.now());
      } catch (error) {
        console.error('Publish deferred', error.message);
        break;
      }
    }
  }, 250);
  return { ready, close() { clearInterval(timer); session.dispose(); } };
}
module.exports = {connect};
