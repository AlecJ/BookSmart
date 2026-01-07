# FastAPI Backend

## Requirements

-   Docker
-   uv

## Run Locally

-   Copy `.env.EXAMPLE` and name it `.env`

-   (Optional) Update the postgres admin user, password, or app name, in your new `.env` file.

-   Bring up containers
    `docker-compose up`

    Visit site at ...

## Useful Commands

-   Set up local virtualenv
    `uv venv`
    `source .venv/bin/activate`
    `uv sync`

-   Update the projects environment
    `uv add [package]`
    `uv lock`
    `uv sync`

-   Create a db migration
    `alembic revision --autogenerate -m "message"`
    or with docker
    `docker compose exec backend alembic revision --autogenerate -m "message"`

-   Apply a db migration
    `alembic upgrade head`
    or with docker
    `docker compose exec backend alembic upgrade head`

## To Do

-   test add one book to db
-   add openai api
-   prompt
-   add response to db

-   add user auth

-   how to get a bunch of books

-   connect frontend to backend
-   test on web
-   catch ios up to web
-   polish frontends
