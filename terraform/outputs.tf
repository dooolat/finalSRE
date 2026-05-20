output "namespace" {
  description = "Namespace where the application is deployed."
  value       = kubernetes_namespace_v1.orders.metadata[0].name
}

output "service_name" {
  description = "Kubernetes service name."
  value       = kubernetes_service_v1.app.metadata[0].name
}

output "service_port" {
  description = "Service port exposed inside the cluster."
  value       = kubernetes_service_v1.app.spec[0].port[0].port
}

output "deployment_name" {
  description = "Deployment resource name."
  value       = kubernetes_deployment_v1.app.metadata[0].name
}
