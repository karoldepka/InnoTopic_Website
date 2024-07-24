import httpx

OLLAMA_API_URL = "https://api.ollama.com/your-endpoint"  # Replace with your Ollama API endpoint
OLLAMA_API_KEY = "your-ollama-api-key"  # Replace with your Ollama API key

async def call_ollama_api(text: str) -> str:
    async with httpx.AsyncClient() as client:
        headers = {
            "Authorization": f"Bearer {OLLAMA_API_KEY}",
            "Content-Type": "application/json"
        }
        data = {"text": text}
        response = await client.post(OLLAMA_API_URL, json=data, headers=headers)
        response.raise_for_status()
        return response.json()["result"]

async def process_text(text: str) -> str:
    result = await call_ollama_api(text)
    return result
