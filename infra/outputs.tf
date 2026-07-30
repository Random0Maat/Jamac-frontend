output "public_ip" {
  description = "IP publica de la instancia frontend"
  value       = aws_instance.frontend.public_ip
}