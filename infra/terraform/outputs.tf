output "static_ip" {
  description = "Public static IP of the Lightsail instance. Point your domain's A record here."
  value       = aws_lightsail_static_ip.app.ip_address
}

output "instance_name" {
  value = aws_lightsail_instance.app.name
}

output "dns_record" {
  description = "DNS A record created in Route53."
  value       = "${aws_route53_record.app.fqdn} -> ${aws_lightsail_static_ip.app.ip_address}"
}
