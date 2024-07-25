from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import List

from models import request_models, response_models

router = APIRouter()

@router.get("/")
def hello_world():
    return { "message": "Hello World!"}

@router.post("/shirt-gen/prompt", response_model=response_models.PromptResponse)
async def create_prompt(request: request_models.PromptRequest):
    return {"prompt": "Result"}