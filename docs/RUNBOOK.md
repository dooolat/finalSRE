# Runbook

## OrdersServiceDown

1. Confirm pod health with `kubectl get pods -n orders-prod`.
2. Check rollout state with `kubectl rollout status deployment/orders-service -n orders-prod`.
3. Inspect recent logs with `kubectl logs deployment/orders-service -n orders-prod --tail=200`.
4. Validate image availability and registry credentials if new pods cannot start.

## OrdersServiceHighErrorRate

1. Open the Grafana dashboard and isolate the route causing 5xx responses.
2. Check recent deployment history and compare the current image tag with the last healthy release.
3. Roll back the deployment if the error rate correlates with a new release.
4. Verify whether the issue is route-specific or affects all traffic.

## OrdersServiceHighLatencyP95

1. Confirm whether latency is isolated to `POST /orders` or affects every endpoint.
2. Check pod count and HPA status to see whether the service is already scaling.
3. Increase replicas or resource requests if the service is CPU-starved.
4. If latency continues after scaling, inspect application logs and cluster resource contention.
