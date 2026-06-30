from fastapi.testclient import TestClient


def test_login_success(client: TestClient, test_user):
    response = client.post(
        "/api/v1/login/access-token",
        data={"username": "test@example.com", "password": "testpassword123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_wrong_password(client: TestClient, test_user):
    response = client.post(
        "/api/v1/login/access-token",
        data={"username": "test@example.com", "password": "wrongpassword"},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Incorrect email or password"


def test_login_nonexistent_user(client: TestClient):
    response = client.post(
        "/api/v1/login/access-token",
        data={"username": "nobody@example.com", "password": "password123"},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Incorrect email or password"
