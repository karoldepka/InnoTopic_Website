from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict
from openai import OpenAI
import os
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

@router.post("/chat")
async def chat_endpoint(request_data: ChatRequest):
    logger.info(f"Received chat request with {len(request_data.messages)} messages")
    
    # Initialize standard openai client (relies on OPENAI_API_KEY environment variable)
    client = OpenAI()
    
    # Format messages dictionary for OpenAI API
    api_messages = [{"role": msg.role, "content": msg.content} for msg in request_data.messages]
    
    def event_generator():
        try:
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=api_messages,
                stream=True
            )
            for chunk in response:
                if chunk.choices and chunk.choices[0].delta.content is not None:
                    yield chunk.choices[0].delta.content
        except Exception as e:
            logger.error(f"Error during streaming completion: {e}", exc_info=True)
            yield f"\n[Error: {str(e)}]"

    return StreamingResponse(event_generator(), media_type="text/plain")
