import logging
import os
import requests

logger = logging.getLogger(__name__)

ollama_api_url = os.getenv("OLLAMA_API_URL")

def generate_response_with_rag(prompt: str) -> str:
    logger.info(f"Received prompt: {prompt}")
    try:
        response = requests.post(
            f"{ollama_api_url}/generate",
            json={"prompt": prompt}
        )
        response.raise_for_status()
        result = response.json()
        logger.info(f"Generated response: {result['response']}")
        return result['response']
    except Exception as e:
        logger.error(f"Error generating response: {e}")
        return "An error occurred while generating the response."
