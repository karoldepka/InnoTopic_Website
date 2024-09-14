# Consider separating route group initialization for better modularity
from fastapi import APIRouter
from app.routes import prompt_routes
from app.routes import qanda_routes

router = APIRouter(prefix="/ai-api")

router.include_router(prompt_routes.router)
router.include_router(qanda_routes.router)

# If you add more routes, include them here in a modular way
# router.include_router(another_routes.router)
