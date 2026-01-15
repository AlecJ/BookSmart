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

-   Clear local database
    `docker compose down -v  # Removes volumes`

## To Do

-   get questions (auto)
-   submit response
-   redo login/register page
-   recent books on homepage

-   test on web
-   catch ios up to web
-   polish frontends
-   test very big resolution

-   seed script
-   deploy
-   tests
-   add tests to deploy process

## Routes

GET /api/v1/login -- login user
POST /api/v1/register -- create user

GET /api/v1/profile -- view user page

GET /api/v1/search -- perform search and return results
GET /api/v1/read -- get users books
POST /api/v1/read/{bookId} -- add book to user's library
DEL /api/v1/read/{bookId} -- remove a book from a user's library
GET /api/v1/read/{bookId} -- get book details/questions/chapters for user for one book
POST /api/v1/read{bookId}/submit -- post users answers to questions and fetch feedback
