from fastapi import FastAPI, HTTPException, Request, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import httpx
import logging
from typing import List, Dict
from app.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI app
app = FastAPI(title="Ollama API Wrapper", description="A FastAPI wrapper for the Ollama API")

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Configuration
OLLAMA_API_BASE_URL = settings.ollama_api_base_url

class Query(BaseModel):
    prompt: str = Field(..., description="The prompt to generate text from")
    model: str = Field(settings.default_model, description="The model to use for generation")

class Conversation(BaseModel):
    id: str
    messages: List[Dict[str, str]] = []

conversations: Dict[str, Conversation] = {}

async def get_client():
    async with httpx.AsyncClient() as client:
        yield client

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return {"detail": str(exc.detail)}

@app.post("/generate", summary="Generate text based on a prompt")
async def generate(query: Query, client: httpx.AsyncClient = Depends(get_client)):
    """
    Generate text using the specified model and prompt.
    """
    try:
        logger.info(f"Received generate request with data: {query.dict()}")
        
        response = await client.post(
            f"{OLLAMA_API_BASE_URL}/api/generate",
            json=query.dict(),
            timeout=30.0
        )
        
        logger.info(f"Response status code: {response.status_code}")
        logger.info(f"Response text: {response.text}")
        response.raise_for_status()
        
        response_data = response.json()
        logger.info(f"Response from Ollama: {response_data}")
        
        return {
            "response": response_data.get("response", ""),
            "model": response_data.get("model", ""),
            "created_at": response_data.get("created_at", ""),
            "total_duration": response_data.get("total_duration", 0),
            "eval_count": response_data.get("eval_count", 0)
        }
    
    except httpx.RequestError as re:
        logger.error(f"Request error while communicating with Ollama: {re}")
        raise HTTPException(status_code=500, detail=f"Error communicating with Ollama API: {re}")
    except httpx.HTTPStatusError as he:
        logger.error(f"HTTP error while communicating with Ollama: {he}")
        raise HTTPException(status_code=500, detail=f"HTTP error from Ollama API: {he}")
    except ValueError as ve:
        logger.error(f"JSON decode error: {ve}")
        raise HTTPException(status_code=500, detail=f"Invalid JSON response from Ollama API: {ve}")
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {e}")

@app.get("/models", summary="List available models")
async def list_models(client: httpx.AsyncClient = Depends(get_client)):
    """
    Retrieve a list of available models from the Ollama API.
    """
    logger.info("Received request to list models")
    try:
        response = await client.get(f"{OLLAMA_API_BASE_URL}/api/tags")
        
        logger.info(f"Response status code: {response.status_code}")
        logger.info(f"Response text: {response.text}")
        response.raise_for_status()
        
        models = response.json().get("models", [])
        logger.info(f"Available models: {models}")
        return {"models": models}
    
    except httpx.RequestException as e:
        logger.error(f"Error fetching models from Ollama: {e}")
        raise HTTPException(status_code=500, detail=f"Error fetching models: {e}")

@app.post("/conversation/start", summary="Start a new conversation")
async def start_conversation(conv_id: str):
    """
    Start a new conversation with the given ID.
    """
    logger.info(f"Received request to start conversation with ID: {conv_id}")
    if conv_id in conversations:
        logger.error(f"Conversation ID {conv_id} already exists")
        raise HTTPException(status_code=400, detail="Conversation ID already exists")
    conversations[conv_id] = Conversation(id=conv_id)
    logger.info(f"Conversation {conv_id} started")
    return {"message": f"Conversation {conv_id} started"}

@app.post("/conversation/{conv_id}/message", summary="Add a message to a conversation")
async def add_message(conv_id: str, query: Query, client: httpx.AsyncClient = Depends(get_client)):
    """
    Add a message to an existing conversation and get a response.
    """
    logger.info(f"Received message for conversation {conv_id} with query: {query}")
    if conv_id not in conversations:
        logger.error(f"Conversation {conv_id} not found")
        raise HTTPException(status_code=404, detail="Conversation not found")
    
    conversation = conversations[conv_id]
    conversation.messages.append({"role": "user", "content": query.prompt})
    
    try:
        context = "\n".join([f"{m['role']}: {m['content']}" for m in conversation.messages])
        response = await client.post(
            f"{OLLAMA_API_BASE_URL}/api/generate",
            json={"model": query.model, "prompt": context},
            timeout=30.0
        )
        
        logger.info(f"Response status code: {response.status_code}")
        logger.info(f"Response text: {response.text}")
        response.raise_for_status()
        
        response_data = response.json()
        generated_text = response_data.get("response", "")
        conversation.messages.append({"role": "assistant", "content": generated_text})
        logger.info(f"Generated text added to conversation {conv_id}: {generated_text}")
        
        return {
            "generated_text": generated_text,
            "model": response_data.get("model", ""),
            "created_at": response_data.get("created_at", ""),
            "total_duration": response_data.get("total_duration", 0),
            "eval_count": response_data.get("eval_count", 0)
        }
    
    except httpx.RequestException as e:
        logger.error(f"Error communicating with Ollama: {e}")
        raise HTTPException(status_code=500, detail=f"Error communicating with Ollama: {e}")

@app.get("/conversation/{conv_id}", summary="Get conversation history")
async def get_conversation(conv_id: str):
    """
    Retrieve the conversation history for the given conversation ID.
    """
    logger.info(f"Received request to get conversation with ID: {conv_id}")
    if conv_id not in conversations:
        logger.error(f"Conversation {conv_id} not found")
        raise HTTPException(status_code=404, detail="Conversation not found")
    logger.info(f"Returning conversation {conv_id}")
    return conversations[conv_id]

@app.get("/health", summary="Check API health")
async def health_check(client: httpx.AsyncClient = Depends(get_client)):
    """
    Check the health of the API and its connection to the Ollama API.
    """
    try:
        response = await client.get(f"{OLLAMA_API_BASE_URL}/api/tags")
        response.raise_for_status()
        return {"status": "healthy", "ollama_api": "accessible"}
    except httpx.RequestException as e:
        logger.error(f"Health check failed: {e}")
        return {"status": "unhealthy", "ollama_api": "inaccessible"}

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting FastAPI application")
    uvicorn.run(app, host=settings.fastapi_host, port=settings.fastapi_port)
