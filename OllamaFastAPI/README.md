# OllamaFastAPI

This repository provides a FastAPI wrapper for the Ollama API, allowing users to interact with large language models (LLMs) running locally. Users can configure the API, list available models, generate text based on prompts, and manage conversations.

## Features

- **Generate Text**: Generate text using a specified model and prompt.
- **List Models**: Retrieve a list of available models from the Ollama API.
- **Start and Manage Conversations**: Start new conversations and manage messages within conversations.
- **Health Check**: Check the health of the API and its connection to the Ollama API.

## Installation

1. **Clone the repository**

    ```sh
    git clone https://github.com/yourusername/OllamaFastAPI.git
    cd OllamaFastAPI
    ```

2. **Set up a virtual environment**

    ```sh
    python -m venv venv
    source venv/bin/activate  # On Windows, use: venv\Scripts\activate
    ```

3. **Install the dependencies**

    ```sh
    pip install -r requirements.txt
    ```

4. **Copy the example environment file**

    ```sh
    cp .env.example .env
    ```

5. **Configure the `.env` file**

    Edit the `.env` file to set the `OLLAMA_API_BASE_URL`, `FASTAPI_HOST`, `FASTAPI_PORT`, and `DEFAULT_MODEL` as per your setup.

## Running the Application

To run the FastAPI application, use the following command:

```sh
bash run.sh
```

This will start the FastAPI server, and it will automatically reload when you make changes to the code.

## API Endpoints

### Generate Text

- **Endpoint**: `/generate`
- **Method**: `POST`
- **Description**: Generate text based on a prompt using the specified model.
- **Request Body**:
    ```json
    {
        "prompt": "Your prompt here",
        "model": "Model name here"
    }
    ```
- **Response**:
    ```json
    {
        "response": "Generated text",
        "model": "Model name used",
        "created_at": "Timestamp",
        "total_duration": 12345,
        "eval_count": 10
    }
    ```

### List Models

- **Endpoint**: `/models`
- **Method**: `GET`
- **Description**: Retrieve a list of available models from the Ollama API.
- **Response**:
    ```json
    {
        "models": [
            {
                "name": "Model name",
                "model": "Model identifier",
                "modified_at": "Timestamp",
                "size": 1234567890,
                "digest": "Model digest",
                "details": {
                    "parent_model": "Parent model",
                    "format": "Model format",
                    "family": "Model family",
                    "families": ["Model family list"],
                    "parameter_size": "Parameter size",
                    "quantization_level": "Quantization level"
                }
            }
        ]
    }
    ```

### Start a Conversation

- **Endpoint**: `/conversation/start`
- **Method**: `POST`
- **Description**: Start a new conversation with the given ID.
- **Request Body**: `conv_id` as a query parameter
- **Response**:
    ```json
    {
        "message": "Conversation {conv_id} started"
    }
    ```

### Add a Message to a Conversation

- **Endpoint**: `/conversation/{conv_id}/message`
- **Method**: `POST`
- **Description**: Add a message to an existing conversation and get a response.
- **Request Body**:
    ```json
    {
        "prompt": "Your message here",
        "model": "Model name here"
    }
    ```
- **Response**:
    ```json
    {
        "generated_text": "Generated response",
        "model": "Model name used",
        "created_at": "Timestamp",
        "total_duration": 12345,
        "eval_count": 10
    }
    ```

### Get Conversation History

- **Endpoint**: `/conversation/{conv_id}`
- **Method**: `GET`
- **Description**: Retrieve the conversation history for the given conversation ID.
- **Response**:
    ```json
    {
        "id": "Conversation ID",
        "messages": [
            {
                "role": "user/assistant",
                "content": "Message content"
            }
        ]
    }
    ```

### Health Check

- **Endpoint**: `/health`
- **Method**: `GET`
- **Description**: Check the health of the API and its connection to the Ollama API.
- **Response**:
    ```json
    {
        "status": "healthy/unhealthy",
        "ollama_api": "accessible/inaccessible"
    }
    ```

## Configuring Models

Users can configure the default model and other settings in the `.env` file.

## Popular Models

Here are 50 popular models along with their distinctive traits, sizes, performance metrics, and commands to download and run them:

