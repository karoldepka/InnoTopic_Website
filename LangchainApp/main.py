# main.py
from fastapi import FastAPI
import logging
from dotenv import load_dotenv
import os

from app.routes import llm_routes

load_dotenv()

app = FastAPI()

app.include_router(llm_routes.router)

# Logging configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_model_path():
    model_path = os.getenv("OLLAMA_MODEL_PATH")
    if not model_path:
        logger.warning("OLLAMA_MODEL_PATH is not configured. Please set the model path.")
    else:
        logger.info(f"Model path is set to: {model_path}")

if __name__ == "__main__":
    import uvicorn
    check_model_path()
    uvicorn.run(app, host="0.0.0.0", port=8000)
