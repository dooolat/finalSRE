# Observability Deployment Notes

This repository supports two observability paths:

## 1. Local Demo Path

Use Docker Compose when you want a simple local demo with:

- application container
- Prometheus
- Grafana
- Alertmanager

Command:

```bash
docker compose -f observability/docker-compose.yml up -d --build
```

## 2. Kubernetes Cluster Path

The base application deployment is applied with:

```bash
kubectl apply -k k8s/base
```

If the cluster already has Prometheus Operator, apply the ServiceMonitor:

```bash
kubectl apply -k observability/k8s
```

This split keeps the repository easy to run on a student laptop while still supporting a cluster-oriented demo.
