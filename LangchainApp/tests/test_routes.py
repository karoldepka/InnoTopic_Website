from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_process_text():
    response = client.post("/process-text", json={"text": "Hello, LangChain!"})
    assert response.status_code == 200
    assert response.json() == {"result": "processed text"}
