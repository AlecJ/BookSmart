from datetime import timedelta
from fastapi import APIRouter, HTTPException

from app import crud
from app.api.deps import (
    SessionDep,
)
from app.core.config import settings
from app.core import security
from app.models import Token
from app.models import UserRegister, Token


router = APIRouter(prefix="/users", tags=["users"])


@router.post(
    "/register"
)
def register_user(*, session: SessionDep, user_in: UserRegister) -> Token:
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

    access_token_expires = timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return Token(
        access_token=security.create_access_token(
            user.id, expires_delta=access_token_expires
        )
    )
