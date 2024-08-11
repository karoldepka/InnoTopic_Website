from fastapi import APIRouter
from app.routes import prompt_routes

router = APIRouter(prefix="/ai-api")

router.include_router(prompt_routes.router)
