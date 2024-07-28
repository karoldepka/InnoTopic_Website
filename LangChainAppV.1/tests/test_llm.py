import pytest
from fastapi.testclient import TestClient
from main import app
import logging

client = TestClient(app)
logging.basicConfig(level=logging.INFO)

def test_generate_no_documents():
    logging.info("Starting test_generate_no_documents.")
    response = client.post("/generate/", json={"prompt": "Tell me about something unknown."})
    assert response.status_code == 200
    json_response = response.json()
    assert "response" in json_response
    assert json_response["response"] == "Static response for the prompt: 'Tell me about something unknown.'"
