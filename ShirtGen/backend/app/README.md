# Shirt Generator Backend

This is the backend service for the Shirt Generator application, built with FastAPI. It handles user prompts, processes them, and fetches relevant logos from the Noun Project API.

## Features

- Accepts user prompts via a FastAPI endpoint.
- Processes prompts to search for related logos.
- Integrates with the Noun Project API for fetching logos.

## Getting Started

### Prerequisites

- Python 3.7+
- Windows 10 or 11

### Setup and Run

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/shirt-generator.git
    cd shirt-generator\backend
    ```

2. Create a `.env` file in the `backend` directory and add your Noun Project API credentials:
    ```sh
    echo NOUN_PROJECT_API_KEY=your_api_key > .env
    echo NOUN_PROJECT_API_SECRET=your_api_secret >> .env
    ```

3. Run the setup and start script:
    ```sh
    setup_and_run.bat
    ```

4. The server will be running at `http://localhost:8000`.

### API Endpoints

- `POST /api/process-prompt`
  - Request Body: `{ "prompt": "your prompt here" }`
  - Response: `[ "logo_url1", "logo_url2", ... ]`

### Components

- `LogoList.js`: Displays the list of logos fetched from the backend.
- `SearchForm.js`: Form for entering and submitting prompts.

## License

This project is licensed under the MIT License.
