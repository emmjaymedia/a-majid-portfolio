require('reflect-metadata');
const { Controller, Get, Post, Body, Module, BadRequestException, ServiceUnavailableException } = require('@nestjs/common');
const { NestFactory } = require('@nestjs/core');
const { createStore, queues, scenarios } = require('./store.cjs');
const { connect } = require('./broker.cjs');

async function main() {
  const store = createStore(process.env.DB_FILE || 'events.sqlite');
  const broker = connect(store);
  class EventsController {
    health() { return { status: 'alive' }; }
    readiness() {
      if (!broker.ready()) throw new ServiceUnavailableException('Broker or consumer bindings unavailable');
      return { status: 'ready' };
    }
    dashboard() {
      return { mode: 'Solace', ready: broker.ready(), queues, events: store.list() };
    }
    submit(body) {
      if (!body || !Object.hasOwn(queues, body.kind) || !scenarios.includes(body.scenario)) {
        throw new BadRequestException('Choose a supported workflow and scenario');
      }
      return store.create(body.kind, body.scenario);
    }
  }
  Controller()(EventsController);
  for (const [verb, route, method] of [
    [Get, '/health', 'health'], [Get, '/ready', 'readiness'],
    [Get, '/events', 'dashboard'], [Post, '/events', 'submit']
  ]) {
    verb(route)(EventsController.prototype, method, Object.getOwnPropertyDescriptor(EventsController.prototype, method));
  }
  Body()(EventsController.prototype, 'submit', 0);
  class AppModule {}
  Module({ controllers: [EventsController] })(AppModule);
  const app = await NestFactory.create(AppModule);
  await app.listen(Number(process.env.PORT || 4000), '0.0.0.0');
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, async () => {
      await app.close();
      broker.close();
      store.close();
    });
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
