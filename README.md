# 🚀 EKS DevOps Platform

Production-style cloud-native DevOps platform built on AWS using EKS, Terraform, Jenkins, Helm, Prometheus, Grafana, Loki, HPA, PostgreSQL, React, and FastAPI.

---

# 📌 Project Overview

This project demonstrates a real-world DevOps platform deployment using Kubernetes on AWS.

The project includes:

* Infrastructure provisioning using Terraform
* Kubernetes orchestration using Amazon EKS
* CI/CD pipeline using Jenkins
* Monitoring using Prometheus + Grafana
* Centralized logging using Loki + Promtail
* Horizontal Pod Autoscaling (HPA)
* Persistent storage using EBS CSI Driver
* ALB Ingress Controller
* IRSA (IAM Roles for Service Accounts)
* Docker + AWS ECR integration
* PostgreSQL StatefulSet deployment

---

# 🏗️ Architecture

```text
Internet
   ↓
AWS ALB
   ↓
Kubernetes Ingress
   ↓
Frontend Service
   ↓
Frontend Pods

Frontend → Backend API (/api)
                ↓
        Backend Service
                ↓
          Backend Pods
                ↓
        PostgreSQL Service
                ↓
         PostgreSQL Pod
                ↓
 Persistent Volume (EBS)
```

Observability Stack:

```text
Promtail → Loki → Grafana

Prometheus → Grafana
```

Autoscaling:

```text
Metrics Server → HPA → Backend Deployment
```

---

# ☁️ Tech Stack

| Category               | Technology                   |
| ---------------------- | ---------------------------- |
| Cloud                  | AWS                          |
| Infrastructure as Code | Terraform                    |
| Containerization       | Docker                       |
| Orchestration          | Kubernetes                   |
| Managed Kubernetes     | Amazon EKS                   |
| CI/CD                  | Jenkins                      |
| Monitoring             | Prometheus                   |
| Visualization          | Grafana                      |
| Logging                | Loki + Promtail              |
| Autoscaling            | HPA                          |
| Database               | PostgreSQL                   |
| Backend                | FastAPI                      |
| Frontend               | React + Material UI          |
| Package Manager        | Helm                         |
| Ingress                | AWS Load Balancer Controller |
| Persistent Storage     | AWS EBS CSI Driver           |
| Authentication         | IRSA                         |

---

# 📂 Repository Structure

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

# ⚙️ Infrastructure Provisioning

## Initialize Terraform

```bash
cd terraform
terraform init
```

## Apply Infrastructure

```bash
terraform apply -auto-approve
```

## Configure kubectl

```bash
aws eks update-kubeconfig \
--region ap-south-1 \
--name dev-eks-cluster
```

## Verify Nodes

```bash
kubectl get nodes
```

---

# 💾 EBS CSI Driver Setup

## Associate IAM OIDC Provider

```bash
eksctl utils associate-iam-oidc-provider \
--region ap-south-1 \
--cluster dev-eks-cluster \
--approve
```

## Create IRSA Role

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

# 🌐 AWS Load Balancer Controller Setup

## Install Helm Repo

```bash
helm repo add eks https://aws.github.io/eks-charts
helm repo update
```

## Install Controller

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

# 🐳 Docker & ECR Setup

## Login to ECR

```bash
aws ecr get-login-password --region ap-south-1 | \
docker login --username AWS --password-stdin \
013046900819.dkr.ecr.ap-south-1.amazonaws.com
```

---

# 📦 Kubernetes Deployment

## Deploy PostgreSQL

```bash
kubectl apply -f kubernetes/database/
```

## Deploy Backend

```bash
kubectl apply -f kubernetes/backend/
```

## Deploy Frontend

```bash
kubectl apply -f kubernetes/frontend/
```

## Deploy Ingress

```bash
kubectl apply -f kubernetes/ingress/
```

---

# 📊 Monitoring Stack

