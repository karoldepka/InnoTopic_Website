import requests
import os
from dotenv import load_dotenv

load_dotenv()

OLLAMA_API_URL = os.getenv('OLLAMA_API_URL')
OLLAMA_API_KEY = os.getenv('OLLAMA_API_KEY')

def test_ollama_api(prompt):
    headers = {
        "Authorization": f"Bearer {OLLAMA_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "dolphin-llama3:8b-256k",
        "prompt": prompt,
        "stream": False
    }
    response = requests.post(OLLAMA_API_URL, headers=headers, json=data)
    response.raise_for_status()
    return response.json()

if __name__ == "__main__":
    prompt = "people with technology"
    response = test_ollama_api(prompt)
    print(response)
