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
    except requests.ConnectionError:
        logger.error("Failed to connect to the Ollama API. Please ensure it is running and accessible.")
        return "Failed to connect to the Ollama API."
    except requests.HTTPError as e:
        logger.error(f"HTTP error occurred: {e}")
        return "An HTTP error occurred while generating the response."
    except Exception as e:
        logger.error(f"An unexpected error occurred: {e}")
        return "An unexpected error occurred while generating the response."
