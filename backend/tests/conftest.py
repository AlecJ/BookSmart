from app.models import Book, BookChapterCreate, ChapterQuestionCreate, UserRegister
from app.core import security
from app import crud
from app.api.deps import get_db
from app.main import app
from sqlmodel.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine
from sqlalchemy import event
from fastapi.testclient import TestClient
import pytest
from datetime import timedelta
import os

# Must be set before importing app modules so pydantic-settings picks them up.
# These are dummy values; all routes are wired to the in-memory SQLite engine.
os.environ.setdefault("POSTGRES_SERVER", "localhost")
os.environ.setdefault("POSTGRES_USER", "testuser")
os.environ.setdefault("POSTGRES_PASSWORD", "testpassword")
os.environ.setdefault("POSTGRES_DB", "testdb")
os.environ.setdefault("PROJECT_NAME", "BookSmart Test")
os.environ.setdefault("SECRET_KEY", "test-secret-key-not-for-production-only")
os.environ.setdefault("OPENAI_API_KEY", "test-openai-key")


@pytest.fixture(name="engine")
def engine_fixture():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    @event.listens_for(engine, "connect")
    def set_sqlite_pragma(dbapi_conn, _):
        cursor = dbapi_conn.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    SQLModel.metadata.create_all(engine)
    yield engine
    SQLModel.metadata.drop_all(engine)


@pytest.fixture(name="session")
def session_fixture(engine):
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session):
    def get_session_override():
        yield session

    app.dependency_overrides[get_db] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture(name="test_user")
def test_user_fixture(session):
    user_in = UserRegister(email="test@example.com",
                           password="testpassword123")
    return crud.create_user(session=session, user_in=user_in)


@pytest.fixture(name="auth_headers")
def auth_headers_fixture(test_user):
    token = security.create_access_token(
        subject=test_user.id, expires_delta=timedelta(minutes=30)
    )
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture(name="test_book")
def test_book_fixture(session):
    book = Book(
        title="Test Book",
        author="Test Author",
        description="A test book description",
        image_url="http://example.com/image.jpg",
        google_book_id="test_google_id_123",
    )
    session.add(book)
    session.commit()
    session.refresh(book)
    return book


@pytest.fixture(name="test_chapter")
def test_chapter_fixture(session, test_book):
    chapter_in = BookChapterCreate(title="Chapter 1")
    return crud.create_book_chapter(
        session=session, chapter_in=chapter_in, book_id=test_book.id
    )


@pytest.fixture(name="test_question")
def test_question_fixture(session, test_chapter):
    question_in = ChapterQuestionCreate(
        question_text="What is the main theme?")
    return crud.create_chapter_question(
        session=session, question_in=question_in, chapter_id=test_chapter.id
    )
