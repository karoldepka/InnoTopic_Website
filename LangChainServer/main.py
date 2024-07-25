from fastapi import FastAPI

from config.settings import settings
from routes import router

app = FastAPI(title=settings.APP_NAME, debug=settings.DEBUG)

app.include_router(router)
