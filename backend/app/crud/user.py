import uuid
from sqlmodel import Session, select

from app.core.security import get_password_hash, verify_password
from app.models import User, UserRegister


def create_user(*, session: Session, user_in: UserRegister) -> User:
    db_user = User.model_validate(
        user_in, update={"hashed_password": get_password_hash(user_in.password)})
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def get_user_by_id(*, session: Session, user_id: uuid.UUID) -> User | None:
    statement = select(User).where(User.id == user_id)
    user = session.exec(statement).first()
    return user


def get_user_by_email(*, session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    user = session.exec(statement).first()
    return user


def update_user(*, session: Session, user_id: uuid.UUID, user_in: User) -> User:
    db_user = get_user_by_id(session=session, user_id=user_id)
    if not db_user:
        return None
    update_data = user_in.model_dump(exclude_unset=True)
    db_user.sqlmodel_update(user_in, update=update_data)
    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def delete_user():
    pass


def authenticate(*, session: Session, email: str, password: str) -> User | None:
    db_user = get_user_by_email(session=session, email=email)
    if not db_user:
        return None
    if not verify_password(password, db_user.hashed_password):
        return None
    return db_user
