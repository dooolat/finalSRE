# Production Readiness Review Checklist

## Reliability

- Health and readiness probes are implemented.
- Graceful shutdown is implemented.
- Resource requests and limits are defined.
- HPA and PDB are configured.

## Observability

- Prometheus can scrape `/metrics`.
- Grafana dashboard covers availability, latency, throughput, and uptime.
- Alertmanager rules exist for downtime, error rate, and latency.

## Delivery

- CI validates code on every push and pull request.
- Container image is built in CI.
- Deployment automation is defined for the main branch.

## Operations

- SLI / SLO definitions are documented.
- Load test scenario is included.
- Runbook exists for the main alerts.
- Evidence checklist is prepared for screenshots and defense.
