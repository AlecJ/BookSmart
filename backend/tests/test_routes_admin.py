import uuid
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from app import crud
from app.models import Book, BookChapterCreate


def test_add_book(client: TestClient):
    response = client.post(
        "/api/v1/admin/add-book",
        json={
            "title": "Admin Book",
            "author": "Admin Author",
            "description": "A description for the admin book.",
            "google_book_id": "admin_google_123",
            "image_url": "",
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Admin Book"
    assert data["author"] == "Admin Author"
    assert "id" in data


def test_add_book_duplicate_title_author(client: TestClient, test_book: Book):
    response = client.post(
        "/api/v1/admin/add-book",
        json={
            "title": "Test Book",
            "author": "Test Author",
            "description": "A duplicate.",
            "google_book_id": "some_other_google_id",
            "image_url": "",
        },
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_add_chapter(client: TestClient, test_book: Book):
    response = client.post(
        f"/api/v1/admin/add-chapter?book_id={test_book.id}",
        json={"title": "New Chapter"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "New Chapter"
    assert data["book_id"] == str(test_book.id)


def test_add_chapter_nonexistent_book(client: TestClient):
    response = client.post(
        f"/api/v1/admin/add-chapter?book_id={uuid.uuid4()}",
        json={"title": "New Chapter"},
    )
    assert response.status_code == 400


def test_add_chapter_question(client: TestClient, test_chapter):
    response = client.post(
        f"/api/v1/admin/add-chapter-question?chapter_id={test_chapter.id}",
        json={"question_text": "What is the moral of this chapter?"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["question_text"] == "What is the moral of this chapter?"
    assert data["chapter_id"] == str(test_chapter.id)


def test_add_chapter_question_duplicate_text(client: TestClient, test_chapter, test_question):
    response = client.post(
        f"/api/v1/admin/add-chapter-question?chapter_id={test_chapter.id}",
        json={"question_text": "What is the main theme?"},
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_make_question(client: TestClient, test_chapter):
    with patch(
        "app.api.routes.admin.generate_chapter_question",
        new=AsyncMock(return_value="- What happens?\n- Why does it matter?"),
    ):
        response = client.get(
            f"/api/v1/admin/make-question?chapter_id={test_chapter.id}"
        )
    assert response.status_code == 200
    assert "response" in response.json()
