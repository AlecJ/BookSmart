from fastapi import APIRouter

from app.api.routes import users, read, admin
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(users.router)
api_router.include_router(read.router)
api_router.include_router(admin.router)
