# Load Testing

The repository includes `load/locustfile.py` so the required load-testing deliverable can be demonstrated with Locust.
The application is lightweight, so the test should use enough concurrent users to create visible CPU pressure for the HPA.

## Local Docker-based execution

```bash
docker compose -f observability/docker-compose.yml up -d --build
docker run --rm --network host -v ${PWD}/load:/mnt locustio/locust -f /mnt/locustfile.py --headless --users 50 --spawn-rate 10 --run-time 2m --host http://127.0.0.1:8080
```

## Kubernetes autoscaling demo

1. Deploy the application and HPA to the cluster.
2. Expose the service locally:

```bash
kubectl port-forward svc/orders-service 18080:80 -n orders-prod
```

3. Start Locust with stronger settings than the local smoke test:

```bash
docker run --rm --network host -v ${PWD}/load:/mnt locustio/locust -f /mnt/locustfile.py --headless --users 200 --spawn-rate 40 --run-time 5m --host http://127.0.0.1:18080
```

4. Watch the scaling event:

```bash
kubectl get hpa -n orders-prod -w
kubectl get pods -n orders-prod -w
```

Expected evidence:

- HPA desired replicas increase during the traffic spike.
- Pod count rises from the baseline replica count.
- Grafana shows a corresponding increase in request rate and latency pressure.

## If HPA Does Not Scale Immediately

- Increase `--users` to `300` and `--spawn-rate` to `60`.
- Keep the test running for at least `5` minutes so metrics have time to stabilize.
- Check `kubectl top pods -n orders-prod` if metrics-server is installed.
- Verify that the application image deployed in Kubernetes matches the latest tested image.
