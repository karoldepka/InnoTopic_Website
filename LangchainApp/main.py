from fastapi import FastAPI
import logging
from dotenv import load_dotenv
import os
from app.routes import llm_routes
from slowapi.errors import RateLimitExceeded
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address

load_dotenv()

app = FastAPI()

# Initialize the rate limiter and middleware
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.include_router(llm_routes.router)

@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request, exc):
    return JSONResponse(
        status_code=429,
        content={"detail": "Rate limit exceeded"}
    )

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
