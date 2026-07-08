terraform {
  required_version = ">= 1.9"

  required_providers {
    neon = {
      source  = "kislerdm/neon"
      version = "~> 0.6"
    }
    render = {
      source  = "render-oss/render"
      version = "~> 1.3"
    }
  }

  cloud {
    organization = "BookSmart_TF"

    workspaces {
      name = "booksmart"
    }
  }
}

provider "neon" {
  api_key = var.neon_api_key
}

provider "render" {
  api_key  = var.render_api_key
  owner_id = var.render_owner_id
}
