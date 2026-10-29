# Express Backend

The API is implemented in Express and TypeScript, with PostgreSQL accessed through
`pg`. The existing `/api/v1` routes and database table names are retained for
compatibility with the web frontend and existing database.

## Requirements

- Node.js 22 or newer
- PostgreSQL

## Run locally

1. Configure the database and API credentials in the repository root `.env` file.
2. Install dependencies and start the API:

   ```sh
   cd backend
   npm ci
   npm run dev
   ```

The API listens on port 8000 by default. The server applies the idempotent
`schema.sql` setup on startup. Run it separately with `npm run migrate` when
needed. The migration setup uses `CREATE TABLE IF NOT EXISTS` to preserve data
in databases already created by the former Alembic backend.

To run the API and PostgreSQL in Docker from the repository root:

```sh
docker compose up --build
```

## Seed data

After the schema exists, run either seed command from `backend`:

```sh
npm run seed:settings
npm run seed:books
```

Seed settings include the prompt templates used by the OpenAI integration.

## Tests and build

```sh
npm test
npm run build
```

The API journey test uses an in-memory PostgreSQL-compatible database and mocks
Google Books, Audible, and OpenAI services. It exercises registration,
searching, adding a book to the library, generating chapter questions, and
submitting and retrieving an answer.

## API

All API routes are under `/api/v1`. The primary user endpoints are:

- `POST /users/register`
- `POST /login/access-token`
- `GET /search?q=...`
- `GET /search/:googleBookId`
- `GET /read/`
- `POST /read/addBook?book_id=...`
- `GET /read/book/:bookId`
- `GET /read/chapter/:chapterId/questions`
- `GET` and `POST /read/question/:questionId`

Authenticated endpoints require a bearer token.
