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
-   `POST /copilotkit-agui`: Stream a CopilotKit/AG-UI run over Server-Sent Events.
-   `POST /ai-api/copilotkit-agui`: Same endpoint through the frontend API prefix.
    -   Body: AG-UI `RunAgentInput` with `threadId`, `runId`, `messages`, `state`, `tools`, `context`, and `forwardedProps`.
    -   Returns: `text/event-stream` events for `RUN_STARTED`, `TEXT_MESSAGE_*`, and `RUN_FINISHED`.

## CopilotKit Comparison UI

The Angular app exposes `/copilotkit`.

-   Angular pane: a direct Angular/Ionic chat UI that streams from `/ai-api/copilotkit-agui`.
-   React pane: an embedded React iframe built from `src/copilotkit-react-embed/main.js`, using CopilotKit React v2 plus `HttpAgent` against the same Python endpoint.

Build the React iframe asset with:
```bash
npm run build:copilotkit-react
```

`npm run build`, `npm start`, and `npm run startWithAutoReload` run that asset build before Angular.
