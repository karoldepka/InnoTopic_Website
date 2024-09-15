# app/models/prompt_request_model.py

from pydantic import BaseModel

class QAndAPromptRequest(BaseModel):
    ...
    # prompt: str
    # num_logos: int = 5  # Default to 5 if not provided
