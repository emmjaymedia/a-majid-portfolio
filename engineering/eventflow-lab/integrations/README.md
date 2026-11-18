# Integration examples

## Camunda 8

The included BPMN defines a message-started onboarding process with a validate-entity job. An integration consumer would publish the Camunda message from the Solace envelope using event ID as a stable message ID, then settle Solace only after acceptance. Deploy the model and register the worker in an isolated Camunda environment before testing. The included model is a reference and the running lab uses its own synthetic worker.

## MuleSoft Anypoint

Use an HTTP Listener for the upstream request, validate the workflow and map it to the NestJS command API with Transform Message. Preserve the returned event ID as the correlation value in structured logs. Return the accepted ID to the caller. Handle validation failures as client errors and timeouts as an ambiguous write. Do not blindly retry ambiguous payment submissions. A production gateway should require a caller-supplied idempotency key shared with the API.

```dataweave
%dw 2.0
output application/json
---
{
  kind: "onboarding",
  scenario: "normal"
}
```

The fixed mapping targets synthetic onboarding. Keep API credentials in secured Anypoint properties and exercise duplicate requests and timeouts in MUnit before deployment.

## Angular operations widget

Copy `angular/queue-health.component.ts` into an Angular 19+ standalone app. Register `provideHttpClient()` in the application providers, import `QueueHealthComponent` into the parent, and render `<lab-queue-health />`. Configure the app's same-origin reverse proxy to forward `/api/events` to the NestJS `/events` endpoint. The widget reads recent outcomes and connection readiness and requires no broker credentials.
