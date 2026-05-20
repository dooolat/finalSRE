variable "kubeconfig_path" {
  description = "Path to the kubeconfig file used by Terraform."
  type        = string
  default     = "~/.kube/config"
}

variable "kube_context" {
  description = "Kubernetes context Terraform should use."
  type        = string
  default     = "docker-desktop"
}

variable "namespace" {
  description = "Namespace for the orders service."
  type        = string
  default     = "orders-prod"
}

variable "service_name" {
  description = "Application name used across resources."
  type        = string
  default     = "orders-service"
}

variable "image" {
  description = "Container image to deploy. This should match the image pushed by the CI/CD pipeline."
  type        = string
  default     = "ghcr.io/dooolat/orders-service-sre-capstone:latest"
}

variable "replicas" {
  description = "Initial deployment replica count."
  type        = number
  default     = 2
}

variable "min_replicas" {
  description = "Minimum HPA replica count."
  type        = number
  default     = 2
}

variable "max_replicas" {
  description = "Maximum HPA replica count."
  type        = number
  default     = 8
}

variable "cpu_request" {
  description = "Requested CPU for the application container."
  type        = string
  default     = "50m"
}

variable "cpu_limit" {
  description = "CPU limit for the application container."
  type        = string
  default     = "300m"
}

variable "memory_request" {
  description = "Requested memory for the application container."
  type        = string
  default     = "96Mi"
}

variable "memory_limit" {
  description = "Memory limit for the application container."
  type        = string
  default     = "256Mi"
}

variable "payment_provider_token" {
  description = "Demo secret placeholder showing how application secrets should be managed."
  type        = string
  sensitive   = true
  default     = "replace-me"
}
