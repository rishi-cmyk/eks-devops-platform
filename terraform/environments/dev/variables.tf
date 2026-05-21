variable "region" {}

variable "vpc_cidr" {}

variable "public_subnet_1_cidr" {}
variable "public_subnet_2_cidr" {}

variable "private_subnet_1_cidr" {}
variable "private_subnet_2_cidr" {}

variable "cluster_name" {}
variable "cluster_version" {}

variable "node_group_name" {}

variable "instance_types" {
  type = list(string)
}

variable "desired_size" {}
variable "min_size" {}
variable "max_size" {}
