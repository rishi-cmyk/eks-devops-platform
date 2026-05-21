terraform {
  backend "s3" {
    bucket         = "rishabh-devops-tf-state-013046900819"
    key            = "dev/terraform.tfstate"
    region         = "ap-south-1"
    dynamodb_table = "terraform-state-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = "ap-south-1"
}
