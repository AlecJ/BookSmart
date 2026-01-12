import uuid
import os
import httpx
from fastapi import APIRouter, HTTPException

from app.api.deps import SessionDep, CurrentUser
from app import crud
from app.models import Book

router = APIRouter(prefix="/search", tags=["search"])
API_KEY = os.getenv("GOOGLE_API_KEY")


@router.get(
    ""
)
async def search_books(*, query: str, current_user: CurrentUser):
    """
    Search DB or external API for matching books.
    """
    url = "https://www.googleapis.com/books/v1/volumes"
    params = {"q": query, "key": API_KEY}

    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        return response.json()
        books = response.json().get('items', [])

        results = []

        for book in books:
            db_book = convert_google_book_to_db_model(book)
            results.append(db_book)

        return results


@router.get(
    "/audible"
)
async def search_audible_books(*, title: str, author: str = ""):
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

    return {"asin": ASIN, "chapters": result_chapters}


def convert_google_book_to_db_model(google_book: dict) -> Book:
    google_book_id = google_book.get('id')
    book_data = google_book.get('volumeInfo', {})

    title = book_data.get('title')
    author = ', '.join(book_data.get('authors', []))
    description = book_data.get('description', '')
    image_url = book_data.get('imageLinks', {}).get('thumbnail')

    db_book = Book(google_book_id=google_book_id, title=title, author=author,
                   description=description, image_url=image_url)

    return db_book
