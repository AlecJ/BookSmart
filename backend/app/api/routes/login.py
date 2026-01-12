from typing import Annotated
from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from app import crud
from app.api.deps import SessionDep
from app.core.config import settings
from app.core import security
from app.models import Token

router = APIRouter(prefix="/login", tags=["login"])


@router.post("/access-token")
def login_access_token(*, session: SessionDep, form_data: Annotated[OAuth2PasswordRequestForm, Depends()]) -> Token:
    user = crud.authenticate(
        session=session, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=400, detail="Incorrect email or password")

    access_token_expires = timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return Token(
        access_token=security.create_access_token(
            user.id, expires_delta=access_token_expires
        )
    )
