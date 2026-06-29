import uuid

from sqlmodel import Session

from app import crud
from app.models import User


def test_create_user(session: Session):
    from app.models import UserRegister

    user_in = UserRegister(email="newuser@example.com", password="password123")
    user = crud.create_user(session=session, user_in=user_in)

    assert user.id is not None
    assert user.email == "newuser@example.com"
    assert user.hashed_password != "password123"


def test_get_user_by_id(session: Session, test_user: User):
    found = crud.get_user_by_id(session=session, user_id=test_user.id)
    assert found is not None
    assert found.id == test_user.id
    assert found.email == test_user.email


def test_get_user_by_id_not_found(session: Session):
    result = crud.get_user_by_id(session=session, user_id=uuid.uuid4())
    assert result is None


def test_get_user_by_email(session: Session, test_user: User):
    found = crud.get_user_by_email(session=session, email="test@example.com")
    assert found is not None
    assert found.email == "test@example.com"


def test_get_user_by_email_not_found(session: Session):
    result = crud.get_user_by_email(
        session=session, email="nobody@example.com")
    assert result is None


def test_authenticate_correct_credentials(session: Session, test_user: User):
    user = crud.authenticate(
        session=session, email="test@example.com", password="testpassword123"
    )
    assert user is not None
    assert user.id == test_user.id


def test_authenticate_wrong_password(session: Session, test_user: User):
    user = crud.authenticate(
        session=session, email="test@example.com", password="wrongpassword"
    )
    assert user is None


def test_authenticate_nonexistent_email(session: Session):
    user = crud.authenticate(
        session=session, email="nobody@example.com", password="password123"
    )
    assert user is None