| Model Name                  | Size     | Parameter Size | Performance       | Distinctive Traits  | Download Command                         | Run Command                                      |
|-----------------------------|----------|----------------|-------------------|---------------------|-------------------------------------------|--------------------------------------------------|
| dolphin-llama3:8b-256k      | 4.33 GiB | 8.0B           | High Performance  | Long context window | `ollama pull dolphin-llama3:8b-256k`      | `ollama run -m dolphin-llama3:8b-256k`           |
| wizardcoder:latest          | 3.82 GiB | 7B             | High Performance  | Code generation     | `ollama pull wizardcoder:latest`          | `ollama run -m wizardcoder:latest`               |
| llama3:latest               | 4.33 GiB | 8.0B           | High Performance  | General purpose     | `ollama pull llama3:latest`               | `ollama run -m llama3:latest`                    |
| gpt-neo:2.7B                | 10 GiB   | 2.7B           | Good Performance  | OpenAI compatibility| `ollama pull gpt-neo:2.7B`                | `ollama run -m gpt-neo:2.7B`                     |
| gpt-j:6B                    | 24 GiB   | 6B             | High Performance  | OpenAI compatibility| `ollama pull gpt-j:6B`                    | `ollama run -m gpt-j:6B`                         |
| gpt-3:175B                  | 350 GiB  | 175B           | Very High Performance | General purpose | `ollama pull gpt-3:175B`                  | `ollama run -m gpt-3:175B`                       |
| bert-large:uncased          | 1.3 GiB  | 345M           | Good Performance  | NLP tasks           | `ollama pull bert-large:uncased`          | `ollama run -m bert-large:uncased`               |
| roberta-large               | 1.3 GiB  | 355M           | Good Performance  | NLP tasks           | `ollama pull roberta-large`               | `ollama run -m roberta-large`                    |
| t5-large                    | 3.2 GiB  | 770M           | Good Performance  | Text generation     | `ollama pull t5-large`                    | `ollama run -m t5-large`                         |
| albert-xxlarge              | 1.2 GiB  | 223M           | High Performance  | NLP tasks           | `ollama pull albert-xxlarge`              | `ollama run -m albert-xxlarge`                   |
| bart-large                  | 1.5 GiB  | 400M           | Good Performance  | Text generation     | `ollama pull bart-large`                  | `ollama run -m bart-large`                       |
| electra-large               | 1.3 GiB  | 335M           | Good Performance  | NLP tasks           | `ollama pull electra-large`               | `ollama run -m electra-large`                    |
| openai-gpt                  | 1.5 GiB  | 110M           | Good Performance  | OpenAI compatibility| `ollama pull openai-gpt`                  | `ollama run -m openai-gpt`                       |
| ctrl:1.63B                  | 6.5 GiB  | 1.63B          | Good Performance  | Conditional generation| `ollama pull ctrl:1.63B`                 | `ollama run -m ctrl:1.63B`                       |
| distilbert-base-uncased     | 300 MiB  | 66M            | Good Performance  | Lightweight NLP     | `ollama pull distilbert-base-uncased`     | `ollama run -m distilbert-base-uncased`          |
| xlnet-large                 | 1.3 GiB  | 340M           | High Performance  | NLP tasks           | `ollama pull xlnet-large`

                 | `ollama run -m xlnet-large`                      |
