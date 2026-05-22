# EKS DevOps Platform — Production Style Documentation

## Project Overview

This project demonstrates a production-style cloud-native DevOps platform built on AWS using EKS, Terraform, Jenkins, Helm, Prometheus, Grafana, Loki, HPA, PostgreSQL, React, and FastAPI.

The platform includes:

- AWS Infrastructure Provisioning using Terraform
- Kubernetes orchestration using EKS
- CI/CD concepts using Jenkins
- Monitoring using Prometheus + Grafana
- Logging using Loki + Promtail
- Horizontal Pod Autoscaling (HPA)
- Persistent storage using EBS CSI Driver
- AWS ALB Ingress Controller
- IRSA (IAM Roles for Service Accounts)
- Docker + ECR integration
- Stateful PostgreSQL deployment

---

# Repository Structure

```text
eks-devops-platform/
│
├── ansible/
├── backend/
├── frontend/
├── kubernetes/
│   ├── backend/
│   ├── frontend/
│   ├── database/
│   ├── ingress/
│   └── monitoring/
│
├── terraform/
├── terraform-backend/
├── monitoring/
├── iam_policy.json
├── listener-policy.json
└── README.md
```

---

# Terraform Infrastructure Setup

## Navigate to Terraform Folder

```bash
cd ~/eks-devops-platform/terraform
```

## Initialize Terraform

```bash
terraform init
```

## Validate

```bash
terraform validate
```

## Apply Infrastructure

```bash
terraform apply -auto-approve
```

---

# EKS Cluster Validation

## Update kubeconfig

```bash
aws eks update-kubeconfig \
--region ap-south-1 \
--name dev-eks-cluster
```

## Verify Nodes

```bash
kubectl get nodes
```

Expected:

```text
STATUS = Ready
```

---

# EBS CSI Driver Setup

## Why EBS CSI Driver Is Required

Persistent Volumes in EKS require EBS CSI Driver.

Without it:
- PVC remains Pending
- PostgreSQL storage fails
- StatefulSets cannot attach storage

---

# Associate OIDC Provider

```bash
eksctl utils associate-iam-oidc-provider \
--region ap-south-1 \
--cluster dev-eks-cluster \
--approve
```

---

# Create IRSA Role for EBS CSI Driver

```bash
eksctl create iamserviceaccount \
--name ebs-csi-controller-sa \
--namespace kube-system \
--cluster dev-eks-cluster \
--role-name AmazonEKS_EBS_CSI_DriverRole \
--role-only \
--attach-policy-arn arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy \
--approve
```

---

# Install EBS CSI Addon

```bash
eksctl create addon \
--name aws-ebs-csi-driver \
--cluster dev-eks-cluster \
--service-account-role-arn arn:aws:iam::013046900819:role/AmazonEKS_EBS_CSI_DriverRole \
--force
```

---

# Validation

```bash
kubectl get pods -n kube-system | grep ebs
```

---

# AWS Load Balancer Controller Setup

## Create IAM Policy

```bash
aws iam create-policy \
--policy-name AWSLoadBalancerControllerIAMPolicy \
--policy-document file://iam_policy.json
```

---

# Create IRSA for ALB Controller

```bash
eksctl create iamserviceaccount \
--cluster=dev-eks-cluster \
--namespace=kube-system \
--name=aws-load-balancer-controller \
--role-name AmazonEKSLoadBalancerControllerRole \
--attach-policy-arn=arn:aws:iam::013046900819:policy/AWSLoadBalancerControllerIAMPolicy \
--approve
```

---

# Install Controller

```bash
helm repo add eks https://aws.github.io/eks-charts
helm repo update
```

```bash
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
-n kube-system \
--set clusterName=dev-eks-cluster \
--set serviceAccount.create=false \
--set serviceAccount.name=aws-load-balancer-controller \
--set region=ap-south-1 \
--set vpcId=<VPC_ID>
```

---

# Validation

```bash
kubectl get pods -n kube-system
```

Expected:

```text
aws-load-balancer-controller Running
```

---

# Docker & ECR Setup

## Login to ECR

```bash
aws ecr get-login-password --region ap-south-1 | \
docker login --username AWS --password-stdin \
013046900819.dkr.ecr.ap-south-1.amazonaws.com
```

---

# Common Issue

## Docker Push Not Working

Fix:

```bash
aws ecr get-login-password --region ap-south-1 | \
docker login --username AWS --password-stdin \
013046900819.dkr.ecr.ap-south-1.amazonaws.com
```

---

# Backend Image Build

```bash
cd ~/eks-devops-platform/backend

docker build -t eks-backend:latest .
```

---

# Push Backend Image

```bash
docker tag eks-backend:latest \
013046900819.dkr.ecr.ap-south-1.amazonaws.com/eks-backend:latest
```

```bash
docker push \
013046900819.dkr.ecr.ap-south-1.amazonaws.com/eks-backend:latest
```

---

# Frontend Image Build

```bash
cd ~/eks-devops-platform/frontend

docker build -t eks-frontend:latest .
```

---

# Kubernetes Deployment

## Deploy PostgreSQL

