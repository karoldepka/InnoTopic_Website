# prompt_routes.py

from fastapi import APIRouter, HTTPException, Request
from app.models.prompt_request_model import PromptRequest
from app.models.user_settings_model import UserSettingsRequest
from app.services.prompt_service import (
    generate_svgs_from_prompt,
    get_query_logs,
    search_query,
    set_query_parameters,
    get_query_parameters
)
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/process-prompt")
async def generate_svgs(request: Request, request_data: PromptRequest):
    """
    Endpoint to process the prompt and generate a specified number of SVGs.
    """
    logger.info(f"Processing prompt: {request_data.prompt} with {request_data.num_logos} logos")
    try:
        # Call the service to generate the SVGs
        response = generate_svgs_from_prompt(request_data.prompt, request_data.num_logos)
        if not response:
            raise HTTPException(status_code=500, detail="Failed to generate SVGs.")
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
    Check the health status of the service.
    """
    return {"status": "Healthy"}

# In-memory store for user settings (consider persistent storage for production)
user_settings_store = {}

@router.post("/save-settings")
async def save_settings(request_data: UserSettingsRequest):
    """
    Save settings for a specific user.
    """
    logger.info(f"Saving settings for user ID: {request_data.user_id}")
    user_settings_store[request_data.user_id] = request_data.settings
    return {"status": "Settings saved"}

@router.get("/get-settings/{user_id}")
async def get_settings(user_id: str):
    """
    Retrieve settings for a specific user.
    """
    logger.info(f"Fetching settings for user ID: {user_id}")
    settings = user_settings_store.get(user_id)

    if settings is None:
        logger.warning(f"No settings found for user ID: {user_id}")
        raise HTTPException(status_code=404, detail="User settings not found.")

    return {"settings": settings}

@router.post("/webhook")
async def handle_webhook(request: Request):
    """
    Handle incoming webhook events.
    """
    try:
        payload = await request.json()
        logger.info(f"Webhook event received: {payload}")
        # Add further processing logic here
        return {"status": "Webhook received"}

    except Exception as e:
        logger.error(f"Error handling webhook: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to process webhook")

@router.get("/get-query-log")
async def get_query_log():
    """
    Retrieve logs of previous queries.
    """
    try:
        logs = get_query_logs()
        return {"logs": logs}

    except Exception as e:
        logger.error(f"Error retrieving query logs: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to retrieve query logs")

@router.post("/set-query-parameters")
async def set_query_params(request: Request):
    """
    Set default query parameters.
    """
    try:
        params = await request.json()
        set_query_parameters(params)
        return {"status": "Query parameters set"}

    except Exception as e:
        logger.error(f"Error setting query parameters: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to set query parameters")

@router.get("/get-query-parameters")
async def get_query_params():
    """
    Retrieve the current query parameters.
    """
    try:
        params = get_query_parameters()
        return {"parameters": params}

    except Exception as e:
        logger.error(f"Error retrieving query parameters: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to retrieve query parameters")

@router.post("/search")
async def search(request: Request):
    """
    Perform a search based on the provided query.
    """
    try:
        search_params = await request.json()
        results = search_query(search_params)
        return {"results": results}

    except Exception as e:
        logger.error(f"Error during search: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Search failed")
