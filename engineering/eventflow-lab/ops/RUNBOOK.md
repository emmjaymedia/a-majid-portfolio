# Messaging design and operations runbook

| Workflow | Durable queue | Topic filter | Dead-message queue | Proposed SLO |
| --- | --- | --- | --- | --- |
| Payment authorization | Q.PAYMENT.V1 | lab/payment/requested/v1 | Q.PAYMENT.DMQ | 99% complete within 2 seconds |
| Entity onboarding | Q.ONBOARDING.V1 | lab/onboarding/requested/v1 | Q.ONBOARDING.DMQ | 99% complete within 5 seconds |

For a production SLA, confirm with both application owners how the clock starts, which business outcomes qualify, expected burst volume, and how exclusions are approved. Measure from durable acceptance to terminal completion over a rolling 30-day window. Count past-due valid events and technical dead letters in the denominator. Track invalid business inputs separately. The dashboard shows a latest-100-event completion latency sample and separate failure counts.

## Design review checklist

- Topic format is environment/domain/action/version. Keep tenant details and personal data out of topics. Apply exact subscriptions to each workflow queue. Add a separate subscriber queue to fan out to another integration.
- Use persistent messages, a bounded spool quota, three redeliveries and one dead-message queue per workflow. Match settlement capabilities to the target broker. Confirm the queue has ingress and egress enabled and a matching subscription after every rollout.
- Review envelope compatibility, producer and consumer ownership, ordering needs, business idempotency, provider timeouts and recovery authorization. Roll out schema changes side by side on versioned topics when a change breaks the contract.
- Deliver at least once. Domain side effects in a real service need transactionally persisted idempotency before the broker acknowledgment. The lab's one-replica SQLite design preserves ownership of its local state.

## Diagnose a failed delivery

| Symptom | Inspect | Action |
| --- | --- | --- |
| Pending outbox | /ready, NestJS logs, VPN identity, network and broker session | Restore connection and consumer bindings. Check allowed publish destinations and broker rejected-publish details. |
| Publisher ACK with no consumer progress | Subscription, spool depth, oldest message age, egress and active flow | Confirm exact topic and queue. Enable expected egress through approved change control. |
| Depth rising | Ingress/egress rates, unacknowledged count, store latency | Check consumer throughput and dependency failures. Throttle producers before spool exhaustion. |
| Dead messages | Broker Manager queue count, event ID, envelope version and app outcome | Preserve sample metadata, fix the route or consumer, reconcile business state, then approve replay with the application owner. |
| Pod unready | Kubernetes events, pod logs, PVC and service endpoints | Check volume attach, secret reference, DNS, TLS and broker egress. A broker outage should affect readiness rather than force restart loops. |

Record the timestamp, VPN, route, event ID, recent change, evidence and incident owner in the handover. Export only sanitized logs. Do not purge a queue to clear a metric. The demo intentionally treats rejected IDs as terminal. A corrected request needs a new event linked to the original, with explicit business approval and deduplication against the external payment reference in a real implementation.

## Patch, upgrade and roll back

1. Confirm supported broker upgrade order and client compatibility in the target release documentation. Pin the image and record version, subscriptions, queue depths, broker storage and TLS expiry.
2. Capture broker configuration with the platform-supported backup procedure and coordinate protection of the message spool separately. Take a consistent SQLite backup with `sqlite3 events.sqlite ".backup eventflow-backup.sqlite"`.
3. Verify restoration in an isolated environment. Exercise normal payment, normal onboarding, transient retry and permanent rejection. Capture the UUID and expected terminal result. Compare queue depth and latency before and after the change.
4. Respect HA node sequencing on managed environments. On the single lab broker, schedule downtime, pause producers if needed, upgrade and provision only reviewed changes. Run smoke checks and validate queue drain. Follow the vendor's version-specific rollback procedure if validation fails.

## Recovery and OKE handover

Use `docker build -f ops/Dockerfile -t eventflow-api:lab .` for the API. On OKE, publish the image to OCIR using a pinned tag or digest, use the appropriate OCI block volume StorageClass, and create the eventflow-solace Secret with the four application connection values. Restrict network paths between application pods and private broker endpoints. Keep runtime and SEMP credentials separate. Apply the template in a test namespace, then verify the PVC, probes, logs and service discovery. Configure the Next.js server with API_ORIGIN before building for the target service.

Agree on RPO/RTO and perform a timed restore drill. Check backups are readable, restore broker configuration and application data in isolation, reconcile in-flight and accepted events against broker and business records, and confirm duplicate suppression. A configuration export alone does not restore the guaranteed-message spool. Capture actual recovery time and observed event loss before approving the handover.
