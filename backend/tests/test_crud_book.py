import uuid

from sqlmodel import Session

from app import crud
from app.models import Book, BookChapterCreate, ChapterQuestionCreate, User


def test_create_book(session: Session):
    book = Book(
        title="New Book",
        author="New Author",
        description="A description",
        image_url="",
        google_book_id="abc123",
    )
    created = crud.create_book(session=session, book_in=book)

    assert created.id is not None
    assert created.title == "New Book"
    assert created.author == "New Author"


def test_get_book_by_id(session: Session, test_book: Book):
    found = crud.get_book_by_id(session=session, book_id=test_book.id)
    assert found is not None
    assert found.id == test_book.id


def test_get_book_by_id_not_found(session: Session):
    result = crud.get_book_by_id(session=session, book_id=uuid.uuid4())
    assert result is None


def test_get_book_by_google_book_id(session: Session, test_book: Book):
    found = crud.get_book_by_google_book_id(
        session=session, google_book_id="test_google_id_123"
    )
    assert found is not None
    assert found.id == test_book.id


def test_get_book_by_google_book_id_not_found(session: Session):
    result = crud.get_book_by_google_book_id(
        session=session, google_book_id="nonexistent_id"
    )
    assert result is None


def test_get_book_by_title_and_author(session: Session, test_book: Book):
    found = crud.get_book_by_title_and_author(
        session=session, title="Test Book", author="Test Author"
    )
    assert found is not None
    assert found.id == test_book.id


def test_get_book_by_title_and_author_not_found(session: Session):
    result = crud.get_book_by_title_and_author(
        session=session, title="Nonexistent", author="Nobody"
    )
    assert result is None


def test_create_book_link(session: Session, test_user: User, test_book: Book):
    link = crud.create_book_link(
        session=session, user_id=test_user.id, book_id=test_book.id
    )
    assert link.user_id == test_user.id
    assert link.book_id == test_book.id


def test_create_book_chapter(session: Session, test_book: Book):
    chapter_in = BookChapterCreate(title="Chapter 1")
    chapter = crud.create_book_chapter(
        session=session, chapter_in=chapter_in, book_id=test_book.id
    )

    assert chapter.id is not None
    assert chapter.title == "Chapter 1"
    assert chapter.book_id == test_book.id


def test_get_book_chapter_by_id(session: Session, test_chapter):
    found = crud.get_book_chapter_by_id(
        session=session, chapter_id=test_chapter.id)
    assert found is not None
    assert found.id == test_chapter.id


def test_get_book_chapter_by_id_not_found(session: Session):
    result = crud.get_book_chapter_by_id(
        session=session, chapter_id=uuid.uuid4())
    assert result is None


def test_create_chapter_question(session: Session, test_chapter):
    question_in = ChapterQuestionCreate(
        question_text="What happens in this chapter?")
    question = crud.create_chapter_question(
        session=session, question_in=question_in, chapter_id=test_chapter.id
    )

    assert question.id is not None
    assert question.question_text == "What happens in this chapter?"
    assert question.chapter_id == test_chapter.id


def test_create_user_response(session: Session, test_user: User, test_question):
    response = crud.create_user_response(
        session=session,
        question_id=test_question.id,
        user_id=test_user.id,
        response_text="My detailed answer.",
    )

    assert response.id is not None
    assert response.user_id == test_user.id
    assert response.question_id == test_question.id
    assert response.response_text == "My detailed answer."


def test_get_user_response_for_question_found(session: Session, test_user: User, test_question):
    crud.create_user_response(
        session=session,
        question_id=test_question.id,
        user_id=test_user.id,
        response_text="My answer.",
    )
    found = crud.get_user_response_for_question(
        session=session, user_id=test_user.id, question_id=test_question.id
    )
    assert found is not None
    assert found.response_text == "My answer."


def test_get_user_response_for_question_not_found(session: Session, test_user: User, test_question):
    result = crud.get_user_response_for_question(
        session=session, user_id=test_user.id, question_id=test_question.id
    )
    assert result is None
