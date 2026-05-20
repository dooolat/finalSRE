locals {
  labels = {
    "app.kubernetes.io/name"    = var.service_name
    "app.kubernetes.io/part-of" = "sre-capstone"
  }
}

resource "kubernetes_namespace_v1" "orders" {
  metadata {
    name   = var.namespace
    labels = local.labels
  }
}

resource "kubernetes_config_map_v1" "app_config" {
  metadata {
    name      = "${var.service_name}-config"
    namespace = kubernetes_namespace_v1.orders.metadata[0].name
    labels    = local.labels
  }

  data = {
    SERVICE_NAME       = var.service_name
    NODE_ENV           = "production"
    APP_VERSION        = "1.0.0"
    PORT               = "8080"
    LOG_LEVEL          = "info"
    READINESS_DELAY_MS = "3000"
    SHUTDOWN_GRACE_MS  = "10000"
  }
}

resource "kubernetes_secret_v1" "app_secret" {
  metadata {
    name      = "${var.service_name}-secrets"
    namespace = kubernetes_namespace_v1.orders.metadata[0].name
    labels    = local.labels
  }

  data = {
    PAYMENT_PROVIDER_TOKEN = var.payment_provider_token
  }

  type = "Opaque"
}

resource "kubernetes_deployment_v1" "app" {
  metadata {
    name      = var.service_name
    namespace = kubernetes_namespace_v1.orders.metadata[0].name
    labels    = local.labels
  }

  spec {
    replicas               = var.replicas
    revision_history_limit = 3

    selector {
      match_labels = {
        "app.kubernetes.io/name" = var.service_name
      }
    }

    template {
      metadata {
        labels = local.labels
        annotations = {
          "prometheus.io/scrape" = "true"
          "prometheus.io/port"   = "8080"
          "prometheus.io/path"   = "/metrics"
        }
      }

      spec {
        termination_grace_period_seconds = 30

        container {
          name              = var.service_name
          image             = var.image
          image_pull_policy = "IfNotPresent"

          port {
            name           = "http"
            container_port = 8080
          }

          env_from {
            config_map_ref {
              name = kubernetes_config_map_v1.app_config.metadata[0].name
            }
          }

          env_from {
            secret_ref {
              name = kubernetes_secret_v1.app_secret.metadata[0].name
            }
          }

          resources {
            requests = {
              cpu    = var.cpu_request
              memory = var.memory_request
            }
            limits = {
              cpu    = var.cpu_limit
              memory = var.memory_limit
            }
          }

          liveness_probe {
            http_get {
              path = "/healthz"
              port = "http"
            }
            initial_delay_seconds = 15
            period_seconds        = 10
            timeout_seconds       = 2
            failure_threshold     = 3
          }

          readiness_probe {
            http_get {
              path = "/readyz"
              port = "http"
            }
            initial_delay_seconds = 5
            period_seconds        = 5
            timeout_seconds       = 2
            failure_threshold     = 3
          }

          startup_probe {
            http_get {
              path = "/healthz"
              port = "http"
            }
            failure_threshold = 30
            period_seconds    = 2
          }
        }
      }
    }
  }
}

resource "kubernetes_service_v1" "app" {
  metadata {
    name      = var.service_name
    namespace = kubernetes_namespace_v1.orders.metadata[0].name
    labels    = local.labels
  }

  spec {
    selector = {
      "app.kubernetes.io/name" = var.service_name
    }

    port {
      name        = "http"
      port        = 80
      target_port = "http"
    }
  }
}

resource "kubernetes_horizontal_pod_autoscaler_v2" "app" {
  metadata {
    name      = var.service_name
    namespace = kubernetes_namespace_v1.orders.metadata[0].name
    labels    = local.labels
  }

  spec {
    min_replicas = var.min_replicas
    max_replicas = var.max_replicas

    scale_target_ref {
      api_version = "apps/v1"
      kind        = "Deployment"
      name        = kubernetes_deployment_v1.app.metadata[0].name
    }

    metric {
      type = "Resource"
      resource {
        name = "cpu"
        target {
          type                = "Utilization"
          average_utilization = 40
        }
      }
    }

    metric {
      type = "Resource"
      resource {
        name = "memory"
        target {
          type                = "Utilization"
          average_utilization = 70
        }
      }
    }
  }
}

resource "kubernetes_pod_disruption_budget_v1" "app" {
  metadata {
    name      = var.service_name
    namespace = kubernetes_namespace_v1.orders.metadata[0].name
    labels    = local.labels
  }

  spec {
    min_available = "1"

    selector {
      match_labels = {
        "app.kubernetes.io/name" = var.service_name
      }
    }
  }
}
