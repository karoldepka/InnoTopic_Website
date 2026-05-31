# Python AI Backend

This backend provides AI-assisted answers for quiz questions and learning items using LangChain and Ollama.

## Setup

1.  Navigate to the `backend-python` directory:
    ```bash
    cd backend-python
    ```
2.  The virtual environment is already created in `venv`.
3.  Install dependencies:
    ```bash
    .\venv\Scripts\pip install -r requirements.txt
    ```
4.  Make sure Ollama is running and the `llama3.2` model is installed:
    ```bash
    ollama pull llama3.2
    ```

## Running the Backend

Start the FastAPI server:
```bash
.\venv\Scripts\python main.py
```
The server will start on `http://localhost:8000`.

## API Endpoints

-   `GET /health`: Check if the backend is running.
-   `GET /ai-api/health`: Check if the backend is running through the frontend API prefix.
-   `POST /generate-answer`: Generate an AI answer.
-   `POST /ai-api/generate-answer`: Generate an AI answer through the frontend API prefix.
    -   Body: `{ "question": "string", "context": "string" }`
    -   Returns: `{ "answer": "string" }`
