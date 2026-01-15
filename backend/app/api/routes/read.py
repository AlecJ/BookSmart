import uuid
from fastapi import APIRouter, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlmodel import select

from app.api.deps import SessionDep, CurrentUser
from app import crud
from app.models import User, Book, UserBookLink

router = APIRouter(prefix="/read", tags=["read"])


"""
These endpoints are for fetching a user's books and related data.
"""


@router.get(
    "/"
)
def get_books_for_user(*, session: SessionDep, current_user: CurrentUser) -> list[Book]:
    """
    Get all books in the user's library.
    """
    user = session.get(User, current_user.id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_links = user.books
    user_links.sort(key=lambda link: link.last_updated, reverse=True)
    user_books = [link.book for link in user.books]

    return user_books


@router.get(
    "/{book_id}"
)
def get_book_details_for_user(*, session: SessionDep, current_user: CurrentUser, book_id: uuid.UUID) -> Book:
    """
    Get all books in the user's library.
    """
    user = session.get(User, current_user.id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_book = next(
        (link.book for link in user.books if link.book_id == book_id), None)

    if not user_book:
        raise HTTPException(
            status_code=404, detail="Book not found in user's library")

    return user_book


@router.post(
    "/add"
)
def add_book_to_user_library(*, session: SessionDep, current_user: CurrentUser, book_id: uuid.UUID) -> Book:
    """
    Add a book to the user's library.
    """
    user = session.get(User, current_user.id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    book = session.get(Book, book_id)
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    # Check if the link already exists
    existing_link = session.exec(
        select(UserBookLink).where(
            UserBookLink.user_id == user.id,
            UserBookLink.book_id == book.id
        )
    ).first()
    if existing_link:
        raise HTTPException(
            status_code=400, detail="Book already in user's library")

    # Create link
    user_book_link = crud.create_book_link(
        session=session, user_id=current_user.id, book_id=book_id)

    return user_book_link.book


# @router.post(
#     "/test-make"
# )
# def test_make(*, session: SessionDep):
#     """
#     Create a book.
#     """
#     book = Book(title="Katabasis", author="R. F. Kuang",
#                 description="A journey to the underworld.")
#     session.add(book)
#     try:
#         session.commit()
#     except IntegrityError as e:
#         session.rollback()
#         raise HTTPException(
#             status_code=400, detail="Book with this title and author already exists.")

#     session.refresh(book)
#     return book
