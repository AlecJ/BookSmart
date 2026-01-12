from fastapi import APIRouter, HTTPException

from app import crud
from app.api.deps import (
    SessionDep,
)
from app.models import UserRegister, UserPublic

router = APIRouter(prefix="/users", tags=["users"])


@router.post(
    "/register"
)
def register_user(*, session: SessionDep, user_in: UserRegister) -> UserPublic:
    """
    Register a new user.
    """
    user = crud.get_user_by_email(session=session, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )

    user = crud.create_user(session=session, user_in=user_in)

    return user
