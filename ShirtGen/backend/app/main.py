from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from .logo_processor import process_prompt

app = FastAPI()

class PromptRequest(BaseModel):
    prompt: str

@app.post("/api/process-prompt")
async def process_prompt_endpoint(request: PromptRequest):
    try:
        result = process_prompt(request.prompt)
        if not result:
            raise HTTPException(status_code=404, detail="No logos found")
        return {"logos": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
