import uuid
from unittest.mock import AsyncMock, patch

from fastapi.testclient import TestClient

from app import crud


def test_get_books_unauthenticated(client: TestClient):
    response = client.get("/api/v1/read/")
    assert response.status_code == 401


def test_get_books_empty_library(client: TestClient, test_user, auth_headers):
    response = client.get("/api/v1/read/", headers=auth_headers)
    assert response.status_code == 200
    assert response.json() == []


def test_get_books_with_books_in_library(client: TestClient, session, test_user, test_book, auth_headers):
    crud.create_book_link(
        session=session, user_id=test_user.id, book_id=test_book.id)
    response = client.get("/api/v1/read/", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["title"] == "Test Book"


def test_get_book_details_not_in_library(client: TestClient, test_user, test_book, auth_headers):
    response = client.get(
        f"/api/v1/read/book/{test_book.id}", headers=auth_headers)
    assert response.status_code == 404


def test_get_book_details_in_library(client: TestClient, session, test_user, test_book, auth_headers):
    crud.create_book_link(
        session=session, user_id=test_user.id, book_id=test_book.id)
    response = client.get(
        f"/api/v1/read/book/{test_book.id}", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Book"
    assert data["author"] == "Test Author"
    assert "chapters" in data


def test_get_book_details_invalid_id(client: TestClient, test_user, auth_headers):
    response = client.get(
        f"/api/v1/read/book/{uuid.uuid4()}", headers=auth_headers)
    assert response.status_code == 404


def test_add_book_to_library(client: TestClient, test_user, test_book, auth_headers):
    response = client.post(
        f"/api/v1/read/addBook?book_id={test_book.id}", headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == str(test_book.id)
    assert data["title"] == "Test Book"


def test_add_book_to_library_already_added(client: TestClient, session, test_user, test_book, auth_headers):
    crud.create_book_link(
        session=session, user_id=test_user.id, book_id=test_book.id)
    response = client.post(
        f"/api/v1/read/addBook?book_id={test_book.id}", headers=auth_headers
    )
    assert response.status_code == 400
    assert "already" in response.json()["detail"]


def test_add_book_to_library_book_not_found(client: TestClient, test_user, auth_headers):
    response = client.post(
        f"/api/v1/read/addBook?book_id={uuid.uuid4()}", headers=auth_headers
    )
    assert response.status_code == 404


def test_get_chapter_questions_existing(
    client: TestClient, test_user, test_chapter, test_question, auth_headers
):
    response = client.get(
        f"/api/v1/read/chapter/{test_chapter.id}/questions", headers=auth_headers
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["questions"]) == 1
    assert data["questions"][0]["question_text"] == "What is the main theme?"


def test_get_chapter_questions_generate(
    client: TestClient, test_user, test_chapter, auth_headers
):
    with patch(
        "app.api.routes.read.generate_chapter_question",
        new=AsyncMock(
            return_value="- What is the theme?\n- Who is the protagonist?"),
    ):
        response = client.get(
            f"/api/v1/read/chapter/{test_chapter.id}/questions", headers=auth_headers
        )
    assert response.status_code == 200
    data = response.json()
    assert len(data["questions"]) == 2


def test_get_chapter_questions_chapter_not_found(client: TestClient, test_user, auth_headers):
    response = client.get(
        f"/api/v1/read/chapter/{uuid.uuid4()}/questions", headers=auth_headers
    )
    assert response.status_code == 404


def test_get_user_response_not_found(
    client: TestClient, test_user, test_question, auth_headers
):
    response = client.get(
        f"/api/v1/read/question/{test_question.id}", headers=auth_headers
    )
    assert response.status_code == 404


def test_get_user_response_found(
    client: TestClient, session, test_user, test_question, auth_headers
):
    crud.create_user_response(
        session=session,
        question_id=test_question.id,
        user_id=test_user.id,
        response_text="My answer to the question.",
    )
    response = client.get(
        f"/api/v1/read/question/{test_question.id}", headers=auth_headers
    )
    assert response.status_code == 200
    assert response.json()["response_text"] == "My answer to the question."


def test_submit_user_response(
    client: TestClient, test_user, test_question, auth_headers
):
    with patch(
        "app.api.routes.read.evaluate_user_response",
        new=AsyncMock(return_value=("Great answer!", 2)),
    ):
        response = client.post(
            f"/api/v1/read/question/{test_question.id}",
            json={"response_text": "This is my detailed answer."},
            headers=auth_headers,
        )
    assert response.status_code == 200
    data = response.json()
    assert data["feedback_text"] == "Great answer!"
    assert data["feedback_grade"] == 2
    assert data["response_text"] == "This is my detailed answer."


def test_submit_user_response_replaces_existing(
    client: TestClient, session, test_user, test_question, auth_headers
):
    crud.create_user_response(
        session=session,
        question_id=test_question.id,
        user_id=test_user.id,
        response_text="Old answer.",
    )
    with patch(
        "app.api.routes.read.evaluate_user_response",
        new=AsyncMock(return_value=("Better now!", 1)),
    ):
        response = client.post(
            f"/api/v1/read/question/{test_question.id}",
            json={"response_text": "New improved answer."},
            headers=auth_headers,
        )
    assert response.status_code == 200
    assert response.json()["response_text"] == "New improved answer."
    assert response.json()["feedback_grade"] == 1


def test_submit_user_response_question_not_found(
    client: TestClient, test_user, auth_headers
):
    response = client.post(
        f"/api/v1/read/question/{uuid.uuid4()}",
        json={"response_text": "Some answer"},
        headers=auth_headers,
    )
    assert response.status_code == 404