## Install kube-prometheus-stack

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
```

```bash
helm install monitoring prometheus-community/kube-prometheus-stack \
-n monitoring \
--create-namespace
```

---

# 📈 Grafana Access

## Get Grafana Password

```bash
kubectl get secret monitoring-grafana \
-n monitoring \
-o jsonpath="{.data.admin-password}" | base64 --decode && echo
```

## Grafana URL

```text
http://<ALB-DNS>/grafana
```

---

# 📜 Logging Stack

## Install Loki Stack

```bash
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update
```

```bash
helm upgrade --install loki grafana/loki-stack \
--namespace monitoring
```

---

# 📉 Metrics Server & HPA

## Install Metrics Server

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

## Important EKS Fix

```bash
kubectl edit deployment metrics-server -n kube-system
```

Add:

```yaml
- --kubelet-insecure-tls
```

---

# 🚀 HPA Setup

```bash
kubectl apply -f kubernetes/backend/backend-hpa.yaml
```

## Verify HPA

```bash
kubectl get hpa -n devops-project
```

---

# 🔥 Real Troubleshooting Scenarios Faced

## ALB Not Creating

### Cause

* Missing IAM permissions
* Webhook failures
* Old CloudFormation artifacts

### Fix

* Reattach IAM policies
* Restart ALB controller
* Delete old CloudFormation stacks
* Recreate ingress

---

# ⚠️ Grafana `/grafana` Path Issue

### Problem

`/grafana` was opening frontend application.

### Root Cause

Wildcard ingress rule (`/*`) had higher priority.

### Fix

Used:

```yaml
alb.ingress.kubernetes.io/group.order
```

and configured:

```ini
serve_from_sub_path = true
```

---

# ⚠️ HPA Showing CPU Unknown

### Root Cause

Resource requests were missing.

### Fix

Added:

```yaml
resources:
  requests:
```

in deployment.

---

# ⚠️ Docker Push Failed

### Fix

Re-login to ECR:

```bash
aws ecr get-login-password --region ap-south-1 | \
docker login --username AWS --password-stdin \
013046900819.dkr.ecr.ap-south-1.amazonaws.com
```

---

# ▶️ Start Procedure

## Start Infrastructure

```bash
cd terraform
terraform apply -auto-approve
```

## Update kubeconfig

```bash
aws eks update-kubeconfig \
--region ap-south-1 \
--name dev-eks-cluster
```

## Verify Cluster

```bash
kubectl get nodes
```

## Deploy Applications

```bash
kubectl apply -f kubernetes/database/
kubectl apply -f kubernetes/backend/
kubectl apply -f kubernetes/frontend/
kubectl apply -f kubernetes/ingress/
```

---

# ⏹️ Stop Procedure

## Destroy Infrastructure

```bash
cd terraform
terraform destroy -auto-approve
```

## Verify Cleanup in AWS Console

* EKS Cluster deleted
* ALB deleted
* Node Groups deleted
* Target Groups deleted
* EBS Volumes deleted

---

# 🛠️ Useful Commands

## Get Pods

```bash
kubectl get pods -A
```

## Get Services

```bash
kubectl get svc -A
```

## Get Ingress

```bash
kubectl get ingress -A
```

## Describe Pod

```bash
kubectl describe pod <POD_NAME>
```

## View Logs

```bash
kubectl logs <POD_NAME>
```

## Restart Deployment

```bash
kubectl rollout restart deployment <DEPLOYMENT_NAME>
```

## List Helm Releases

```bash
helm list -A
```

---

# 📚 Key Concepts Demonstrated

* Kubernetes Networking
* Ingress Routing
* ALB Listener Priorities
* Persistent Storage
* StatefulSets
* IRSA
* Helm
* Monitoring Architecture
* Logging Architecture
* HPA Internals
* Autoscaling
* Observability
* Cloud-native Deployments
* Distributed Systems Troubleshooting

---

# 🔮 Future Improvements

* HTTPS using ACM
* Route53 custom domains
* Slack alerting
* ArgoCD GitOps
* Helm chart templating
* Blue-Green deployment
* Canary deployment
* OpenTelemetry
* Service Mesh (Istio)

---

# 👨‍💻 Author

## Rishabh Jaiswal

DevOps Engineer
