from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from app.models import Book


def test_search_books(client: TestClient):
    mock_results = [
        Book(
            title="Mocked Book",
            author="Mocked Author",
            description="A mocked description",
            image_url="http://example.com/img.jpg",
            google_book_id="mock_google_1",
        )
    ]
    with patch(
        "app.api.routes.search.search_book_metadata",
        new=AsyncMock(return_value=mock_results),
    ):
        response = client.get("/api/v1/search?q=mocked")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Mocked Book"


def test_search_books_empty_results(client: TestClient):
    with patch(
        "app.api.routes.search.search_book_metadata",
        new=AsyncMock(return_value=[]),
    ):
        response = client.get("/api/v1/search?q=unknownquery")
    assert response.status_code == 200
    assert response.json() == []


def test_get_or_create_book_existing(client: TestClient, test_book: Book):
    response = client.get(f"/api/v1/search/{test_book.google_book_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["google_book_id"] == test_book.google_book_id
    assert data["title"] == test_book.title


def test_get_or_create_book_new(client: TestClient):
    new_book = Book(
        title="Fetched Book",
        author="Fetched Author",
        description="A fetched description",
        image_url="",
        google_book_id="new_google_id_xyz",
    )
    with patch(
        "app.api.routes.search.fetch_and_create_book",
        new=AsyncMock(return_value=new_book),
    ):
        response = client.get("/api/v1/search/new_google_id_xyz")
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Fetched Book"
