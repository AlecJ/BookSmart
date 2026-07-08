resource "neon_project" "main" {
  name       = "booksmart"
  region_id  = "aws-us-east-1"
  pg_version = 17
  org_id     = var.neon_org_id
}