```bash
kubectl apply -f ~/eks-devops-platform/kubernetes/database/
```

---

# Validation

```bash
kubectl get pvc -A
```

Expected:

```text
STATUS = Bound
```

---

# Deploy Backend

```bash
kubectl apply -f ~/eks-devops-platform/kubernetes/backend/
```

---

# Deploy Frontend

```bash
kubectl apply -f ~/eks-devops-platform/kubernetes/frontend/
```

---

# Deploy Ingress

```bash
kubectl apply -f ~/eks-devops-platform/kubernetes/ingress/backend-ingress.yaml
```

---

# Ingress Troubleshooting

## ALB Not Creating

Check:

```bash
kubectl describe ingress -A
```

Common causes:
- Missing IAM permissions
- Controller unhealthy
- Webhook issue

---

# Old ALB Artifacts Issue

Sometimes old ALB resources remain in CloudFormation.

Fix:
1. Delete old CloudFormation stacks
2. Delete ingress
3. Recreate ingress

---

# Grafana Ingress Issue

Issue:
```text
/grafana showing frontend page
```

Reason:
```text
/* path had higher priority
```

Fix:
```yaml
alb.ingress.kubernetes.io/group.order
```

---

# Monitoring Stack

## Install kube-prometheus-stack

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts

helm repo update
```

```bash
kubectl create namespace monitoring
```

```bash
helm install monitoring prometheus-community/kube-prometheus-stack \
-n monitoring
```

---

# Validation

```bash
kubectl get pods -n monitoring
```

Expected:
- grafana
- prometheus
- alertmanager
- exporters

Running.

---

# Grafana Password

```bash
kubectl get secret monitoring-grafana \
-n monitoring \
-o jsonpath="{.data.admin-password}" | base64 --decode && echo
```

---

# Logging Stack

## Install Loki

```bash
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
```

```bash
helm upgrade --install loki grafana/loki-stack \
--namespace monitoring
```

---

# Validation

Grafana → Datasources → Loki

Expected:
```text
Loki datasource visible
```

---

# Sample Loki Queries

## All Logs

```text
{namespace="devops-project"}
```

## Backend Logs

```text
{namespace="devops-project", pod=~"backend.*"}
```

---

# Metrics Server Setup

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

---

# Important EKS Fix

```bash
kubectl edit deployment metrics-server -n kube-system
```

Add:

```yaml
- --kubelet-insecure-tls
```

---

# Validation

```bash
kubectl top nodes
```

```bash
kubectl top pods -A
```

---

# HPA Setup

```bash
kubectl apply -f ~/eks-devops-platform/kubernetes/backend/backend-hpa.yaml
```

---

# HPA Issue Faced

Issue:
```text
CPU = unknown
```

Reason:
```text
resource requests missing
```

Fix:
```yaml
resources:
  requests:
```

---

# Load Test

```bash
kubectl run -i --tty load-generator \
--rm --image=busybox \
-n devops-project -- /bin/sh
```

Inside pod:

```bash
while true; do wget -q -O- http://backend-service/health; done
```

---

# Jenkins CI/CD Flow

```text
Git Push
→ Jenkins
→ Docker Build
→ Push to ECR
→ kubectl set image
→ Rolling Deployment
```

---

# Start Procedure

## 1. Start EC2 Server

Verify SSH access.

---

## 2. Start Infrastructure

```bash
cd ~/eks-devops-platform/terraform

terraform apply -auto-approve
```

---

## 3. Update kubeconfig

```bash
aws eks update-kubeconfig \
--region ap-south-1 \
--name dev-eks-cluster
```

---

## 4. Verify Nodes

```bash
kubectl get nodes
```

---

## 5. Verify kube-system Pods

```bash
kubectl get pods -n kube-system
```

Check:
- ALB Controller
- EBS CSI Driver
- CoreDNS

---

## 6. Deploy Applications

```bash
kubectl apply -f kubernetes/database/

kubectl apply -f kubernetes/backend/

kubectl apply -f kubernetes/frontend/

kubectl apply -f kubernetes/ingress/
```

---

## 7. Validate Application

```bash
kubectl get pods -A
```

```bash
kubectl get ingress -A
```

---

# Stop Procedure

```bash
cd ~/eks-devops-platform/terraform

terraform destroy -auto-approve
```

---

# Important Validation

Verify in AWS Console:
- EKS deleted
- ALB deleted
- Target groups deleted
- Node groups deleted
- EBS volumes deleted

---

# Useful Commands

## Pods

```bash
kubectl get pods -A
```

## Services

```bash
kubectl get svc -A
```

## Ingress

```bash
kubectl get ingress -A
```

## Logs

```bash
kubectl logs <POD_NAME>
```

## Restart Deployment

```bash
kubectl rollout restart deployment <DEPLOYMENT_NAME>
```

## Helm Releases

```bash
helm list -A
```

---

# Future Improvements

- HTTPS using ACM
- Route53 custom domains
- Slack alerting
- ArgoCD GitOps
- Helm chart templating
- Blue-Green deployment
- Canary deployment

---

# Author

Rishabh Jaiswal

DevOps Engineer
