variable "aws_region" {
  description = "AWS region to deploy into."
  type        = string
  default     = "eu-west-3"
}

variable "project_name" {
  description = "Used to name/tag resources."
  type        = string
  default     = "tennis-directory"
}

variable "lightsail_bundle_id" {
  description = "Lightsail instance size. small_3_0 = 1GB RAM/2vCPU/40GB SSD/2TB transfer (~$5/mo), the safe minimum for Postgres+Node. nano_3_0 = 512MB (~$3.50/mo) also works but needs a swapfile (see user_data.sh.tpl) and is more OOM-prone."
  type        = string
  default     = "small_3_0"
}

variable "lightsail_blueprint_id" {
  description = "Base OS image. A plain OS blueprint is used (not an app-stack blueprint) since Docker is installed via user_data."
  type        = string
  default     = "ubuntu_24_04"
}

variable "ssh_public_key_path" {
  description = "Path to a locally-generated SSH public key (ssh-keygen -t ed25519 -f ~/.ssh/tennis_directory_lightsail). The private key never touches Terraform state."
  type        = string
  default     = "~/.ssh/tennis_directory_lightsail.pub"
}

variable "allowed_ssh_cidr" {
  description = "CIDR allowed to reach port 22. Defaults to open; set to your own IP/32 to reduce brute-force surface at zero extra cost."
  type        = string
  default     = "0.0.0.0/0"
}

variable "domain_name" {
  description = "Domain (or subdomain) to point at the instance, e.g. \"pif-engineer.com\" or \"tennis-directory.pif-engineer.com\". Must match the domain configured in the Caddyfile."
  type        = string
}

variable "route53_zone_name" {
  description = "The apex domain of the existing public Route53 hosted zone that domain_name lives in (e.g. \"pif-engineer.com\", even if domain_name is a subdomain of it)."
  type        = string
}
