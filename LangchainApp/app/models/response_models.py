from pydantic import BaseModel

class TextResponse(BaseModel):
    result: str
