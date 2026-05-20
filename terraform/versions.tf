terraform {
  required_version = ">= 1.6.0"

  # This submission uses an explicit local backend by default.
  # backend.hcl.example documents how the state can be moved to a remote backend later.
  backend "local" {
    path = "terraform.tfstate"
  }

  required_providers {
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.32"
    }
  }
}

provider "kubernetes" {
  config_path    = var.kubeconfig_path
  config_context = var.kube_context
}
