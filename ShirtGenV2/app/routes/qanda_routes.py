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

@router.post("/qanda")
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