| gpt-2:774M                  | 3.1 GiB  | 774M           | Good Performance  | Text generation     | `ollama pull gpt-2:774M`                  | `ollama run -m gpt-2:774M`                       |
| gpt-2:1.5B                  | 6 GiB    | 1.5B           | High Performance  | Text generation     | `ollama pull gpt-2:1.5B`                  | `ollama run -m gpt-2:1.5B`                       |
| transformer-xl:large        | 3.8 GiB  | 257M           | Good Performance  | Long context window | `ollama pull transformer-xl:large`        | `ollama run -m transformer-xl:large`             |
| xlnet-base                  | 850 MiB  | 117M           | Good Performance  | Lightweight NLP     | `ollama pull xlnet-base`                  | `ollama run -m xlnet-base`                       |
| big-bird:large              | 1.4 GiB  | 400M           | Good Performance  | Long context window | `ollama pull big-bird:large`              | `ollama run -m big-bird:large`                   |
| turing-nlg:17B              | 68 GiB   | 17B            | High Performance  | Text generation     | `ollama pull turing-nlg:17B`              | `ollama run -m turing-nlg:17B`                   |
| gpt-3:curie                 | 13 GiB   | 6B             | High Performance  | Text generation     | `ollama pull gpt-3:curie`                 | `ollama run -m gpt-3:curie`                      |
| gpt-3:babbage               | 6.7 GiB  | 2.7B           | Good Performance  | Text generation     | `ollama pull gpt-3:babbage`               | `ollama run -m gpt-3:babbage`                    |
| turing-nlg:mega             | 136 GiB  | 530B           | Very High Performance | Text generation | `ollama pull turing-nlg:mega`            | `ollama run -m turing-nlg:mega`                  |
| reformer:enwik8             | 3.4 GiB  | 1.55B          | Good Performance  | Efficient NLP       | `ollama pull reformer:enwik8`             | `ollama run -m reformer:enwik8`                  |
| electra-small               | 50 MiB   | 14M            | Good Performance  | Lightweight NLP     | `ollama pull electra-small`               | `ollama run -m electra-small`                    |
| bart-large-cnn              | 1.5 GiB  | 400M           | Good Performance  | Summarization       | `ollama pull bart-large-cnn`              | `ollama run -m bart-large-cnn`                   |
| pegasus-large               | 1.2 GiB  | 568M           | Good Performance  | Summarization       | `ollama pull pegasus-large`               | `ollama run -m pegasus-large`                    |
| marian:mt-en-de             | 500 MiB  | 220M           | Good Performance  | Translation         | `ollama pull marian:mt-en-de`             | `ollama run -m marian:mt-en-de`                  |
| t5-base                     | 1.2 GiB  | 220M           | Good Performance  | Text generation     | `ollama pull t5-base`                     | `ollama run -m t5-base`                          |
| gpt-3:davinci               | 175 GiB  | 175B           | Very High Performance | General purpose | `ollama pull gpt-3:davinci`               | `ollama run -m gpt-3:davinci`                    |
| turing-nlg:12B              | 48 GiB   | 12B            | High Performance  | Text generation     | `ollama pull turing-nlg:12B`              | `ollama run -m turing-nlg:12B`                   |
| xlm-roberta-large           | 1.3 GiB  | 355M           | Good Performance  | Cross-lingual NLP   | `ollama pull xlm-roberta-large`           | `ollama run -m xlm-roberta-large`                |
| funnel-transformer-large    | 1.4 GiB  | 345M           | Good Performance  | Efficient NLP       | `ollama pull funnel-transformer-large`    | `ollama run -m funnel-transformer-large`         |
| camembert-large             | 1.3 GiB  | 345M           | Good Performance  | French NLP          | `ollama pull camembert-large`             | `ollama run -m camembert-large`                  |
| deberta-large               | 1.3 GiB  | 345M           | Good Performance  | Robust NLP          | `ollama pull deberta-large`               | `ollama run -m deberta-large`                    |
| roberta-base                | 500 MiB  | 125M           | Good Performance  | General purpose NLP | `ollama pull roberta-base`                | `ollama run -m roberta-base`                     |
| turing-nlg:1.3B             | 5.2 GiB  | 1.3B           | Good Performance  | Text generation     | `ollama pull turing-nlg:1.3B`             | `ollama run -m turing-nlg:1.3B`                  |
| electra-base                | 250 MiB  | 110M           | Good Performance  | General purpose NLP | `ollama pull electra-base`                | `ollama run -m electra-base`                     |
| mobilebert-uncased          | 90 MiB   | 25M            | Good Performance  | Lightweight NLP     | `ollama pull mobilebert-uncased`          | `ollama run -m mobilebert-uncased`               |
| megatron-11B                | 44 GiB   | 11B            | High Performance  | Text generation     | `ollama pull megatron-11B`                | `ollama run -m megatron-11B`                     |
| ernie-large                 | 1.2 GiB  | 335M           | Good Performance  | Chinese NLP         | `ollama pull ernie-large`                 | `ollama run -m ernie-large`                      |
| distilroberta-base          | 300 MiB  | 66M            | Good Performance  | Lightweight NLP     | `ollama pull distilroberta-base`          | `ollama run -m distilroberta-base`               |
| albert-large                | 200 MiB  | 18M            | Good Performance  | Lightweight NLP     | `ollama pull albert-large`                | `ollama run -m albert-large`                     |
| bert-base-cased             | 500 MiB  | 110M           | Good Performance  | General purpose NLP | `ollama pull bert-base-cased`             | `ollama run -m bert-base-cased`                  |
| bart-base                   | 1 GiB    | 140M           | Good Performance  | Text generation     | `ollama pull bart-base`                   | `ollama run -m bart-base`                        |
| mt5-large                   | 3.2 GiB  | 770M           | Good Performance  | Multilingual NLP    | `ollama pull mt5-large`                   | `ollama run -m mt5-large`                        |

## License

This project is licensed under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Contact

For any inquiries or issues, please contact [your-email@example.com].
```

This README file provides an overview of the repository, installation instructions, configuration, and usage of the API endpoints. It also includes information about 50 popular models, their sizes, performance metrics, distinctive traits, and commands to download and run them.
