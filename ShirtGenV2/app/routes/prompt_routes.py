import logging

from fastapi import APIRouter, HTTPException, Request

from app.models.prompt_request_model import PromptRequest
from app.services.prompt_service import generate_svgs_from_prompt

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/prompt")
async def generate(request: Request, request_data: PromptRequest):
    logger.info("Generating response for request: %s", request_data)
    response = generate_svgs_from_prompt(request_data.prompt)
    if response == "An error occurred while generating the response.":
        raise HTTPException(status_code=500, detail="Internal Server Error")
    return {"response": response}
