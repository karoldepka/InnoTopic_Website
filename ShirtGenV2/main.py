import os

from dotenv import load_dotenv
from fastapi import FastAPI
import logging
from app.routes import prompt_routes

load_dotenv()

app = FastAPI(port=os.getenv('PORT', 8000))

app.include_router(prompt_routes.router)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
