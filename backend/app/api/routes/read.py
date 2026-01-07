import uuid
from fastapi import APIRouter, HTTPException
from sqlalchemy.exc import IntegrityError

from app.api.deps import SessionDep
from app import crud
from app.models import Book

router = APIRouter(prefix="/read", tags=["read"])


@router.get(
    "/"
)
def test(*, session: SessionDep, id: uuid.UUID):
    """
    Get book by ID.
    """
    book = session.get(Book, id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    return book


@router.post(
    "/test-make"
)
def test_make(*, session: SessionDep):
    """
    Create a book.
    """
    book = Book(title="Katabasis", author="R. F. Kuang",
                description="A journey to the underworld.")
    session.add(book)
    try:
        session.commit()
    except IntegrityError as e:
        session.rollback()
        raise HTTPException(
            status_code=400, detail="Book with this title and author already exists.")

    session.refresh(book)
    return book
