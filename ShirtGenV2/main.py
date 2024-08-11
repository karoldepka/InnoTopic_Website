import os

from dotenv import load_dotenv
from fastapi import FastAPI
import logging
from app.routes import routes

load_dotenv()

app = FastAPI(port=os.getenv('PORT', 8000))

app.include_router(routes.router)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
