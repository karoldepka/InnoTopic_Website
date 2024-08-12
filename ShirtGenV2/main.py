# main.py - Confirm that logging and application setup are properly configured

import os
from dotenv import load_dotenv
from fastapi import FastAPI
import logging
from app.routes import routes

load_dotenv()

app = FastAPI(port=os.getenv('PORT', 8000))

app.include_router(routes.router)

# Ensure logging is appropriately configured
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Potentially add more startup/shutdown events for better control over the lifecycle of the app
