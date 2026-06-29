from fastapi.testclient import TestClient


def test_register_new_user(client: TestClient):
    response = client.post(
        "/api/v1/users/register",
        json={"email": "newuser@example.com", "password": "newpassword123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_register_duplicate_email(client: TestClient, test_user):
    response = client.post(
        "/api/v1/users/register",
        json={"email": "test@example.com", "password": "anotherpassword123"},
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_register_invalid_email(client: TestClient):
    response = client.post(
        "/api/v1/users/register",
        json={"email": "not-an-email", "password": "password123"},
    )
    assert response.status_code == 422


def test_register_password_too_short(client: TestClient):
    response = client.post(
        "/api/v1/users/register",
        json={"email": "valid@example.com", "password": "short"},
    )
    assert response.status_code == 422
