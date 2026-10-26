from types import SimpleNamespace
from unittest.mock import Mock

import httpx
from fastapi.testclient import TestClient

from app.models import Settings
from app.services import google_books_service, openai_service


def _google_book(google_book_id: str) -> dict:
    return {
        "id": google_book_id,
        "volumeInfo": {
            "title": "The Practical Reader",
            "authors": ["A. Writer"],
            "description": "A guide to <b>thoughtful</b> reading.",
            "imageLinks": {"thumbnail": "http://books.example/cover.jpg"},
        },
    }


def test_reader_can_search_add_book_and_submit_answer(
    client: TestClient,
    session,
    test_user,
    auth_headers,
    monkeypatch,
):
    google_book_id = "google-practical-reader"
    google_requests: list[str] = []

    async def mock_google_request(*, url: str, params: dict) -> httpx.Response:
        google_requests.append(url)
        payload = (
            {"items": [_google_book(google_book_id)]}
            if url.endswith("/volumes")
            else _google_book(google_book_id)
        )
        return httpx.Response(
            200,
            json=payload,
            request=httpx.Request("GET", url),
        )

    monkeypatch.setattr(google_books_service, "GOOGLE_API_KEY", "test-google-key")
    monkeypatch.setattr(
        google_books_service,
        "_get_with_error_handling",
        mock_google_request,
    )

    search_response = client.get(
        "/api/v1/search",
        params={"q": "practical reader"},
    )
    assert search_response.status_code == 200
    search_results = search_response.json()
    assert len(search_results) == 1
    assert search_results[0]["google_book_id"] == google_book_id
    assert search_results[0]["description"] == "A guide to thoughtful reading."
    assert google_requests == ["https://www.googleapis.com/books/v1/volumes"]

    details_response = client.get(
        f"/api/v1/search/{google_book_id}",
        headers=auth_headers,
    )
    assert details_response.status_code == 200
    book = details_response.json()
    assert book["title"] == "The Practical Reader"
    assert google_requests[-1] == (
        f"https://www.googleapis.com/books/v1/volumes/{google_book_id}"
    )

    add_response = client.post(
        "/api/v1/read/addBook",
        params={"book_id": book["id"]},
        headers=auth_headers,
    )
    assert add_response.status_code == 200
    assert add_response.json()["id"] == book["id"]

    library_response = client.get("/api/v1/read/", headers=auth_headers)
    assert library_response.status_code == 200
    assert [item["id"] for item in library_response.json()] == [book["id"]]

    # Chapter discovery is a separate service; keep this journey independent of Audible.
    async def mock_chapter_titles(*, title: str, author: str) -> list[str]:
        assert title == "The Practical Reader"
        assert author == "A. Writer"
        return ["Chapter One"]

    from app.api.routes import read as read_routes

    monkeypatch.setattr(
        read_routes,
        "get_book_chapters_from_audible",
        mock_chapter_titles,
    )

    session.add_all(
        [
            Settings(
                key="openai_question_template",
                value="Generate chapter questions.",
                data_type="string",
            ),
            Settings(
                key="openai_feedback_template",
                value="Evaluate the response.",
                data_type="string",
            ),
        ]
    )
    session.commit()

    book_details = client.get(
        f"/api/v1/read/book/{book['id']}",
        headers=auth_headers,
    )
    assert book_details.status_code == 200
    chapter = book_details.json()["chapters"][0]
    assert chapter["title"] == "Chapter One"

    def mock_openai_create(*, model: str, input: str):
        if "STUDENT RESPONSE:" in input:
            return SimpleNamespace(
                output_text="Feedback: You identified the central idea.\nGrade: 2"
            )
        return SimpleNamespace(
            output_text="- What idea stands out in this chapter?"
        )

    openai_create = Mock(side_effect=mock_openai_create)
    monkeypatch.setattr(openai_service.client.responses, "create", openai_create)

    questions_response = client.get(
        f"/api/v1/read/chapter/{chapter['id']}/questions",
        headers=auth_headers,
    )
    assert questions_response.status_code == 200
    question = questions_response.json()["questions"][0]
    assert question["question_text"] == "What idea stands out in this chapter?"

    answer_response = client.post(
        f"/api/v1/read/question/{question['id']}",
        json={"response_text": "The main idea is persistence."},
        headers=auth_headers,
    )
    assert answer_response.status_code == 200
    feedback = answer_response.json()
    assert feedback["response_text"] == "The main idea is persistence."
    assert feedback["feedback_text"] == "You identified the central idea."
    assert feedback["feedback_grade"] == 2
    assert openai_create.call_count == 2

    stored_response = client.get(
        f"/api/v1/read/question/{question['id']}",
        headers=auth_headers,
    )
    assert stored_response.status_code == 200
    assert stored_response.json()["response_text"] == "The main idea is persistence."
