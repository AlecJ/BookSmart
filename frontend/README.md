# BookSmart frontend

BookSmart's frontend is a responsive React single-page application for web,
built with Vite, TypeScript, and React Router. It uses the FastAPI backend
through the `VITE_API_URL` build-time environment variable.

## Local development

```bash
npm install
npm run dev
```

The API defaults to `http://localhost:8000`. To use another backend, create a
`.env.local` file with:

```text
VITE_API_URL=https://your-api.example.com
```

## Production build

```bash
npm run build
npm run preview
```

## Tests

```bash
npm test
```

The reader-journey integration test uses Vitest, Testing Library, and Mock
Service Worker to verify book search, adding a book to the library, and
submitting an answer without requiring a running backend.
