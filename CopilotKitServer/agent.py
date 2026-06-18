import os
from typing import cast
from langchain_anthropic import ChatAnthropic
from langchain_core.messages import SystemMessage
from langgraph.graph import StateGraph, END
from copilotkit import CopilotKitState

SYSTEM_PROMPT = """You are an AI assistant embedded in Karol Depka's portfolio website (InnoTopic).

You help visitors learn about:
- Karol's professional background: senior full-stack developer and AI/ML engineer based in Málaga (originally from Poland)
- Key skills: Angular, React, Python, FastAPI, LangChain, LangGraph, TypeScript, Three.js, and more
- Work experience: enterprise software, SaaS products, AI integrations, mobile apps
- Cities Karol has lived/worked in: Koszalin, Wrocław, Berlin, Barcelona, Málaga

Be concise, friendly, and accurate. If you don't know something specific, say so honestly.
"""

MODEL = os.getenv("ANTHROPIC_MODEL", "claude-haiku-4-5-20251001")


def make_llm() -> ChatAnthropic:
    return ChatAnthropic(
        model=MODEL,
        api_key=os.environ["ANTHROPIC_API_KEY"],
    )


def chat_node(state: CopilotKitState) -> dict:
    llm = make_llm()
    messages = [SystemMessage(content=SYSTEM_PROMPT)] + list(state["messages"])
    response = llm.invoke(messages)
    return {"messages": [response]}


builder = StateGraph(CopilotKitState)
builder.add_node("chat", chat_node)
builder.set_entry_point("chat")
builder.add_edge("chat", END)

graph = builder.compile()
