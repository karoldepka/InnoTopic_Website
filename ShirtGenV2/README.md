# Shirt Logo Generator FastAPI with Langchain

This is a FastAPI project that integrates with Langchain to generate shirts from the topic which user enters as a prompt.

## Prerequisites

- Python 3.7 or higher
- Poetry (Python dependency management tool)
- OpenAI API key

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/your-username/fastapi-langchain.git
   ```

2. Navigate to the project directory:

   ```
   cd fastapi-langchain
   ```

3. Install the project dependencies using Poetry:

   ```
   poetry install
   ```

4. Copy `.env` from `.env~template`

   ```
   OPENAI_API_KEY=<your openai key>
   NOUN_PROJECT_API_KEY=<api key from noun api>
   NOUN_PROJECT_API_SECRET=<api secret from noun api>
   ```

   Add your API key and secrets for above environment variables

## Running the Application

Start the FastAPI server:

```
fastapi dev
```

This will start the server at `http://localhost:8000`.

## Project Structure

- `main.py`: The main FastAPI application file that sets up the API endpoints and Langchain components.
- `pyproject.toml`: The Poetry configuration file.

## Dependencies

- [FastAPI](https://fastapi.tiangolo.com/): A modern, fast (high-performance), web framework for building APIs with Python.
- [Langchain](https://www.langchain.com/): A framework for building applications with large language models (LLMs).
- [OpenAI](https://openai.com/): The OpenAI API is used for text embeddings.
- [Uvicorn](https://www.uvicorn.org/): A lightning-fast ASGI server implementation, using uvloop and httptools.

## License

This project is licensed under the [MIT License](LICENSE).