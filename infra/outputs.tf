output "public_ip" {
  description = "IP publica fija (Elastic IP) del frontend"
  value       = aws_eip.frontend.public_ip
}