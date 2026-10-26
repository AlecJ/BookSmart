# Render auto-deploys this service when commits land on main.
# Terraform manages the service configuration (env vars, build command, publish path).

resource "render_static_site" "frontend" {
  name = "booksmart-frontend"

  repo_url       = "https://github.com/AlecJ/BookSmart"
  branch         = "main"
  root_directory = "frontend"

  # root_directory is the working directory for the build, so paths are relative to frontend/
  build_command = "npm install && npm run build"
  publish_path  = "dist"

  routes = [
    {
      source      = "/*"
      destination = "/index.html"
      type        = "rewrite"
    }
  ]

  auto_deploy = true

  env_vars = {
    # Vite inlines VITE_* vars at build time — not runtime.
    # This value is the backend URL provisioned by Terraform in the same apply.
    VITE_API_URL = { value = render_web_service.backend.url }
  }
}
