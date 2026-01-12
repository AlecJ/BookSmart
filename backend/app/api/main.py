from fastapi import APIRouter

from app.api.routes import users, read, admin, search, login

api_router = APIRouter()
api_router.include_router(login.router)
api_router.include_router(users.router)
api_router.include_router(read.router)
api_router.include_router(admin.router)
api_router.include_router(search.router)
