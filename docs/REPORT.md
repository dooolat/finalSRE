# Final Report: Orders Service Production Readiness Review

## 1. Project Overview

This project is an SRE capstone for a small e-commerce `orders-service`.
The service accepts simple order requests and exposes operational endpoints for health, readiness, and metrics.

The goal of the project is not only to run the service, but also to show that it is ready for a production review.
For this reason, the repository includes Terraform, Kubernetes manifests, CI/CD automation, observability, alerting, load testing, and operational documentation.

## 2. Architecture

The service is a stateless Node.js application.
It runs in containers and can be deployed to Kubernetes.
The main runtime components are:

- application container
- Kubernetes Deployment and Service
- HorizontalPodAutoscaler
- Prometheus
- Grafana
- Alertmanager
- GitHub Actions pipeline

The service exposes the following endpoints:

- `GET /healthz`
- `GET /readyz`
- `GET /products`
- `GET /orders`
- `POST /orders`
- `GET /metrics`

The stateless design makes horizontal scaling easier.
This is useful for SRE work because pod replicas can be increased during traffic spikes.

## 3. Infrastructure as Code

Terraform files are stored in the [terraform](../terraform) directory.
Terraform provisions the Kubernetes namespace, configuration, secret, deployment, service, PDB, and HPA for the application.

For this submission, Terraform uses an explicit local backend.
This choice is simple and safe for a student environment.
It avoids storing cloud credentials in the public repository.
At the same time, a `backend.hcl.example` file is included to show how state can be moved to a remote backend later.

Important Terraform files:

- `versions.tf`
- `variables.tf`
- `main.tf`
- `outputs.tf`
- `terraform.tfvars.example`

## 4. CI/CD Explanation

The CI/CD workflow is implemented with GitHub Actions.
The workflow file is `.github/workflows/ci-cd.yml`.

The pipeline is designed to do the following:

1. run lint and test checks
2. build a Docker image
3. push the image to GitHub Container Registry
4. deploy the latest image to Kubernetes when `KUBECONFIG_B64` is available

The default image naming strategy is based on GHCR and the repository owner.
This removes the earlier placeholder image path problem.

The deployment step is optional and is skipped safely when the kubeconfig secret is not configured.

## 5. Observability Explanation

The project includes Prometheus, Grafana, and Alertmanager configuration.
For local evidence collection, the observability stack is started by Docker Compose.
For a Kubernetes cluster that already has Prometheus Operator, the repository also includes a `ServiceMonitor`.

Prometheus collects metrics from the application `/metrics` endpoint.
Grafana provides a dashboard with:

- availability
- request rate
- p95 latency
- orders created rate
- in-flight requests
- process uptime

Alertmanager is configured with a demo webhook receiver and an example email receiver block.
This keeps the repository safe for public sharing while still showing a real alert routing structure.

## 6. SLIs and SLOs

The SLI and SLO definitions are documented in [SLOS.md](SLOS.md).

Main SLIs:

- availability based on non-5xx responses
- p95 latency
- order creation success rate

Main SLOs:

- `99.5%` availability
- p95 latency below `300 ms`
- `99.0%` successful order creation

The report also defines a simple error budget policy to guide release decisions.

## 7. Autoscaling Strategy

Autoscaling is configured through Kubernetes HPA.
The HPA watches CPU and memory utilization.

For easier demo validation, the configuration uses a lower CPU request and a more sensitive CPU target than before.
This makes it easier to show scaling during a load test on a student laptop cluster.

The expected scaling flow is:

1. baseline replicas start at `2`
2. Locust generates traffic
3. CPU utilization rises
4. HPA increases desired replicas
5. new pods become ready

## 8. Load Testing Strategy

Load testing is performed with Locust.
The scenario is defined in `load/locustfile.py`.

The load test sends product read requests and order creation requests.
For the final demo, the recommended execution is a higher user count than a simple smoke test.
This is important because the service is lightweight and needs stronger traffic to trigger HPA scaling.

Recommended observation during load:

- `kubectl get hpa -w`
- `kubectl get pods -w`
- Grafana dashboard panels

## 9. Incident and Alerting Strategy

The repository includes alert rules for:

- service down
- high 5xx error rate
- high p95 latency

The operational response is documented in [RUNBOOK.md](RUNBOOK.md).
The runbook explains what to check first, how to inspect the deployment, and when rollback should be considered.

For the live demo, one simple way to trigger an alert is to stop the application container in the local Docker Compose stack.
This should cause the `OrdersServiceDown` alert to become active in Prometheus and Alertmanager after the rule delay.

## 10. Screenshots Section

The following screenshots must be added manually before submission:

1. `01-github-actions-success.png`
2. `02-ghcr-image-pushed.png`
3. `03-kubernetes-pods-running.png`
4. `04-service-health-endpoint.png`
5. `05-prometheus-targets-up.png`
6. `06-grafana-sli-dashboard.png`
7. `07-alertmanager-alert-firing.png`
8. `08-hpa-before-load.png`
9. `09-locust-load-test.png`
10. `10-hpa-scaling-during-load.png`
11. `11-scaled-pods-after-load.png`
12. `12-terraform-init-plan-apply.png`

Place them in `docs/evidence/screenshots/`.

## 11. Team Contribution Section

This section is a neutral placeholder and should be edited before the final submission.

Suggested format:

- Student 1: application code, Dockerfile, health endpoints
- Student 2: Kubernetes, Terraform, HPA
- Student 3: Prometheus, Grafana, Alertmanager
- Student 4: CI/CD, report, load testing, demo preparation

If this project is submitted individually, replace the list above with a short solo contribution note.

## 12. Conclusion

This repository now provides a complete and organized base for the final SRE capstone submission.
It includes the required technical components and the main documentation needed for a defense.

The remaining work before grading is mostly manual evidence collection:

- capture real screenshots
- run the GitHub Actions workflow in the public repository
- insert final screenshots into the report if required by the instructor

After those final manual steps, the project can be presented as a structured Production Readiness Review submission.
