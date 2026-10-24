import os
from functools import lru_cache

from strands import Agent
from strands.agent.conversation_manager.null_conversation_manager import NullConversationManager
from strands_tools import retrieve
from strands_tools.code_interpreter import AgentCoreCodeInterpreter
from bedrock_agentcore.runtime import BedrockAgentCoreApp
from model.load import load_model
from parse import parse_payload
from memory.session import get_memory_session_manager
from gateway_client import get_gateway_client

SYSTEM_PROMPT = """You answer questions about Karol Depka Pradzinski's career for visitors of his CV website: recruiters, potential clients and fellow engineers.

Answer from his work history, not from general knowledge:
- The work-history tools give exact facts: organisations, periods, projects, roles, technologies and skill levels. Use them for anything specific, such as which projects used a technology, when, or for how many years.
- The knowledge base (retrieve) holds the same history as prose; use it for open questions about what he did and how.
- Use the code interpreter only for calculations or summaries over data the tools returned.

When the history doesn't cover something, say so and suggest contacting Karol, rather than guessing. You may remember what a returning visitor is interested in (for example, a role they are hiring for) and use it.

Keep answers short and conversational, name the organisations and years your answer rests on, and reply in the language the visitor writes in. Write plain text without Markdown: the chat shows text as-is."""

REGION = os.getenv("AWS_REGION")

tools = []

# The work-history tools, served by AgentCore Gateway (MCP).
gateway = get_gateway_client()
if gateway:
    tools.append(gateway)

# The Bedrock knowledge base (KNOWLEDGE_BASE_ID is set by the deployment).
if os.getenv("KNOWLEDGE_BASE_ID"):
    tools.append(retrieve)

# The AgentCore Code Interpreter: a sandbox for calculations over the tools' results.
tools.append(AgentCoreCodeInterpreter(region=REGION).code_interpreter)


def _make_conversation_manager():
    return NullConversationManager()

@lru_cache(maxsize=128)
def _get_agent(session_id: str, actor_id: str) -> Agent:
    """Given a session_id and actor_id, return or construct the corresponding Strands agent.
    Note: caching helps avoid repeated identity fetches on non-bedrock model loads
    and supports in-memory session management for local dev."""
    return Agent(
        model=load_model(),
        session_manager=get_memory_session_manager(session_id, actor_id),
        conversation_manager=_make_conversation_manager(),
        system_prompt=SYSTEM_PROMPT,
        tools=tools,
    )

def create_app():
    app = BedrockAgentCoreApp()
    log = app.logger

    @app.entrypoint
    async def invoke(payload, context):
        log.info("Invoking Agent.....")

        session_id = getattr(context, "session_id", None) or "default-session"
        prompt, actor_id = parse_payload(payload)

        log.info(f"Invoking with session_id={session_id} and actor_id={actor_id}")
        agent = _get_agent(session_id, actor_id)

        async for event in agent.stream_async(prompt):
            if not isinstance(event, dict) or "event" not in event:
                continue
            cbs = event["event"].get("contentBlockStart")
            if cbs is not None and not cbs.get("start"):
                continue
            yield event

    return app

app = create_app()
if __name__ == "__main__":
    app.run()
