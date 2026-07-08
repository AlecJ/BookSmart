output "app_url" {
  description = "Render web service URL"
  value       = render_web_service.backend.url
}

output "db_host" {
  description = "Neon database host"
  value       = neon_project.main.database_host
}

output "db_connection_string" {
  description = "Neon database connection string (postgresql:// scheme). Run: terraform output -raw db_connection_string"
  value       = neon_project.main.connection_uri
  sensitive   = true
}

output "frontend_url" {
  description = "Render static site URL"
  value       = render_static_site.frontend.url
}
