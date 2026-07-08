resource "neon_project" "main" {
  name       = "booksmart"
  region_id  = "aws-us-east-1"
  pg_version = 17
  org_id     = var.neon_org_id

  # Free tier maximum is 6 hours (21600 seconds)
  history_retention_seconds = 21600
}
