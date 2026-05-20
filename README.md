# SRE Capstone: Orders Service Production Readiness Review

This repository contains a final SRE capstone project for an e-commerce `orders-service`.
The goal is to show that the service is close to production readiness and can be explained during a live review.

The submission includes:

- `Infrastructure as Code` with Terraform and Kubernetes manifests
- `CI/CD` with GitHub Actions, GHCR image publishing, and optional Kubernetes deployment
- `Observability` with Prometheus, Grafana, Alertmanager, and dashboard provisioning
- `SRE Operations` with SLI/SLO definitions, HPA configuration, Locust load testing, and runbooks
- `Documentation` for the report, evidence, and live defense flow

## Architecture Summary

- The application is a stateless Node.js `orders-service`.
- The service exposes `/healthz`, `/readyz`, and `/metrics` endpoints.
- Kubernetes is used for deployment, service discovery, and autoscaling.
- Terraform provisions the Kubernetes application resources in a reproducible way.
- GitHub Actions runs tests, builds the Docker image, pushes it to GHCR, and can deploy to Kubernetes.
- Prometheus scrapes metrics, Grafana visualizes SLIs, and Alertmanager shows alert routing behavior.

## Repository Structure

```text
.
+-- .github/workflows/ci-cd.yml
+-- docs/
|   +-- ARCHITECTURE.md
|   +-- DEMO.md
|   +-- EVIDENCE.md
|   +-- LOAD_TESTING.md
|   +-- PRR.md
|   +-- REPORT.md
|   +-- REPORT_TEMPLATE.md
|   +-- RUNBOOK.md
|   +-- SLOS.md
|   `-- evidence/screenshots/
+-- k8s/base/
+-- load/
+-- observability/
|   +-- docker-compose.yml
|   +-- k8s/
|   +-- prometheus/
|   +-- alertmanager/
|   `-- grafana/
+-- scripts/
+-- src/
+-- terraform/
`-- test/
```

## Prerequisites

- Node.js `20+`
- Docker Desktop or Docker Engine
- `kubectl`
- A local or remote Kubernetes cluster
- Terraform `1.6+` for native local execution

If Terraform is not installed locally, you can still validate the Terraform files with a Docker-based Terraform container.

## Local Run Instructions

Run tests:

```bash
npm test
```

Run the application directly:

```bash
npm start
```

Smoke test against a running service:

```bash
npm run smoke
```

Main endpoints:

- `GET /healthz`
- `GET /readyz`
- `GET /products`
- `GET /orders`
- `POST /orders`
- `GET /metrics`

## Docker and Observability Instructions

Local observability is provided with Docker Compose:

```bash
docker compose -f observability/docker-compose.yml up -d --build
```

Local URLs:

- Application: `http://localhost:8080`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3000`
- Alertmanager: `http://localhost:9093`

Default Grafana credentials:

- Username: `admin`
- Password: `admin`

This local stack is intended for evidence capture and demo preparation.

## Kubernetes Deployment Instructions

The base Kubernetes manifests deploy the application namespace, config, secret, deployment, service, PDB, and HPA:

```bash
kubectl apply -k k8s/base
kubectl get pods -n orders-prod
kubectl get hpa -n orders-prod
kubectl describe hpa -n orders-prod
```

To test service access locally:

```bash
kubectl port-forward svc/orders-service 18080:80 -n orders-prod
curl http://127.0.0.1:18080/healthz
```

If your cluster uses Prometheus Operator, also apply the ServiceMonitor:

```bash
kubectl apply -k observability/k8s
```

## Terraform Instructions

Terraform in this submission uses an explicit local backend for safety and reproducibility.
The repository also contains [backend.hcl.example](terraform/backend.hcl.example) as a template for moving state to a remote backend later.

Suggested workflow:

```bash
cp terraform/terraform.tfvars.example terraform/terraform.tfvars
terraform -chdir=terraform init
terraform -chdir=terraform plan -var-file=terraform.tfvars
terraform -chdir=terraform apply -var-file=terraform.tfvars
```

The default application image for Terraform and Kubernetes is:

```text
ghcr.io/dooolat/orders-service-sre-capstone:latest
```

Override it in `terraform.tfvars` if you use another repository or image name.

## CI/CD Explanation

The GitHub Actions workflow is defined in [.github/workflows/ci-cd.yml](.github/workflows/ci-cd.yml).

Pipeline stages:

1. Run lint and tests
2. Build the Docker image
3. Push the image to GHCR
4. Deploy to Kubernetes on `main` if `KUBECONFIG_B64` is configured

Required GitHub secret:

- `KUBECONFIG_B64`: base64-encoded kubeconfig for the target cluster

Optional GitHub repository variable:

- `KUBE_NAMESPACE`: override the default deployment namespace `orders-prod`

## Load Testing Instructions

Load testing uses Locust. Full instructions are in [docs/LOAD_TESTING.md](docs/LOAD_TESTING.md).

Typical demo flow:

```bash
kubectl port-forward svc/orders-service 18080:80 -n orders-prod
docker run --rm --network host -v "${PWD}/load:/mnt" locustio/locust -f /mnt/locustfile.py --headless --users 200 --spawn-rate 40 --run-time 5m --host http://127.0.0.1:18080
```

While load is running:

```bash
kubectl get hpa -n orders-prod -w
kubectl get pods -n orders-prod -w
```

## Evidence Checklist

The final manual screenshots must be saved under [docs/evidence/screenshots](docs/evidence/screenshots) and follow the naming rules from [docs/EVIDENCE.md](docs/EVIDENCE.md).

## Contribution Note

The report and demo guide both include a neutral contribution section that can be edited before submission.
If the project is presented individually, replace the team placeholder with a short solo contribution note.

## Defense Demo Flow

The exact live order for the defense is documented in [docs/DEMO.md](docs/DEMO.md).

Recommended short flow:

1. Show repository structure
2. Run tests
3. Start local observability
4. Deploy Kubernetes manifests
5. Show pods and service health
6. Show Prometheus and Grafana
7. Run Locust
8. Show HPA scaling
9. Explain SLOs, alerts, and architecture

## Key Documents

- [Architecture](docs/ARCHITECTURE.md)
- [SLI and SLO Definition](docs/SLOS.md)
- [Runbook](docs/RUNBOOK.md)
- [Load Testing Guide](docs/LOAD_TESTING.md)
- [PRR Checklist](docs/PRR.md)
- [Final Report](docs/REPORT.md)
- [Evidence Checklist](docs/EVIDENCE.md)
- [Demo Guide](docs/DEMO.md)
- [Observability Notes](observability/README.md)
