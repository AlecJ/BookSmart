# Render auto-deploys this service when commits land on main.
# Terraform manages the service configuration (env vars, build command, publish path).
#
# Prerequisite: Connect your GitHub account to Render once via the dashboard at
# https://dashboard.render.com/select-repo — Render needs OAuth access to pull the repo.
resource "render_static_site" "frontend" {
  name = "booksmart-frontend"

  repo_url       = "https://github.com/AlecJ/BookSmart"
  branch         = "main"
  root_directory = "frontend"

  # root_directory is the working directory for the build, so paths are relative to frontend/
  build_command = "npm install && npx expo export --platform web"
  publish_path  = "dist" # expo export --platform web outputs to dist/ relative to root_directory

  auto_deploy = true

  env_vars = {
    # EXPO_PUBLIC_* vars are inlined at build time by Expo's bundler — not runtime.
    # This value is the backend URL provisioned by Terraform in the same apply.
    EXPO_PUBLIC_API_URL = { value = render_web_service.backend.url }
  }
}
