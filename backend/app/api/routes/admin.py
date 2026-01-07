import uuid
from fastapi import APIRouter, HTTPException
from sqlalchemy.exc import IntegrityError

from app.api.deps import SessionDep
from app import crud
from app.services.openai import generate_response
from app.models import (Book, BookChapter, BookChapterCreate,
                        ChapterQuestionCreate, ChapterQuestion)

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/test-openai")
async def test_openai(prompt: str) -> dict:
    response = generate_response(prompt)
    return {"response": response}


@router.post(
    "/add-book", response_model=Book
)
def add_book(*, session: SessionDep, book_in: Book) -> Book:
    """
    Create a book.
    """
    try:
        book = crud.create_book(session=session, book_in=book_in)
        return book
    except IntegrityError as e:
        session.rollback()
        raise HTTPException(
            status_code=400, detail="Book with this title and author already exists.")


@router.post(
    "/add-chapter"
)
def add_chapter(*, session: SessionDep, chapter_in: BookChapterCreate, book_id: uuid.UUID) -> BookChapter:
    """
    Create a chapter and assign it to a book.
    """
    try:
        chapter = crud.create_book_chapter(
            session=session, chapter_in=chapter_in, book_id=book_id)
        return chapter
    except IntegrityError as e:
        session.rollback()
        raise HTTPException(
            status_code=400, detail="Chapter could not be added. Ensure the book exists.")


@router.post(
    "/add-chapter-question"
)
def add_chapter_question(*, session: SessionDep, question_in: ChapterQuestionCreate, chapter_id: uuid.UUID) -> ChapterQuestion:
    """
    Create a chapter question.
    """
    try:
        chapter = crud.create_chapter_question(
            session=session, question_in=question_in, chapter_id=chapter_id)
        return chapter
    except IntegrityError as e:
        session.rollback()
        raise HTTPException(
            status_code=400, detail="Question with this text already exists.")
