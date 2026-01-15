import uuid
import os
import re
import html
import httpx
from fastapi import APIRouter, HTTPException

from app.api.deps import SessionDep
from app import crud
from app.models import Book

router = APIRouter(prefix="/search", tags=["search"])
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")


@router.get(
    ""
)
async def search_books(*, q: str) -> list[Book]:
    """
    Search DB or external API for matching books.
    """
    url = "https://www.googleapis.com/books/v1/volumes"
    params = {"q": q, "key": GOOGLE_API_KEY, "maxResults": 10}

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        books = response.json().get('items', [])

        results = []
        for google_book in books:
            db_book = convert_google_book_to_db_model(google_book=google_book)
            results.append(db_book)

        # filter out duplicates (same title and author)
        unique_results = {}
        for book in results:
            title = book.title.strip().lower().replace(" ", "")
            author = book.author.strip().lower().replace(" ", "").replace(".", "")
            key = title + author
            if key not in unique_results:
                unique_results[key] = book

        return unique_results.values()


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

    # Re-fetch from Google Books API
    url = f"https://www.googleapis.com/books/v1/volumes/{google_book_id}"
    params = {"key": GOOGLE_API_KEY}

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        if response.status_code != 200:
            raise HTTPException(
                status_code=404, detail="Book not found in Google Books API.")

        google_book = response.json()

        book_in = convert_google_book_to_db_model(google_book=google_book)

        # check if book already exists in db
        book = crud.get_book_by_title_and_author(
            session=session, title=book_in.title, author=book_in.author)
        if book:
            return book

        # otherwise create a new book
        db_book = crud.create_book(session=session, book_in=book_in)

        # fetch chapters from Audible API
        chapters = await get_book_chapters_from_audible(title=db_book.title, author=db_book.author)

        # add chapters to db_book and db
        for chapter_title in chapters:
            chapter_in = {"title": chapter_title}
            crud.create_book_chapter(
                session=session, book_id=db_book.id, chapter_in=chapter_in)

        session.refresh(db_book)

        return db_book


# @router.get(
#     "/audible"
# )
async def get_book_chapters_from_audible(*, title: str, author: str = ""):
    """
    Search for Audible books using the Audnex API.
    """
    url = "https://api.audible.com/1.0/catalog/products"
    params = {"title": title, "author": author,
              "products_sort_by": "AvgRating"}

    ASIN = ""

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            response.raise_for_status()
            # get first ASIN
            data = response.json()
            products = data.get("products", [])
            if products:
                ASIN = products[0].get("asin", "")
            else:
                raise HTTPException(
                    status_code=404, detail="No Audible books found matching the query.")
    except httpx.HTTPError as e:
        raise HTTPException(
            status_code=500, detail=f"Error fetching Audible data: {str(e)}")

    url = f"https://api.audnex.us/books/{ASIN}/chapters"

    result_chapters = []

    async with httpx.AsyncClient() as client:
        response = await client.get(url)

        data = response.json()
        chapters = data.get("chapters", [])
        for chapter in chapters:
            result_chapters.append(chapter.get("title", ""))

    return result_chapters


def strip_html_tags(text: str) -> str:
    """Remove HTML tags and decode HTML entities from text."""
    if not text:
        return ""
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)
    # Decode HTML entities (e.g., &amp; -> &)
    text = html.unescape(text)
    return text.strip()


def convert_google_book_to_db_model(*, google_book: dict) -> Book:
    google_book_id = google_book.get('id')
    book_data = google_book.get('volumeInfo', {})

    title = book_data.get('title')
    author = ', '.join(book_data.get('authors', []))
    description = strip_html_tags(book_data.get('description', ''))
    image_links = book_data.get('imageLinks', {})
    image_url = image_links.get('large') or image_links.get(
        'medium') or image_links.get('small') or image_links.get('thumbnail')

    # Fix Google image URLs - replace http with https and add zoom parameter
    if image_url:
        image_url = image_url.replace('http:', 'https:')
        # Remove existing zoom parameter if present and add zoom=1 for better quality
        if '&edge=curl' in image_url:
            image_url = image_url.replace('&edge=curl', '')
        if 'zoom=' not in image_url:
            image_url = image_url + '&zoom=1'

    db_book = Book(google_book_id=google_book_id, title=title, author=author,
                   description=description, image_url=image_url)

    return db_book
