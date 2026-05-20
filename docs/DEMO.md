# Demo and Defense Guide

## Live Demo Order

1. Show the repository structure in GitHub or in the terminal.
2. Run the automated tests:

```bash
npm test
```

3. Start the local observability stack:

```bash
docker compose -f observability/docker-compose.yml up -d --build
```

4. Deploy the Kubernetes manifests:

```bash
kubectl apply -k k8s/base
```

5. Show the Kubernetes pods and HPA:

```bash
kubectl get pods -n orders-prod
kubectl get hpa -n orders-prod
```

6. Open the service health endpoint through port-forward:

```bash
kubectl port-forward svc/orders-service 18080:80 -n orders-prod
curl http://127.0.0.1:18080/healthz
```

7. Open Prometheus targets and show the `orders-service` target is `UP`.
8. Open the Grafana dashboard and explain the SLI panels.
9. Run the Locust load test:

```bash
docker run --rm --network host -v "${PWD}/load:/mnt" locustio/locust -f /mnt/locustfile.py --headless --users 200 --spawn-rate 40 --run-time 5m --host http://127.0.0.1:18080
```

10. While the test is running, show scaling:

```bash
kubectl get hpa -n orders-prod -w
kubectl get pods -n orders-prod -w
```

11. Show an Alertmanager alert.
   For a simple demo, stop the local `orders-service` container in Docker Compose and wait for the `OrdersServiceDown` alert:

```bash
docker compose -f observability/docker-compose.yml stop orders-service
```

12. Explain the architecture, the SLOs, and the autoscaling logic.

## Likely Defense Questions and Short Answers

### Why did you use Terraform if Kubernetes manifests already exist?

Terraform is used for reproducible provisioning of the application resources.
The raw manifests are kept for direct cluster demo and troubleshooting.

### Why is the Terraform backend local?

This submission avoids storing cloud credentials in a public student repository.
The repository includes `backend.hcl.example` to show how the state can be moved to a remote backend later.

### How does CI/CD deploy to Kubernetes?

The GitHub Actions workflow restores a base64-encoded kubeconfig from `KUBECONFIG_B64`, applies the base manifests, and updates the deployment image to the image built in the same pipeline.

### Why are there both Docker Compose and Kubernetes observability files?

Docker Compose is used for a simple local demo.
Kubernetes deployment is used for the application runtime.
If Prometheus Operator exists in the cluster, the `ServiceMonitor` in `observability/k8s` can be applied for cluster-native scraping.

### How do you prove autoscaling works?

The proof should be shown by screenshots of the HPA before load, during load, and after pods scale up.
The live demo also includes `kubectl get hpa -w` and `kubectl get pods -w`.

### How do you trigger an alert safely during the demo?

The easiest safe method is to stop the local application container in the Docker Compose stack and wait for the `OrdersServiceDown` alert.

## Contribution Section

Edit this section before submission.

- Team Member 1: ____________________
- Team Member 2: ____________________
- Team Member 3: ____________________
- Team Member 4: ____________________

If the submission is individual, replace the list with:

`This capstone project was prepared and presented individually.`
