from fastapi import APIRouter, HTTPException, Depends
from app.services.langchain_service import process_text, summarize_text
from app.models.request_models import TextRequest
from app.models.response_models import TextResponse
from app.auth import get_current_user

router = APIRouter()

@router.post("/process-text", response_model=TextResponse)
async def process_text_route(request: TextRequest):
    try:
        result = await process_text(request.text)
        return TextResponse(result=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/summarize-text", response_model=TextResponse)
async def summarize_text_route(request: TextRequest):
    try:
        result = await summarize_text(request.text)
        return TextResponse(result=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/protected-route")
async def protected_route(current_user: dict = Depends(get_current_user)):
    return {"message": "You are authorized", "user": current_user}
