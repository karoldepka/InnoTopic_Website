# prompt_routes.py - Refactored for better error handling and scalability
from fastapi import APIRouter, HTTPException, Request
from app.models.prompt_request_model import PromptRequest
from app.models.user_settings_model import UserSettingsRequest
from app.services.prompt_service import generate_svgs_from_prompt
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/process-prompt")
async def generate(request: Request, request_data: PromptRequest):
    """
    Endpoint to process the prompt and generate SVGs.
    """
    logger.info("Generating response for request: %s", request_data)
    try:
        response = generate_svgs_from_prompt(request_data.prompt)
        if not response:
            raise HTTPException(status_code=500, detail="Failed to generate response.")
        return {"response": response}
    except HTTPException as http_err:
        # Specific handling for HTTP-related errors
        logger.error(f"HTTP error: {str(http_err)}", exc_info=True)
        raise
    except Exception as e:
        # Generic error handling
        logger.error(f"Unexpected error processing prompt: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.get("/health")
async def health_check():
    """
    Health check endpoint to verify if the service is up and running.
    """
    return {"status": "Healthy"}

# In-memory store for user settings (Consider using a database or persistent storage for scalability)
user_settings_store = {}

@router.post("/save-settings")
async def save_settings(request_data: UserSettingsRequest):
    """
    Save user-specific settings.
    """
    logger.info("Saving settings for user: %s", request_data.user_id)
    user_settings_store[request_data.user_id] = request_data.settings
    return {"status": "Settings saved"}

@router.get("/get-settings/{user_id}")
async def get_settings(user_id: str):
    """
    Retrieve user-specific settings.
    """
    logger.info("Fetching settings for user: %s", user_id)
    settings = user_settings_store.get(user_id)
    
    if settings is None:
        logger.warning(f"No settings found for user: {user_id}")
        raise HTTPException(status_code=404, detail="User settings not found.")
    
    return {"settings": settings}

