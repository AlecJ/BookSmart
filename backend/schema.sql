CREATE TABLE IF NOT EXISTS "user" (
	id UUID PRIMARY KEY,
	email VARCHAR(255) NOT NULL,
	hashed_password TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS ix_user_email ON "user" (email);

CREATE TABLE IF NOT EXISTS book (
	id UUID PRIMARY KEY,
	google_book_id TEXT UNIQUE,
	title TEXT NOT NULL,
	author TEXT NOT NULL,
	description TEXT NOT NULL,
	image_url TEXT NOT NULL DEFAULT '',
	CONSTRAINT uq_book_title_author UNIQUE (title, author)
);
-- Where the book's chapter list came from, and when sources were last
-- checked, so books without one aren't looked up again on every visit.
ALTER TABLE book ADD COLUMN IF NOT EXISTS chapter_source TEXT;
ALTER TABLE book ADD COLUMN IF NOT EXISTS chapter_lookup_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS ix_book_title ON book (title);
CREATE INDEX IF NOT EXISTS ix_book_author ON book (author);

CREATE TABLE IF NOT EXISTS settings (
	key TEXT PRIMARY KEY,
	value TEXT NOT NULL,
	data_type TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS bookchapter (
	id UUID PRIMARY KEY,
	title TEXT NOT NULL,
	book_id UUID NOT NULL REFERENCES book(id),
	sort_order SERIAL
);
-- Databases created by the former Alembic backend lack sort_order. Adding a
-- SERIAL column numbers existing rows in storage order, which matches the
-- order chapters were inserted.
ALTER TABLE bookchapter ADD COLUMN IF NOT EXISTS sort_order SERIAL;
CREATE INDEX IF NOT EXISTS ix_bookchapter_title ON bookchapter (title);

CREATE TABLE IF NOT EXISTS userbooklink (
	user_id UUID NOT NULL REFERENCES "user"(id),
	book_id UUID NOT NULL REFERENCES book(id),
	last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (user_id, book_id)
);

CREATE TABLE IF NOT EXISTS chapterquestion (
	id UUID PRIMARY KEY,
	question_text TEXT NOT NULL,
	chapter_id UUID NOT NULL REFERENCES bookchapter(id)
);
CREATE UNIQUE INDEX IF NOT EXISTS ix_chapterquestion_question_text
	ON chapterquestion (question_text);

CREATE TABLE IF NOT EXISTS userresponse (
	id UUID PRIMARY KEY,
	user_id UUID NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
	question_id UUID NOT NULL REFERENCES chapterquestion(id) ON DELETE CASCADE,
	response_text TEXT NOT NULL,
	feedback_text TEXT,
	feedback_grade INTEGER
);

CREATE TABLE IF NOT EXISTS schema_migrations (
	version TEXT PRIMARY KEY,
	applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO schema_migrations (version)
VALUES ('001_initial_schema')
ON CONFLICT (version) DO NOTHING;
