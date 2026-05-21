region = "ap-south-1"

vpc_cidr = "10.0.0.0/16"

public_subnet_1_cidr  = "10.0.1.0/24"
public_subnet_2_cidr  = "10.0.2.0/24"

private_subnet_1_cidr = "10.0.11.0/24"
private_subnet_2_cidr = "10.0.12.0/24"

cluster_name    = "dev-eks-cluster"
cluster_version = "1.29"

node_group_name = "dev-worker-nodes"

instance_types = ["t3.small"]

desired_size = 2
min_size     = 1
max_size     = 3
