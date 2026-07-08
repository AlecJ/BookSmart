# ─── Neon ────────────────────────────────────────────────────────────────────

variable "neon_api_key" {
  description = "Neon API key. Generate at https://console.neon.tech/app/settings/api-keys"
  type        = string
  sensitive   = true
}

# ─── Render ──────────────────────────────────────────────────────────────────

variable "render_api_key" {
  description = "Render API key. Generate at https://dashboard.render.com/u/settings#api-keys"
  type        = string
  sensitive   = true
}

variable "render_owner_id" {
  description = "Render owner/workspace ID (e.g. usr-xxxx or tea-xxxx). Found in the Render dashboard URL."
  type        = string
}

variable "render_region" {
  description = "Render deployment region."
  type        = string
  default     = "oregon"
}

variable "render_plan" {
  description = "Render service plan. 'free' spins down after inactivity; 'starter' ($7/mo) is always-on."
  type        = string
  default     = "starter"
}

# ─── Docker / GHCR ───────────────────────────────────────────────────────────

variable "image_tag" {
  description = "Docker image tag to deploy. Set to the git SHA in CI so Terraform detects a real change and triggers a Render redeploy."
  type        = string
}

variable "ghcr_token" {
  description = "GitHub PAT with 'read:packages' scope. Allows Render to pull the private GHCR image."
  type        = string
  sensitive   = true
}

# ─── App config ──────────────────────────────────────────────────────────────

variable "secret_key" {
  description = "JWT signing secret. Generate with: openssl rand -hex 32"
  type        = string
  sensitive   = true
}

variable "openai_api_key" {
  description = "OpenAI API key."
  type        = string
  sensitive   = true
}

variable "openai_model" {
  description = "OpenAI model name."
  type        = string
  default     = "gpt-4o-mini"
}

variable "project_name" {
  description = "Application name exposed via the PROJECT_NAME env var."
  type        = string
  default     = "BookSmart"
}

variable "frontend_host" {
  description = "Frontend URL added to CORS allowed origins. Leave empty if not using a web frontend."
  type        = string
  default     = ""
}
