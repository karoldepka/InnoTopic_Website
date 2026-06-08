import os
import logging
import json
import uuid
from typing import Any
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

class AgUiMessage(BaseModel):
    id: str | None = None
    role: str
    content: Any = ""

class AgUiRunInput(BaseModel):
    threadId: str
    runId: str
    state: Any = None
    messages: list[AgUiMessage] = []
    tools: list[Any] = []
    context: list[Any] = []
    forwardedProps: Any = None

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

def create_copilot_chain():
    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            "You are LifeSuite Copilot. Be practical, concise, and helpful. "
            "When the user asks about learning items, timers, journaling, or planning, "
            "prefer clear next actions.",
        ),
        ("user", "{conversation}"),
    ])

    return prompt | llm

def message_content_to_text(content: Any) -> str:
    if isinstance(content, str):
        return content

    if isinstance(content, list):
        parts: list[str] = []
        for item in content:
            if isinstance(item, dict):
                if item.get("type") == "text" and isinstance(item.get("text"), str):
                    parts.append(item["text"])
                elif isinstance(item.get("content"), str):
                    parts.append(item["content"])
            elif isinstance(item, str):
                parts.append(item)
        return "\n".join(parts)

    return str(content) if content is not None else ""

def build_copilot_conversation(messages: list[AgUiMessage]) -> str:
    if not messages:
        return "Hello"

    recent_messages = messages[-12:]
    lines: list[str] = []
    for message in recent_messages:
        if message.role == "activity":
            continue
        text = message_content_to_text(message.content).strip()
        if text:
            lines.append(f"{message.role}: {text}")

    return "\n".join(lines) or "Hello"

def sse_data(event: dict[str, Any]) -> str:
    return f"data: {json.dumps(event, separators=(',', ':'))}\n\n"

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

@app.post("/copilotkit-agui")
@app.post("/ai-api/copilotkit-agui")
async def copilotkit_agui(run_input: AgUiRunInput):
    logger.info(
        "CopilotKit AG-UI run submitted thread_id=%s run_id=%s messages=%s",
        run_input.threadId,
        run_input.runId,
        len(run_input.messages),
    )

    chain = create_copilot_chain()

    def stream_agui():
        message_id = f"msg_{uuid.uuid4().hex}"
        answer_parts: list[str] = []

        yield sse_data({
            "type": "RUN_STARTED",
            "threadId": run_input.threadId,
            "runId": run_input.runId,
            "input": run_input.model_dump(),
        })
        yield sse_data({
            "type": "TEXT_MESSAGE_START",
            "messageId": message_id,
            "role": "assistant",
        })

        try:
            conversation = build_copilot_conversation(run_input.messages)
            for chunk in chain.stream({"conversation": conversation}):
                content = getattr(chunk, "content", "")
                if content:
                    answer_parts.append(content)
                    yield sse_data({
                        "type": "TEXT_MESSAGE_CONTENT",
                        "messageId": message_id,
                        "delta": content,
                    })
        except Exception as e:
            logger.exception("Error streaming CopilotKit AG-UI response")
            content = f"\n\n[AI backend error: {str(e)}]"
            answer_parts.append(content)
            yield sse_data({
                "type": "TEXT_MESSAGE_CONTENT",
                "messageId": message_id,
                "delta": content,
            })

        answer = "".join(answer_parts)
        yield sse_data({
            "type": "TEXT_MESSAGE_END",
            "messageId": message_id,
        })
        yield sse_data({
            "type": "RUN_FINISHED",
            "threadId": run_input.threadId,
            "runId": run_input.runId,
            "result": {"messageId": message_id, "answer": answer},
        })

    return StreamingResponse(stream_agui(), media_type="text/event-stream")

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
