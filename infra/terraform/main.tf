# --- SSH key: generated locally (ssh-keygen), never by Terraform, so the
# private key never ends up in state. ---
resource "aws_lightsail_key_pair" "deploy" {
  name       = "${var.project_name}-key"
  public_key = file(pathexpand(var.ssh_public_key_path))
}

# --- Instance ---
resource "aws_lightsail_instance" "app" {
  name              = "${var.project_name}-app"
  availability_zone = "${var.aws_region}a"
  blueprint_id      = var.lightsail_blueprint_id
  bundle_id         = var.lightsail_bundle_id
  key_pair_name     = aws_lightsail_key_pair.deploy.name
  user_data         = file("${path.module}/user_data.sh.tpl")

  tags = {
    Project = var.project_name
  }
}

# --- Static IP (free while attached to a running instance) ---
resource "aws_lightsail_static_ip" "app" {
  name = "${var.project_name}-static-ip"
}

resource "aws_lightsail_static_ip_attachment" "app" {
  static_ip_name = aws_lightsail_static_ip.app.name
  instance_name  = aws_lightsail_instance.app.name
}

# --- Firewall: only 22/80/443. Postgres (5432) is intentionally never
# exposed here — it's only reachable inside the Docker Compose network. ---
resource "aws_lightsail_instance_public_ports" "app" {
  instance_name = aws_lightsail_instance.app.name

  port_info {
    protocol  = "tcp"
    from_port = 22
    to_port   = 22
    cidrs     = [var.allowed_ssh_cidr]
  }

  port_info {
    protocol  = "tcp"
    from_port = 80
    to_port   = 80
    cidrs     = ["0.0.0.0/0"]
  }

  port_info {
    protocol  = "tcp"
    from_port = 443
    to_port   = 443
    cidrs     = ["0.0.0.0/0"]
  }
}

# --- DNS: A record in the existing Route53 hosted zone, pointing at the
# Lightsail static IP. The hosted zone must already exist (it's the zone
# backing the domain's registration, not something this project should own
# the lifecycle of). Looked up by the apex zone name (route53_zone_name),
# which is NOT necessarily the same as domain_name — domain_name may be a
# subdomain (e.g. "tennis-directory.pif-engineer.com") living inside the
# apex zone ("pif-engineer.com"). ---
data "aws_route53_zone" "primary" {
  name         = var.route53_zone_name
  private_zone = false
}

resource "aws_route53_record" "app" {
  zone_id = data.aws_route53_zone.primary.zone_id
  name    = var.domain_name
  type    = "A"
  ttl     = 300
  records = [aws_lightsail_static_ip.app.ip_address]
}
