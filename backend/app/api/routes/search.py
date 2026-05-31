from fastapi import APIRouter

from app.api.deps import SessionDep
from app import crud
from app.models import Book
from app.services.audible_service import get_book_chapters_from_audible
from app.services.google_books_service import search_book_metadata, fetch_and_create_book


router = APIRouter(prefix="/search", tags=["search"])


@router.get(
    ""
)
async def search_books(*, q: str) -> list[Book]:
    """
    Search DB or external API for matching books.
    """
    return await search_book_metadata(q=q)


@router.get(
    "/{google_book_id}"
)
async def get_or_create_book(*, session: SessionDep, google_book_id: str) -> Book:
    """
    Get or create a book by its Google Book ID.
    """
    book = crud.get_book_by_google_book_id(
        session=session, google_book_id=google_book_id)
    if book:
        return book

    return await fetch_and_create_book(session=session, google_book_id=google_book_id)


# @router.get(
#     "/audible"
# )
async def get_book_chapters(*, title: str, author: str = ""):
    """
    Search for Audible books using the Audnex API.
    """
    return await get_book_chapters_from_audible(title=title, author=author)
