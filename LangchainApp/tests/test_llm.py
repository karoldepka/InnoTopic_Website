# tests/test_llm.py
import os
import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def setup_module(module):
    # Initialize the database with test data
    from app.utils.rag_retriever import init_db, insert_vectors
    DB_PATH = "app/utils/vector_store.db"
    init_db(DB_PATH)
    DOCUMENT_STORE = [
        {"content": "The universe is vast and ever-expanding."},
        {"content": "Quantum mechanics deals with the behavior of particles on a very small scale."},
        {"content": "Artificial intelligence is a rapidly growing field with many applications."},
    ]
    insert_vectors(DOCUMENT_STORE, DB_PATH)

def teardown_module(module):
    # Clean up the database file after tests
    DB_PATH = "app/utils/vector_store.db"
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)

def test_generate_endpoint():
    response = client.post("/generate/", json={"prompt": "Tell me about the universe."})
    assert response.status_code == 200
    json_response = response.json()
    assert "response" in json_response
    assert json_response["response"] == "Response based on the prompt: 'Tell me about the universe.' and document: 'The universe is vast and ever-expanding.'"

def test_generate_no_documents():
    teardown_module(None)  # Ensure no documents are in the database
    response = client.post("/generate/", json={"prompt": "Tell me about something unknown."})
    assert response.status_code == 200
    json_response = response.json()
    assert "response" in json_response
    assert json_response["response"] == "No relevant documents found for the prompt: 'Tell me about something unknown.'"
