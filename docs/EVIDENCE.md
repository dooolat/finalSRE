# Evidence Checklist

Store the final manual screenshots in `docs/evidence/screenshots/`.
Do not rename them. Use the exact filenames below.

## Required Screenshots

1. `01-github-actions-success.png`
   Show a successful GitHub Actions workflow run with the `quality` and `build-and-publish` jobs.

2. `02-ghcr-image-pushed.png`
   Show the pushed Docker image in GHCR or the GitHub Packages page.

3. `03-kubernetes-pods-running.png`
   Show `kubectl get pods -n orders-prod` with the application pods in `Running` state.

4. `04-service-health-endpoint.png`
   Show access to `/healthz` through the Kubernetes service, for example by `kubectl port-forward`.

5. `05-prometheus-targets-up.png`
   Show the Prometheus targets page with the `orders-service` target in `UP` state.

6. `06-grafana-sli-dashboard.png`
   Show the Grafana dashboard with availability, latency, and throughput panels.

7. `07-alertmanager-alert-firing.png`
   Show an alert firing in Alertmanager.

8. `08-hpa-before-load.png`
   Show `kubectl get hpa -n orders-prod` before the Locust test starts.

9. `09-locust-load-test.png`
   Show the Locust UI or terminal output while traffic is running.

10. `10-hpa-scaling-during-load.png`
    Show the HPA changing replicas during the traffic spike.

11. `11-scaled-pods-after-load.png`
    Show more pods running than the baseline replica count.

12. `12-terraform-init-plan-apply.png`
    Show Terraform initialization and at least the `plan` output. If you also run `apply`, include it in the same capture or add a second terminal screenshot.

## Recommended Capture Commands

Use these commands during evidence collection:

```bash
kubectl get pods -n orders-prod
kubectl get hpa -n orders-prod
kubectl describe hpa -n orders-prod
kubectl port-forward svc/orders-service 18080:80 -n orders-prod
docker compose -f observability/docker-compose.yml ps
terraform -chdir=terraform plan -var-file=terraform.tfvars
```

## Notes

- Real screenshots must be captured manually from your environment.
- Do not use fake or generated screenshots.
- Update [docs/REPORT.md](docs/REPORT.md) after the screenshots are added.
