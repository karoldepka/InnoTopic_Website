# Potential Refactoring for better error handling and scalability
from fastapi import APIRouter, HTTPException, Request
from app.models.prompt_request_model import PromptRequest
from app.models.user_settings_model import UserSettingsRequest
from app.services.prompt_service import generate_svgs_from_prompt
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/process-prompt")
async def generate(request: Request, request_data: PromptRequest):
    logger.info("Generating response for request: %s", request_data)
    try:
        response = generate_svgs_from_prompt(request_data.prompt)
        if not response:
            raise HTTPException(status_code=500, detail="Failed to generate response.")
        return {"response": response}
    except Exception as e:
        logger.error(f"Error processing prompt: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.get("/health")
async def health_check():
    return {"status": "Healthy"}

user_settings_store = {}  # Consider migrating to persistent storage for scalability

@router.post("/save-settings")
async def save_settings(request_data: UserSettingsRequest):
    logger.info("Saving settings for user: %s", request_data.user_id)
    user_settings_store[request_data.user_id] = request_data.settings
    return {"status": "Settings saved"}

@router.get("/get-settings/{user_id}")
async def get_settings(user_id: str):
    logger.info("Fetching settings for user: %s", user_id)
    settings = user_settings_store.get(user_id, {})
    return {"settings": settings}
