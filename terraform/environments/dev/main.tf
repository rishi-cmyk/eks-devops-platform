module "vpc" {
  source = "../../modules/vpc"

  vpc_cidr               = var.vpc_cidr

  public_subnet_1_cidr  = var.public_subnet_1_cidr
  public_subnet_2_cidr  = var.public_subnet_2_cidr

  private_subnet_1_cidr = var.private_subnet_1_cidr
  private_subnet_2_cidr = var.private_subnet_2_cidr

  region = var.region
}

module "eks" {
  source = "../../modules/eks"

  cluster_name    = var.cluster_name
  cluster_version = var.cluster_version

  vpc_id = module.vpc.vpc_id

  private_subnet_ids = module.vpc.private_subnets

  node_group_name = var.node_group_name

  instance_types = var.instance_types

  desired_size = var.desired_size
  min_size     = var.min_size
  max_size     = var.max_size
}
