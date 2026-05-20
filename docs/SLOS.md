# SLI / SLO Definition

## Service Scope

The service represents an `orders-service` in an e-commerce system. It accepts orders and exposes product catalog data.

## SLIs

1. Availability SLI
   Percentage of HTTP requests that do not return `5xx`.

2. Latency SLI
   p95 HTTP latency for all routes measured from `http_request_duration_seconds`.

3. Order Create Success SLI
   Ratio of successful `POST /orders` requests to all `POST /orders` requests.

## SLOs

1. Availability SLO
   `99.5%` of requests succeed without `5xx` in a rolling 30-day window.

2. Latency SLO
   p95 latency remains below `300ms` over a rolling 30-day window.

3. Order Creation SLO
   `99.0%` of `POST /orders` requests succeed in a rolling 30-day window, excluding client-side invalid payloads from the server error budget.

## Error Budget Policy

- Availability monthly error budget: `0.5%`
- If more than `25%` of the budget is burned within 24 hours, freeze risky changes and require additional verification before deployment.
- If more than `50%` is burned within 72 hours, only urgent reliability fixes may be deployed.
