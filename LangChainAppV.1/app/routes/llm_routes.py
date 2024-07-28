from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from app.services.llm_service import generate_response_with_rag
from app.services.translation_service import translate_text
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

class PromptRequest(BaseModel):
    prompt: str

# Initialize the rate limiter
limiter = Limiter(key_func=get_remote_address)

@router.post("/generate/")
@limiter.limit("5/minute")
async def generate(request: Request, request_data: PromptRequest):
    logger.info("Generating response for request: %s", request_data)
    response = generate_response_with_rag(request_data.prompt)
    if response == "An error occurred while generating the response.":
        raise HTTPException(status_code=500, detail="Internal Server Error")
    return {"response": response}

class TranslateRequest(BaseModel):
    text: str
    target_language: str

@router.post("/translate/")
async def translate(request: TranslateRequest):
    logger.info("Translating text for request: %s", request)
    translation = translate_text(request.text, request.target_language)
    if translation is None:
        raise HTTPException(status_code=500, detail="Internal Server Error")
    return {"translation": translation}

