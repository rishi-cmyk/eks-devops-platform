variable "cluster_name" {}
variable "cluster_version" {}

variable "vpc_id" {}

variable "private_subnet_ids" {
  type = list(string)
}

variable "node_group_name" {}

variable "instance_types" {
  type = list(string)
}

variable "desired_size" {}
variable "min_size" {}
variable "max_size" {}
