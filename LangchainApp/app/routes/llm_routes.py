# app/routes/llm_routes.py
from fastapi import APIRouter, HTTPException
from app.models.prompt_models import PromptRequest, PromptResponse
from app.services.llm_service import generate_response_with_rag

router = APIRouter()

@router.post("/generate/", response_model=PromptResponse)
async def generate(prompt_request: PromptRequest):
    try:
        response = generate_response_with_rag(prompt_request.prompt)
        return PromptResponse(response=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
