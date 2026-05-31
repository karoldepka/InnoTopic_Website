import os
import logging
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from dotenv import load_dotenv
from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

logger = logging.getLogger(__name__)

app = FastAPI()

# Enable CORS for development (frontend might still use localhost:8000 directly during transition)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QuizQuestion(BaseModel):
    question: str
    context: str = ""

class AIResponse(BaseModel):
    answer: str

# Initialize Ollama LLM
# Assumes llama3.2 is available on localhost:11434.
llm = ChatOllama(
    model="llama3.2",
    base_url="http://localhost:11434",
)

def create_answer_chain():
    prompt = ChatPromptTemplate.from_messages([
        ("system", "You are a helpful assistant that provides concise answers to quiz questions or learning items."),
        ("user", "Question/Item: {question}\nContext: {context}")
    ])

    return prompt | llm

@app.post("/generate-answer", response_model=AIResponse)
@app.post("/ai-api/generate-answer", response_model=AIResponse)
async def generate_answer(quiz_question: QuizQuestion):
    logger.info(
        "AI answer query submitted question_length=%s context_length=%s",
        len(quiz_question.question),
        len(quiz_question.context),
    )

    chain = create_answer_chain()

    try:
        response = chain.invoke({"question": quiz_question.question, "context": quiz_question.context})
        return AIResponse(answer=response.content)
    except Exception as e:
        print(f"Error calling Ollama: {e}")
        # Return a more helpful error if Ollama is not running
        raise HTTPException(status_code=500, detail=f"Ollama error: {str(e)}. Make sure Ollama is running and has the llama3.2 model.")

@app.post("/generate-answer-stream")
@app.post("/ai-api/generate-answer-stream")
async def generate_answer_stream(quiz_question: QuizQuestion):
    logger.info(
        "AI answer stream query submitted question_length=%s context_length=%s",
        len(quiz_question.question),
        len(quiz_question.context),
    )

    chain = create_answer_chain()

    def stream_answer():
        try:
            for chunk in chain.stream({"question": quiz_question.question, "context": quiz_question.context}):
                content = getattr(chunk, "content", "")
                if content:
                    yield content
        except Exception as e:
            logger.exception("Error streaming Ollama response")
            yield f"\n\n[AI backend error: {str(e)}]"

    return StreamingResponse(stream_answer(), media_type="text/plain")

@app.get("/health")
@app.get("/ai-api/health")
async def health_check():
    try:
        # Simple check if Ollama is responsive
        return {"status": "ok", "llm": "ollama", "model": "llama3.2"}
    except Exception as e:
        return {"status": "error", "detail": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
