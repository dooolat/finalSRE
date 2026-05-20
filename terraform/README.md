# Terraform Notes

This directory provisions the Kubernetes namespace, config, deployment, service, PDB, and HPA for the demo `orders-service`.

## State Management

For this course submission, Terraform uses an explicit local backend:

- backend type: `local`
- state file: `terraform.tfstate`

This choice avoids committing cloud credentials into the repository and keeps the project runnable on a student laptop.
If you want a remote backend later, use `backend.hcl.example` as a migration template.

Suggested workflow:

```bash
terraform init
terraform plan -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars
```

Optional remote backend workflow:

```bash
cp backend.hcl.example backend.hcl
terraform init -reconfigure -backend-config=backend.hcl
```

The default image used by Terraform is:

```text
ghcr.io/dooolat/orders-service-sre-capstone:latest
```

Override it in `terraform.tfvars` if your registry path is different.
