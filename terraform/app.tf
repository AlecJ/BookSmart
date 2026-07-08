locals {
  # GHCR image names must be lowercase
  image_repo = "ghcr.io/alecj/booksmart-backend"
}

resource "render_web_service" "backend" {
  name   = "booksmart-backend"
  plan   = var.render_plan
  region = var.render_region

  runtime_source = {
    image = {
      image_url = local.image_repo
      tag       = var.image_tag

      # Allows Render to pull from the private GHCR registry.
      # ghcr_token is a GitHub PAT with the 'read:packages' scope.
      credentials = {
        username = "alecj"
        password = var.ghcr_token
      }
    }
  }

  # Runs Alembic migrations in a temporary container before each new deploy.
  # If the command exits non-zero, the current deploy is not replaced.
  pre_deploy_command = "alembic upgrade head"

  env_vars = {
    # Database — individual vars to match the app's Pydantic settings schema in core/config.py
    POSTGRES_SERVER   = { value = neon_project.main.database_host }
    POSTGRES_PORT     = { value = "5432" }
    POSTGRES_USER     = { value = neon_project.main.database_user }
    POSTGRES_PASSWORD = { value = neon_project.main.database_password }
    POSTGRES_DB       = { value = neon_project.main.database_name }
    # Neon requires SSL; psycopg respects this standard libpq environment variable
    PGSSLMODE         = { value = "require" }

    # App
    PROJECT_NAME  = { value = var.project_name }
    SECRET_KEY    = { value = var.secret_key }
    ENVIRONMENT   = { value = "production" }
    FRONTEND_HOST = { value = var.frontend_host }

    # OpenAI
    OPENAI_API_KEY = { value = var.openai_api_key }
    OPENAI_MODEL   = { value = var.openai_model }
  }
}
