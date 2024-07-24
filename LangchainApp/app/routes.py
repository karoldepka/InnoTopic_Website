from fastapi import APIRouter, HTTPException
from app.services.langchain_service import process_text
from app.models.request_models import TextRequest
from app.models.response_models import TextResponse

router = APIRouter()

@router.post("/process-text", response_model=TextResponse)
async def process_text_route(request: TextRequest):
    try:
        result = await process_text(request.text)
        return TextResponse(result=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
