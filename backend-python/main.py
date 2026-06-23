import os
import logging
import json
import uuid
import re
from html import unescape
from pathlib import Path
from typing import Any
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv
from langsmith import traceable
from langchain_ollama import ChatOllama
from langchain_tavily import TavilySearch
from langchain_core.prompts import ChatPromptTemplate
from fastapi.middleware.cors import CORSMiddleware

try:
    import psycopg
    from psycopg.rows import dict_row
    from psycopg.types.json import Jsonb
except ImportError:
    psycopg = None
    dict_row = None
    Jsonb = None

load_dotenv(Path(__file__).parent / '.env')

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
    web_search: bool = False

class AIResponse(BaseModel):
    answer: str
    modelName: str = "llama3.2"
    searchResults: list[str] = []

class CategoryNode(BaseModel):
    id: str
    title: str
    questionCount: int = 3
    children: list["CategoryNode"] = Field(default_factory=list)
    matchedExistingCategoryId: str | None = None
    matchedExistingCategoryTitle: str | None = None
    isExistingCategory: bool = False

class ExistingCategory(BaseModel):
    id: str
    title: str
    path: str | None = None
    aliases: list[str] = Field(default_factory=list)

class CategoryTreeRequest(BaseModel):
    message: str
    tree: list[CategoryNode] = Field(default_factory=list)
    web_search: bool = False

class CategoryTreeResponse(BaseModel):
    tree: list[CategoryNode]
    assistantMessage: str
    modelName: str = "llama3.2"
    searchResults: list[str] = []

class QuestionAnswerRequest(BaseModel):
    tree: list[CategoryNode]
    web_search: bool = False

class QuestionAnswer(BaseModel):
    categoryId: str
    categoryPath: str
    question: str
    answer: str

class QuestionAnswerResponse(BaseModel):
    items: list[QuestionAnswer]
    modelName: str = "llama3.2"
    searchResults: list[str] = []

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

class OdmSaveRequest(BaseModel):
    owner: str
    data: dict[str, Any] = Field(default_factory=dict)
    parentIds: list[str] = Field(default_factory=list)
    ancestorIds: list[str] = Field(default_factory=list)
    storeVersionHistory: bool = True

class OdmDeleteRequest(BaseModel):
    owner: str

class OdmItemsResponse(BaseModel):
    items: list[dict[str, Any]]

# Initialize Ollama LLM
# Assumes llama3.2 is available on localhost:11434.
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")
llm = ChatOllama(
    model=OLLAMA_MODEL,
    base_url="http://localhost:11434",
)

DEFAULT_EXISTING_CATEGORIES = [
    {"id": "rust", "title": "Rust", "path": "Programming > Rust", "aliases": ["rustlang"]},
    {"id": "rust-ownership", "title": "Ownership and Borrowing", "path": "Programming > Rust > Ownership and Borrowing", "aliases": ["borrow checker", "borrowing"]},
    {"id": "rust-lifetimes", "title": "Lifetimes", "path": "Programming > Rust > Lifetimes", "aliases": ["lifetime annotations"]},
    {"id": "rust-traits", "title": "Traits", "path": "Programming > Rust > Traits", "aliases": ["trait bounds", "trait objects"]},
    {"id": "rust-error-handling", "title": "Error Handling", "path": "Programming > Rust > Error Handling", "aliases": ["result", "option"]},
    {"id": "rust-concurrency", "title": "Concurrency", "path": "Programming > Rust > Concurrency", "aliases": ["send sync", "threads"]},
    {"id": "rust-async", "title": "Async Rust", "path": "Programming > Rust > Async Rust", "aliases": ["tokio", "future"]},
    {"id": "rust-unsafe", "title": "Unsafe Rust", "path": "Programming > Rust > Unsafe Rust", "aliases": ["unsafe", "ffi"]},
    {"id": "python", "title": "Python", "path": "Programming > Python", "aliases": []},
    {"id": "python-metaprogramming", "title": "Metaprogramming", "path": "Programming > Python > Metaprogramming", "aliases": ["metaclasses", "decorators"]},
    {"id": "interview-questions", "title": "Interview Questions", "path": "Career > Interview Questions", "aliases": ["interview prep"]},
]

def normalize_existing_category(raw_category: Any, index: int) -> ExistingCategory | None:
    if isinstance(raw_category, str):
        title = clean_search_text(raw_category)
        if not title:
            return None
        return ExistingCategory(id=slugify_id(title, f"category-{index + 1}"), title=title)
    if not isinstance(raw_category, dict):
        return None
    title = clean_search_text(str(raw_category.get("title") or raw_category.get("name") or raw_category.get("path") or ""))
    if not title:
        return None
    category_id = clean_search_text(str(raw_category.get("id") or slugify_id(title, f"category-{index + 1}")))
    aliases = raw_category.get("aliases") or []
    if isinstance(aliases, str):
        aliases = [aliases]
    return ExistingCategory(
        id=category_id,
        title=title,
        path=clean_search_text(str(raw_category.get("path") or "")) or None,
        aliases=[clean_search_text(str(alias)) for alias in aliases if clean_search_text(str(alias))],
    )

def load_existing_categories() -> list[ExistingCategory]:
    raw_categories: Any = None
    categories_json = os.getenv("LIFESUITE_EXISTING_CATEGORIES_JSON")
    categories_file = os.getenv("LIFESUITE_EXISTING_CATEGORIES_FILE")

    try:
        if categories_json:
            raw_categories = json.loads(categories_json)
        elif categories_file and os.path.exists(categories_file):
            with open(categories_file, "r", encoding="utf-8") as file:
                raw_categories = json.load(file)
    except Exception:
        logger.exception("Failed to load configured existing categories; using defaults")
        raw_categories = None

    if raw_categories is None:
        raw_categories = DEFAULT_EXISTING_CATEGORIES

    categories = [
        category
        for index, raw_category in enumerate(raw_categories or [])
        if (category := normalize_existing_category(raw_category, index)) is not None
    ]
    return categories

def existing_categories_as_prompt_json(categories: list[ExistingCategory]) -> str:
    return json.dumps([category.model_dump() for category in categories[:300]], ensure_ascii=False)

def clean_search_text(text: str) -> str:
    text = re.sub(r"\s+", " ", unescape(text or "")).strip()
    return text

_tavily_tool = TavilySearch(max_results=5)

@traceable(run_type="tool", name="web_search")
def web_search(query: str, max_results: int = 5) -> list[str]:
    if not query.strip():
        return []
    raw = _tavily_tool.invoke({"query": query})
    items = raw.get("results", []) if isinstance(raw, dict) else (raw or [])
    results: list[str] = []
    for item in items[:max_results]:
        title = clean_search_text(item.get("title") or "")
        content = clean_search_text(item.get("content") or "")
        url = clean_search_text(item.get("url") or "")
        parts = [part for part in [title, content, url] if part]
        if parts:
            results.append(" - ".join(parts))
    return results

def create_answer_chain(web_search_enabled: bool = False):
    system_prompt = (
        "You are a helpful assistant that provides concise answers to quiz questions or learning items. "
        "Reply with the answer only. Do not greet, explain what you are doing, or add any closing remarks."
    )
    if web_search_enabled:
        system_prompt += (
            " Use the supplied web search notes when relevant. If the notes are insufficient, "
            "say what is uncertain instead of inventing details."
        )

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("user", "Question/Item: {question}\nContext: {context}\nWeb search notes:\n{web_search_notes}")
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

def create_category_tree_chain():
    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            "You design NEW learning category trees from a topic or refinement request. "
            "The user's message is a seed topic/request, not an existing item to classify. "
            "Do not categorize the user's phrase itself; invent a useful study taxonomy around it. "
            "If the existing tree is empty, generate a fresh tree from scratch. "
            "If the existing tree is non-empty, modify or expand that tree according to the latest request. "
            "You will receive a list of pre-existing categories. Match generated categories to those existing categories "
            "whenever they are semantically the same or a close parent/child fit. For matched nodes, set "
            "`matchedExistingCategoryId`, `matchedExistingCategoryTitle`, and `isExistingCategory:true`. Keep each "
            "tree node id unique even when multiple nodes match the same existing category. Only invent new categories when no existing category is a good fit. "
            "Return only valid JSON with keys "
            "`assistantMessage` and `tree`. The tree is an array of nodes shaped as "
            "{{\"id\":\"stable-kebab-id\",\"title\":\"Category title\",\"questionCount\":3,\"children\":[],"
            "\"matchedExistingCategoryId\":null,\"matchedExistingCategoryTitle\":null,\"isExistingCategory\":false}}. "
            "Output raw JSON only. Do not wrap it in markdown code fences, do not greet, "
            "do not explain, do not add any text before or after the JSON. "
            "For a new topic, never return only the topic title. Return one root node with at least "
            "6 useful subcategories, and each subcategory should have 2-4 subsubcategories. "
            "For example, for 'rust interview questions', generate categories such as ownership, borrowing, "
            "lifetimes, traits, error handling, concurrency, async, tooling, and unsafe Rust. "
            "Preserve existing node ids whenever the same category remains. "
            "Use the user's latest message to create or modify the tree. "
            "Support many-to-many knowledge organization by duplicating a useful category under multiple parents "
            "when that helps learning, but keep ids unique by adding a short parent suffix. "
            "Use 2-5 children per expanded node unless the user asks otherwise.",
        ),
        (
            "user",
            "Latest topic/refinement request:\n{message}\n\nExisting generated tree JSON, if any:\n{tree_json}\n\n"
            "Pre-existing categories to match/reuse:\n{existing_categories_json}\n\n"
            "Web search notes:\n{web_search_notes}",
        ),
    ])

    return prompt | llm

def create_category_tree_record_chain():
    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            "You design NEW learning category trees from a topic or refinement request. "
            "The user's message is a seed topic/request, not an existing item to classify. "
            "Return a stream-friendly record format, not JSON and not markdown. "
            "Output records only — no greeting, no explanation, no closing remarks. "
            "First return one optional MESSAGE record, then one NODE record per category. "
            "MESSAGE format: <MESSAGE>short status for the user</MESSAGE>. "
            "NODE format: <NODE id=\"stable-kebab-id\" parent=\"parent-id-or-empty\" questionCount=\"3\" "
            "existing=\"false\" matchedId=\"\"><TITLE>Category title</TITLE><MATCHED_TITLE></MATCHED_TITLE></NODE>. "
            "Use parent links to express the tree; root nodes have parent=\"\". "
            "Do not put raw < or > characters inside text fields. Use words instead. "
            "If a generated node semantically matches a pre-existing category, set existing=\"true\", "
            "matchedId to that category id, and MATCHED_TITLE to that category title. "
            "For a new topic, never return only the topic title. Return one root node with at least "
            "6 useful subcategories, and each subcategory should have 2-4 subsubcategories. "
            "Preserve existing node ids whenever the same category remains. "
            "Use the user's latest message to create or modify the tree.",
        ),
        (
            "user",
            "Latest topic/refinement request:\n{message}\n\nExisting generated tree JSON, if any:\n{tree_json}\n\n"
            "Pre-existing categories to match/reuse:\n{existing_categories_json}\n\n"
            "Web search notes:\n{web_search_notes}",
        ),
    ])

    return prompt | llm

def create_category_tree_match_dedupe_chain():
    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            "You are a taxonomy cleanup engine. Your job is to semantically match and de-duplicate "
            "a generated learning category tree against a list of pre-existing categories. "
            "Do not use surface string equality as the main criterion; use meaning, parent context, aliases, and likely learning intent. "
            "Merge duplicate concepts that appear multiple times in the generated tree, such as repeated 'State Management'. "
            "If a generated node means the same thing as an existing category, keep the generated node in the best location, "
            "set matchedExistingCategoryId, matchedExistingCategoryTitle, and isExistingCategory:true. "
            "If duplicate generated nodes match the same existing category, keep only the strongest/most useful occurrence unless the user clearly needs multiple distinct contexts. "
            "Keep one coherent tree, preserve useful children by moving them under the kept node, and avoid losing subtopics. "
            "Every returned node must have id, title, questionCount, children, matchedExistingCategoryId, "
            "matchedExistingCategoryTitle, and isExistingCategory. "
            "Never return two nodes for the same semantic category unless they represent genuinely different learning contexts. "
            "Return only valid JSON with keys `assistantMessage` and `tree`. "
            "Output raw JSON only. Do not wrap it in markdown code fences, do not greet, "
            "do not explain, do not add any text before or after the JSON.",
        ),
        (
            "user",
            "Generated tree JSON:\n{generated_tree_json}\n\n"
            "Pre-existing categories JSON:\n{existing_categories_json}",
        ),
    ])

    return prompt | llm

def cleanup_category_tree_with_llm(
    tree: list[CategoryNode],
    existing_categories: list[ExistingCategory],
) -> tuple[list[CategoryNode], str | None]:
    if not tree:
        return tree, None

    chain = create_category_tree_match_dedupe_chain()
    response = chain.invoke({
        "generated_tree_json": json.dumps([node.model_dump() for node in tree], ensure_ascii=False),
        "existing_categories_json": existing_categories_as_prompt_json(existing_categories),
    })
    parsed = extract_json_object(response.content)
    raw_tree = get_raw_tree_from_parsed(parsed)
    cleaned_tree = normalize_category_nodes(raw_tree)
    assistant_message = parsed.get("assistantMessage") if isinstance(parsed, dict) else None
    return cleaned_tree or tree, assistant_message

def create_question_answer_chain():
    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            "You generate concise learning flashcard question-and-answer pairs. "
            "Return only valid JSON with key `items`, an array of objects shaped as "
            "{{\"categoryId\":\"id\",\"categoryPath\":\"A > B\",\"question\":\"...\",\"answer\":\"...\"}}. "
            "Output raw JSON only. Do not wrap it in markdown code fences, do not greet, "
            "do not explain, do not add any text before or after the JSON. "
            "Generate the requested number of items per category. Keep answers accurate and compact. "
            "If web search notes are supplied, use them when relevant and avoid unsupported claims.",
        ),
        (
            "user",
            "Confirmed category tree JSON:\n{tree_json}\n\nRequested category paths:\n{requests_json}\n\n"
            "Web search notes:\n{web_search_notes}",
        ),
    ])

    return prompt | llm

def create_question_answer_record_chain():
    prompt = ChatPromptTemplate.from_messages([
        (
            "system",
            "You generate concise learning flashcard question-and-answer pairs. "
            "Return a stream-friendly record format, not JSON and not markdown. "
            "Output records only — no greeting, no explanation, no closing remarks. "
            "Return exactly one ITEM record per generated Q&A. "
            "ITEM format: <ITEM categoryId=\"id\"><PATH>A > B</PATH><QUESTION>question text</QUESTION><ANSWER>answer text</ANSWER></ITEM>. "
            "Do not put raw < or > characters inside question or answer text; use words instead. "
            "Generate the requested number of items per category. Keep answers accurate and compact. "
            "If web search notes are supplied, use them when relevant and avoid unsupported claims.",
        ),
        (
            "user",
            "Confirmed category tree JSON:\n{tree_json}\n\nRequested category paths:\n{requests_json}\n\n"
            "Web search notes:\n{web_search_notes}",
        ),
    ])

    return prompt | llm

def extract_json_object(text: str) -> Any:
    stripped = text.strip()
    fenced_match = re.search(r"```(?:json)?\s*(.*?)```", stripped, re.DOTALL | re.IGNORECASE)
    if fenced_match:
        stripped = fenced_match.group(1).strip()

    try:
        return json.loads(stripped)
    except json.JSONDecodeError:
        pass

    decoder = json.JSONDecoder()
    candidates: list[Any] = []
    for index, char in enumerate(stripped):
        if char not in "{[":
            continue
        try:
            parsed, _ = decoder.raw_decode(stripped[index:])
            candidates.append(parsed)
        except json.JSONDecodeError:
            continue

    if not candidates:
        raise ValueError("AI response did not contain JSON")

    for candidate in candidates:
        if isinstance(candidate, dict) and any(key in candidate for key in ["tree", "categories", "nodes", "children", "items"]):
            return candidate
        if isinstance(candidate, list):
            return candidate

    return candidates[0]

def slugify_id(title: str, fallback: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
    return slug or fallback

def safe_int(value: Any, fallback: int) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        return fallback

def normalize_category_nodes(raw_nodes: Any, prefix: str = "cat") -> list[CategoryNode]:
    if isinstance(raw_nodes, dict):
        raw_nodes = [raw_nodes]

    nodes: list[CategoryNode] = []
    seen: set[str] = set()

    def normalize(raw_node: Any, path: list[int]) -> CategoryNode | None:
        if not isinstance(raw_node, dict):
            return None
        title = clean_search_text(str(raw_node.get("title") or raw_node.get("name") or "Category"))
        fallback_id = f"{prefix}-{'-'.join(str(part) for part in path)}"
        node_id = slugify_id(str(raw_node.get("id") or title), fallback_id)
        if node_id in seen:
            node_id = f"{node_id}-{path[-1] if path else len(seen) + 1}"
        seen.add(node_id)
        raw_count = raw_node.get("questionCount", raw_node.get("question_count", 3))
        try:
            question_count = int(raw_count)
        except (TypeError, ValueError):
            question_count = 3
        question_count = max(0, min(question_count, 50))
        children = [
            child
            for index, child_raw in enumerate(raw_node.get("children") or [])
            if (child := normalize(child_raw, [*path, index + 1])) is not None
        ]
        matched_id = raw_node.get("matchedExistingCategoryId") or raw_node.get("matched_existing_category_id")
        matched_title = raw_node.get("matchedExistingCategoryTitle") or raw_node.get("matched_existing_category_title")
        return CategoryNode(
            id=node_id,
            title=title,
            questionCount=question_count,
            children=children,
            matchedExistingCategoryId=clean_search_text(str(matched_id)) if matched_id else None,
            matchedExistingCategoryTitle=clean_search_text(str(matched_title)) if matched_title else None,
            isExistingCategory=bool(raw_node.get("isExistingCategory") or raw_node.get("is_existing_category") or matched_id),
        )

    for index, raw_node in enumerate(raw_nodes or []):
        node = normalize(raw_node, [index + 1])
        if node is not None:
            nodes.append(node)
    return nodes

def parse_record_attributes(attribute_text: str) -> dict[str, str]:
    return {
        key: unescape(value)
        for key, value in re.findall(r'([A-Za-z][A-Za-z0-9_]*)="([^"]*)"', attribute_text)
    }

def parse_record_tag(body: str, tag_name: str) -> str:
    match = re.search(
        rf"<{tag_name}>\s*(.*?)\s*</{tag_name}>",
        body,
        re.DOTALL | re.IGNORECASE,
    )
    return clean_search_text(unescape(match.group(1))) if match else ""

def parse_category_tree_records(text: str) -> tuple[list[CategoryNode], str | None]:
    message = parse_record_tag(text, "MESSAGE") or None
    raw_records: list[dict[str, Any]] = []
    for match in re.finditer(r"<NODE\s+([^>]*)>(.*?)</NODE>", text, re.DOTALL | re.IGNORECASE):
        attrs = parse_record_attributes(match.group(1))
        body = match.group(2)
        title = parse_record_tag(body, "TITLE")
        if not title:
            continue
        node_id = clean_search_text(attrs.get("id") or slugify_id(title, f"node-{len(raw_records) + 1}"))
        matched_id = clean_search_text(attrs.get("matchedId") or "")
        matched_title = parse_record_tag(body, "MATCHED_TITLE") or None
        raw_records.append({
            "id": node_id,
            "parent": clean_search_text(attrs.get("parent") or ""),
            "title": title,
            "questionCount": max(0, min(50, safe_int(attrs.get("questionCount"), 3))),
            "children": [],
            "matchedExistingCategoryId": matched_id or None,
            "matchedExistingCategoryTitle": matched_title,
            "isExistingCategory": (attrs.get("existing") or "").lower() == "true" or bool(matched_id),
        })

    by_id = {
        record["id"]: CategoryNode(
            id=record["id"],
            title=record["title"],
            questionCount=record["questionCount"],
            children=[],
            matchedExistingCategoryId=record["matchedExistingCategoryId"],
            matchedExistingCategoryTitle=record["matchedExistingCategoryTitle"],
            isExistingCategory=record["isExistingCategory"],
        )
        for record in raw_records
    }

    roots: list[CategoryNode] = []
    for record in raw_records:
        node = by_id[record["id"]]
        parent_id = record["parent"]
        parent = by_id.get(parent_id)
        if parent is not None and parent.id != node.id:
            parent.children.append(node)
        else:
            roots.append(node)
    return roots, message

def parse_question_answer_records(text: str) -> list[QuestionAnswer]:
    items: list[QuestionAnswer] = []
    seen: set[tuple[str, str, str]] = set()
    for match in re.finditer(r"<ITEM\s+([^>]*)>(.*?)</ITEM>", text, re.DOTALL | re.IGNORECASE):
        attrs = parse_record_attributes(match.group(1))
        body = match.group(2)
        category_id = clean_search_text(attrs.get("categoryId") or "")
        category_path = parse_record_tag(body, "PATH")
        question = parse_record_tag(body, "QUESTION")
        answer = parse_record_tag(body, "ANSWER")
        key = (category_id, category_path, question)
        if not question or not answer or key in seen:
            continue
        seen.add(key)
        items.append(QuestionAnswer(
            categoryId=category_id,
            categoryPath=category_path,
            question=question,
            answer=answer,
        ))
    return items

def get_raw_tree_from_parsed(parsed: Any) -> Any:
    if not isinstance(parsed, dict):
        return parsed
    for key in ["tree", "categories", "nodes", "children"]:
        value = parsed.get(key)
        if value:
            return value
    if parsed.get("title") or parsed.get("name"):
        return parsed
    return []

def count_category_nodes(nodes: list[CategoryNode]) -> int:
    return sum(1 + count_category_nodes(node.children) for node in nodes)

def has_grandchildren(nodes: list[CategoryNode]) -> bool:
    return any(child.children for node in nodes for child in node.children)

def create_category_node_from_template(root_id: str, title: str, children: list[str]) -> CategoryNode:
    node_id = f"{root_id}-{slugify_id(title, title)}"
    return CategoryNode(
        id=node_id,
        title=title,
        questionCount=3,
        children=[
            CategoryNode(
                id=f"{node_id}-{slugify_id(child_title, str(index + 1))}",
                title=child_title,
                questionCount=3,
                children=[],
            )
            for index, child_title in enumerate(children)
        ],
    )

def category_templates_for_topic(topic: str) -> list[tuple[str, list[str]]]:
    topic_lower = topic.lower()
    if "rust" in topic_lower:
        return [
            ("Ownership and Borrowing", ["Ownership rules", "Move semantics", "Immutable vs mutable borrows", "Borrow checker diagnostics"]),
            ("Lifetimes", ["Lifetime annotations", "Elision rules", "Struct lifetimes", "Static lifetime"]),
            ("Type System", ["Structs and enums", "Pattern matching", "Generics", "Associated types"]),
            ("Traits", ["Trait bounds", "Derive macros", "Trait objects", "Orphan rule"]),
            ("Error Handling", ["Result and Option", "Question mark operator", "Custom error types", "Panic vs recoverable errors"]),
            ("Concurrency", ["Send and Sync", "Threads", "Channels", "Mutex and Arc"]),
            ("Async Rust", ["Future trait", "async and await", "Tokio basics", "Pinning overview"]),
            ("Cargo and Tooling", ["Cargo commands", "Crates and features", "Testing", "Clippy and formatting"]),
            ("Memory and Unsafe", ["Stack vs heap", "Smart pointers", "Unsafe blocks", "FFI basics"]),
        ]
    if "python" in topic_lower:
        return [
            ("Language Fundamentals", ["Data model", "Scopes and closures", "Iteration protocol", "Exceptions"]),
            ("Object Model", ["Classes", "Descriptors", "Dunder methods", "Multiple inheritance"]),
            ("Metaprogramming", ["Decorators", "Metaclasses", "Dynamic attributes", "Code generation"]),
            ("Typing", ["Type hints", "Protocols", "Generics", "Runtime validation"]),
            ("Concurrency", ["Threads", "Asyncio", "Multiprocessing", "GIL implications"]),
            ("Packaging and Tooling", ["Virtual environments", "Packaging", "Testing", "Linters and formatters"]),
        ]
    return [
        ("Fundamentals", ["Definitions", "Core terminology", "Mental models"]),
        ("Core Concepts", ["Key mechanisms", "Common patterns", "Important tradeoffs"]),
        ("Applied Practice", ["Common workflows", "Practical examples", "Debugging"]),
        ("Advanced Topics", ["Edge cases", "Performance", "Architecture"]),
        ("Interview Questions", ["Concept questions", "Scenario questions", "Code-reading questions"]),
        ("Common Mistakes", ["Misconceptions", "Failure modes", "Best practices"]),
    ]

def create_fallback_category_tree(message: str, existing_tree: list[CategoryNode]) -> list[CategoryNode]:
    if existing_tree:
        return existing_tree

    topic = clean_search_text(message)
    topic = re.sub(r"\b(more|add|create|generate|category|categories|subcategories|subsubcategories|tree)\b", "", topic, flags=re.IGNORECASE)
    topic = re.sub(r"\s+", " ", topic).strip(" :,-") or "Learning Topic"
    root_title = topic[:1].upper() + topic[1:]
    root_id = slugify_id(root_title, "learning-topic")
    templates = category_templates_for_topic(topic)
    return [
        CategoryNode(
            id=root_id,
            title=root_title,
            questionCount=3,
            children=[
                create_category_node_from_template(root_id, child_title, grandchildren)
                for child_title, grandchildren in templates
            ],
        )
    ]

def expand_sparse_category_tree(message: str, tree: list[CategoryNode]) -> tuple[list[CategoryNode], bool]:
    if not tree:
        return create_fallback_category_tree(message, []), True

    if count_category_nodes(tree) > 3 and has_grandchildren(tree):
        return tree, False

    root = tree[0]
    root_title = root.title or clean_search_text(message) or "Learning Topic"
    root_id = root.id or slugify_id(root_title, "learning-topic")
    expanded = CategoryNode(
        id=root_id,
        title=root_title,
        questionCount=root.questionCount or 3,
        children=[
            create_category_node_from_template(root_id, child_title, grandchildren)
            for child_title, grandchildren in category_templates_for_topic(f"{message} {root_title}")
        ],
    )
    return [expanded, *tree[1:]], True

def flatten_category_requests(nodes: list[CategoryNode]) -> list[dict[str, Any]]:
    requests: list[dict[str, Any]] = []

    def visit(node: CategoryNode, path: list[str]):
        node_path = [*path, node.title]
        if node.questionCount > 0:
            requests.append({
                "categoryId": node.id,
                "categoryPath": " > ".join(node_path),
                "questionCount": node.questionCount,
            })
        for child in node.children:
            visit(child, node_path)

    for node in nodes:
        visit(node, [])
    return requests

def create_fallback_question_answers(generation_requests: list[dict[str, Any]]) -> list[QuestionAnswer]:
    items: list[QuestionAnswer] = []
    for request in generation_requests:
        category_id = clean_search_text(str(request.get("categoryId") or ""))
        category_path = clean_search_text(str(request.get("categoryPath") or category_id))
        try:
            question_count = int(request.get("questionCount") or 0)
        except (TypeError, ValueError):
            question_count = 0

        topic = category_path.split(" > ")[-1] if category_path else "this topic"
        fallback_templates = [
            (
                f"What is the core idea behind {topic}?",
                f"{topic} is a key area within {category_path}. A good answer should define it, explain why it matters, and mention one practical implication.",
            ),
            (
                f"What mistake do candidates often make about {topic}?",
                f"A common mistake is giving a memorized definition without explaining the tradeoff or showing how {topic} behaves in a realistic example.",
            ),
            (
                f"How would you recognize a practical use case for {topic}?",
                f"Look for a problem where the concepts in {topic} directly affect correctness, maintainability, performance, or debugging.",
            ),
            (
                f"What follow-up question can test deeper understanding of {topic}?",
                f"Ask the candidate to compare {topic} with a related concept, then justify which approach fits a concrete scenario.",
            ),
            (
                f"How can {topic} be explained with a small code or design example?",
                f"Use a minimal example that isolates {topic}, then walk through the behavior and the reason behind it step by step.",
            ),
        ]

        for index in range(max(0, min(question_count, 50))):
            question, answer = fallback_templates[index % len(fallback_templates)]
            items.append(QuestionAnswer(
                categoryId=category_id,
                categoryPath=category_path,
                question=question,
                answer=answer,
            ))
    return items

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

def build_category_tree_response(
    category_request: CategoryTreeRequest,
    response_content: str,
    search_results: list[str],
    existing_categories: list[ExistingCategory],
) -> CategoryTreeResponse:
    try:
        parsed = extract_json_object(response_content)
        raw_tree = get_raw_tree_from_parsed(parsed)
        tree = normalize_category_nodes(raw_tree)
        assistant_message = parsed.get("assistantMessage") if isinstance(parsed, dict) else None
    except ValueError:
        tree = []
        assistant_message = None
    tree, expanded_sparse_tree = expand_sparse_category_tree(category_request.message, tree)
    tree, cleanup_message = cleanup_category_tree_with_llm(tree, existing_categories)
    if expanded_sparse_tree:
        assistant_message = "I expanded the topic into subcategories and subsubcategories. You can refine it with another chat message."
    elif cleanup_message:
        assistant_message = cleanup_message
    return CategoryTreeResponse(
        tree=tree,
        assistantMessage=assistant_message or "Updated the category tree.",
        modelName=OLLAMA_MODEL,
        searchResults=search_results,
    )

def build_category_tree_record_response(
    category_request: CategoryTreeRequest,
    response_content: str,
    search_results: list[str],
    existing_categories: list[ExistingCategory],
) -> CategoryTreeResponse:
    tree, assistant_message = parse_category_tree_records(response_content)
    if not tree:
        return build_category_tree_response(category_request, response_content, search_results, existing_categories)

    tree, expanded_sparse_tree = expand_sparse_category_tree(category_request.message, tree)
    tree, cleanup_message = cleanup_category_tree_with_llm(tree, existing_categories)
    if expanded_sparse_tree:
        assistant_message = "I expanded the topic into subcategories and subsubcategories. You can refine it with another chat message."
    elif cleanup_message:
        assistant_message = cleanup_message

    return CategoryTreeResponse(
        tree=tree,
        assistantMessage=assistant_message or "Updated the category tree.",
        modelName=OLLAMA_MODEL,
        searchResults=search_results,
    )

def build_question_answer_response(
    response_content: str,
    search_results: list[str],
    generation_requests: list[dict[str, Any]],
) -> QuestionAnswerResponse:
    parsed = extract_json_object(response_content)
    raw_items = parsed.get("items", parsed) if isinstance(parsed, dict) else parsed
    items: list[QuestionAnswer] = []
    for raw_item in raw_items or []:
        if not isinstance(raw_item, dict):
            continue
        question = clean_search_text(str(raw_item.get("question") or ""))
        answer = clean_search_text(str(raw_item.get("answer") or ""))
        category_id = clean_search_text(str(raw_item.get("categoryId") or raw_item.get("category_id") or ""))
        category_path = clean_search_text(str(raw_item.get("categoryPath") or raw_item.get("category_path") or ""))
        if question and answer:
            items.append(QuestionAnswer(
                categoryId=category_id,
                categoryPath=category_path,
                question=question,
                answer=answer,
            ))
    if not items and generation_requests:
        items = create_fallback_question_answers(generation_requests)
    return QuestionAnswerResponse(items=items, modelName=OLLAMA_MODEL, searchResults=search_results)

def build_question_answer_record_response(
    response_content: str,
    search_results: list[str],
    generation_requests: list[dict[str, Any]],
) -> QuestionAnswerResponse:
    items = parse_question_answer_records(response_content)
    if not items:
        return build_question_answer_response(response_content, search_results, generation_requests)
    return QuestionAnswerResponse(items=items, modelName=OLLAMA_MODEL, searchResults=search_results)

def get_odm_database_url() -> str:
    database_url = os.getenv("NEON_DATABASE_URL") or os.getenv("DATABASE_URL")
    if not database_url:
        raise HTTPException(status_code=500, detail="Missing NEON_DATABASE_URL or DATABASE_URL")
    return database_url

def connect_odm_db():
    if psycopg is None:
        raise HTTPException(status_code=500, detail="Install psycopg[binary] to use the Neon ODM API")
    return psycopg.connect(get_odm_database_url(), row_factory=dict_row)

def ensure_odm_tables_if_requested() -> None:
    if os.getenv("LIFESUITE_ODM_AUTO_MIGRATE", "").lower() not in {"1", "true", "yes"}:
        return
    schema_sql = """
    create table if not exists public.lifesuite_odm_items (
      collection text not null,
      item_id text not null,
      owner text not null,
      data jsonb not null default '{}'::jsonb,
      parent_ids text[] not null default '{}',
      ancestor_ids text[] not null default '{}',
      when_last_modified timestamptz not null default now(),
      when_deleted timestamptz,
      primary key (collection, item_id)
    );
    create index if not exists lifesuite_odm_items_owner_collection_modified_idx
      on public.lifesuite_odm_items (owner, collection, when_last_modified desc);
    create index if not exists lifesuite_odm_items_parent_ids_idx
      on public.lifesuite_odm_items using gin (parent_ids);
    create index if not exists lifesuite_odm_items_ancestor_ids_idx
      on public.lifesuite_odm_items using gin (ancestor_ids);
    create table if not exists public.lifesuite_odm_item_history (
      history_id text primary key,
      collection text not null,
      item_id text not null,
      owner text not null,
      data jsonb not null default '{}'::jsonb,
      parent_ids text[] not null default '{}',
      ancestor_ids text[] not null default '{}',
      snapshot_at timestamptz not null default now()
    );
    create index if not exists lifesuite_odm_item_history_item_idx
      on public.lifesuite_odm_item_history (owner, collection, item_id, snapshot_at desc);
    """
    with connect_odm_db() as conn:
        with conn.cursor() as cursor:
            cursor.execute(schema_sql)

def odm_row_to_response(row: dict[str, Any]) -> dict[str, Any]:
    return {
        "collection": row["collection"],
        "item_id": row["item_id"],
        "owner": row["owner"],
        "data": row["data"],
        "parent_ids": row.get("parent_ids") or [],
        "ancestor_ids": row.get("ancestor_ids") or [],
        "when_deleted": row.get("when_deleted").isoformat() if row.get("when_deleted") else None,
        "when_last_modified": row.get("when_last_modified").isoformat() if row.get("when_last_modified") else None,
    }

@app.get("/api/odm/items", response_model=OdmItemsResponse)
def list_odm_items(
    collection: str,
    owner: str,
    limit: int | None = Query(default=None, ge=1, le=1000),
    parentId: str | None = None,
    ancestorId: str | None = None,
):
    ensure_odm_tables_if_requested()
    where_clauses = ["collection = %s", "owner = %s", "when_deleted is null"]
    params: list[Any] = [collection, owner]

    if parentId:
        where_clauses.append("parent_ids @> array[%s]::text[]")
        params.append(parentId)
    if ancestorId:
        where_clauses.append("ancestor_ids @> array[%s]::text[]")
        params.append(ancestorId)

    limit_sql = ""
    if limit is not None:
        limit_sql = " limit %s"
        params.append(limit)

    sql = f"""
      select collection, item_id, owner, data, parent_ids, ancestor_ids, when_deleted, when_last_modified
      from public.lifesuite_odm_items
      where {' and '.join(where_clauses)}
      order by when_last_modified desc
      {limit_sql}
    """

    with connect_odm_db() as conn:
        with conn.cursor() as cursor:
            cursor.execute(sql, params)
            rows = cursor.fetchall()
    return OdmItemsResponse(items=[odm_row_to_response(row) for row in rows])

@app.put("/api/odm/items/{collection}/{item_id}")
def save_odm_item(collection: str, item_id: str, request: OdmSaveRequest):
    ensure_odm_tables_if_requested()
    history_id = f"{item_id}_{uuid.uuid4()}"

    with connect_odm_db() as conn:
        with conn.cursor() as cursor:
            if request.storeVersionHistory:
                cursor.execute(
                    """
                    insert into public.lifesuite_odm_item_history
                      (history_id, collection, item_id, owner, data, parent_ids, ancestor_ids)
                    values (%s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        history_id,
                        collection,
                        item_id,
                        request.owner,
                        Jsonb(request.data),
                        request.parentIds,
                        request.ancestorIds,
                    ),
                )
            cursor.execute(
                """
                insert into public.lifesuite_odm_items
                  (collection, item_id, owner, data, parent_ids, ancestor_ids, when_last_modified, when_deleted)
                values (%s, %s, %s, %s, %s, %s, now(), null)
                on conflict (collection, item_id) do update set
                  owner = excluded.owner,
                  data = excluded.data,
                  parent_ids = excluded.parent_ids,
                  ancestor_ids = excluded.ancestor_ids,
                  when_last_modified = now(),
                  when_deleted = null
                """,
                (
                    collection,
                    item_id,
                    request.owner,
                    Jsonb(request.data),
                    request.parentIds,
                    request.ancestorIds,
                ),
            )
    return {"ok": True}

@app.post("/api/odm/items/{collection}/{item_id}/delete")
def delete_odm_item(collection: str, item_id: str, request: OdmDeleteRequest):
    ensure_odm_tables_if_requested()
    with connect_odm_db() as conn:
        with conn.cursor() as cursor:
            cursor.execute(
                """
                update public.lifesuite_odm_items
                set when_deleted = now(), when_last_modified = now()
                where collection = %s and item_id = %s and owner = %s
                """,
                (collection, item_id, request.owner),
            )
    return {"ok": True}

@app.get("/categories/existing")
@app.get("/ai-api/categories/existing")
async def existing_categories():
    categories = load_existing_categories()
    return {"categories": [category.model_dump() for category in categories]}

@app.post("/category-tree", response_model=CategoryTreeResponse)
@app.post("/ai-api/category-tree", response_model=CategoryTreeResponse)
async def category_tree(category_request: CategoryTreeRequest):
    logger.info(
        "Category tree query submitted message_length=%s tree_roots=%s web_search=%s",
        len(category_request.message),
        len(category_request.tree),
        category_request.web_search,
    )

    search_results = web_search(category_request.message) if category_request.web_search else []
    existing_categories_list = load_existing_categories()
    chain = create_category_tree_chain()

    try:
        response = chain.invoke({
            "message": category_request.message,
            "tree_json": json.dumps([node.model_dump() for node in category_request.tree]),
            "existing_categories_json": existing_categories_as_prompt_json(existing_categories_list),
            "web_search_notes": "\n".join(search_results) or "(none)",
        })
        return build_category_tree_response(category_request, response.content, search_results, existing_categories_list)
    except Exception as e:
        logger.exception("Error generating category tree")
        raise HTTPException(status_code=500, detail=f"Ollama category tree error: {str(e)}")

@app.post("/category-tree-stream")
@app.post("/ai-api/category-tree-stream")
async def category_tree_stream(category_request: CategoryTreeRequest):
    logger.info(
        "Category tree stream submitted message_length=%s tree_roots=%s web_search=%s",
        len(category_request.message),
        len(category_request.tree),
        category_request.web_search,
    )

    chain = create_category_tree_record_chain()
    existing_categories_list = load_existing_categories()

    def stream_events():
        response_parts: list[str] = []
        search_results: list[str] = []

        try:
            yield sse_data({"type": "step", "message": "Preparing category tree request"})
            yield sse_data({"type": "step", "message": f"Loaded {len(existing_categories_list)} existing categories for matching"})

            if category_request.web_search:
                yield sse_data({"type": "step", "message": "Searching the web for context"})
                search_results = web_search(category_request.message)
                yield sse_data({"type": "step", "message": f"Found {len(search_results)} web search notes"})
            else:
                yield sse_data({"type": "step", "message": "Skipping web search"})

            yield sse_data({"type": "step", "message": f"Streaming category records from {OLLAMA_MODEL}"})
            for chunk in chain.stream({
                "message": category_request.message,
                "tree_json": json.dumps([node.model_dump() for node in category_request.tree]),
                "existing_categories_json": existing_categories_as_prompt_json(existing_categories_list),
                "web_search_notes": "\n".join(search_results) or "(none)",
            }):
                content = getattr(chunk, "content", "")
                if content:
                    response_parts.append(content)
                    yield sse_data({"type": "delta", "delta": content})

            logger.debug("LLM raw response:\n%s", "".join(response_parts))
            yield sse_data({"type": "step", "message": "Parsing category tree"})
            yield sse_data({"type": "step", "message": "Matching and de-duplicating categories with existing inventory via LLM"})
            response = build_category_tree_record_response(category_request, "".join(response_parts), search_results, existing_categories_list)
            yield sse_data({"type": "result", "result": response.model_dump()})
            yield sse_data({"type": "done"})
        except Exception as e:
            logger.exception("Error streaming category tree")
            yield sse_data({"type": "error", "message": str(e)})

    return StreamingResponse(stream_events(), media_type="text/event-stream")

@app.post("/category-tree/questions", response_model=QuestionAnswerResponse)
@app.post("/ai-api/category-tree/questions", response_model=QuestionAnswerResponse)
async def category_tree_questions(question_request: QuestionAnswerRequest):
    generation_requests = flatten_category_requests(question_request.tree)
    logger.info(
        "Category Q&A query submitted generation_requests=%s web_search=%s",
        len(generation_requests),
        question_request.web_search,
    )

    search_query = " ".join(request["categoryPath"] for request in generation_requests[:8])
    search_results = web_search(search_query) if question_request.web_search else []
    chain = create_question_answer_chain()

    try:
        response = chain.invoke({
            "tree_json": json.dumps([node.model_dump() for node in question_request.tree]),
            "requests_json": json.dumps(generation_requests),
            "web_search_notes": "\n".join(search_results) or "(none)",
        })
        return build_question_answer_response(response.content, search_results, generation_requests)
    except Exception as e:
        logger.exception("Error generating category Q&A")
        raise HTTPException(status_code=500, detail=f"Ollama Q&A generation error: {str(e)}")

@app.post("/category-tree/questions-stream")
@app.post("/ai-api/category-tree/questions-stream")
async def category_tree_questions_stream(question_request: QuestionAnswerRequest):
    generation_requests = flatten_category_requests(question_request.tree)
    logger.info(
        "Category Q&A stream submitted generation_requests=%s web_search=%s",
        len(generation_requests),
        question_request.web_search,
    )

    chain = create_question_answer_record_chain()

    def stream_events():
        response_parts: list[str] = []
        search_results: list[str] = []

        try:
            yield sse_data({"type": "step", "message": f"Preparing {len(generation_requests)} category Q&A requests"})
            yield sse_data({
                "type": "progress",
                "message": f"Requested {sum(request.get('questionCount', 0) for request in generation_requests)} total Q&A items",
            })

            if question_request.web_search:
                yield sse_data({"type": "step", "message": "Searching the web before generating Q&A"})
                search_query = " ".join(request["categoryPath"] for request in generation_requests[:8])
                logger.info("Web search query: %s", search_query)
                search_results = web_search(search_query)
                yield sse_data({"type": "step", "message": f"Found {len(search_results)} web search notes"})
            else:
                yield sse_data({"type": "step", "message": "Skipping web search"})

            yield sse_data({"type": "step", "message": f"Streaming Q&A records from {OLLAMA_MODEL}"})
            for chunk in chain.stream({
                "tree_json": json.dumps([node.model_dump() for node in question_request.tree]),
                "requests_json": json.dumps(generation_requests),
                "web_search_notes": "\n".join(search_results) or "(none)",
            }):
                content = getattr(chunk, "content", "")
                if content:
                    response_parts.append(content)
                    yield sse_data({"type": "delta", "delta": content})

            yield sse_data({"type": "step", "message": "Parsing generated Q&A"})
            response_content = "".join(response_parts)
            yield sse_data({"type": "progress", "message": f"Received {len(response_content)} generated characters"})
            response = build_question_answer_record_response(response_content, search_results, generation_requests)
            yield sse_data({"type": "progress", "message": f"Parsed {len(response.items)} displayable questions"})
            yield sse_data({"type": "result", "result": response.model_dump()})
            yield sse_data({"type": "done"})
        except Exception as e:
            logger.exception("Error streaming category Q&A")
            yield sse_data({"type": "error", "message": str(e)})

    return StreamingResponse(stream_events(), media_type="text/event-stream")

@app.post("/generate-answer", response_model=AIResponse)
@app.post("/ai-api/generate-answer", response_model=AIResponse)
async def generate_answer(quiz_question: QuizQuestion):
    logger.info(
        "AI answer query submitted question_length=%s context_length=%s",
        len(quiz_question.question),
        len(quiz_question.context),
    )

    chain = create_answer_chain(quiz_question.web_search)

    try:
        search_results = web_search(quiz_question.question) if quiz_question.web_search else []
        response = chain.invoke({
            "question": quiz_question.question,
            "context": quiz_question.context,
            "web_search_notes": "\n".join(search_results) or "(none)",
        })
        return AIResponse(answer=response.content, modelName=OLLAMA_MODEL, searchResults=search_results)
    except Exception as e:
        print(f"Error calling Ollama: {e}")
        # Return a more helpful error if Ollama is not running
        raise HTTPException(status_code=500, detail=f"Ollama error: {str(e)}. Make sure Ollama is running and has the {OLLAMA_MODEL} model.")

@app.post("/generate-answer-stream")
@app.post("/ai-api/generate-answer-stream")
async def generate_answer_stream(quiz_question: QuizQuestion):
    logger.info(
        "AI answer stream query submitted question_length=%s context_length=%s",
        len(quiz_question.question),
        len(quiz_question.context),
    )

    chain = create_answer_chain(quiz_question.web_search)

    def stream_answer():
        try:
            search_results = web_search(quiz_question.question) if quiz_question.web_search else []
            for chunk in chain.stream({
                "question": quiz_question.question,
                "context": quiz_question.context,
                "web_search_notes": "\n".join(search_results) or "(none)",
            }):
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
        return {"status": "ok", "llm": "ollama", "model": OLLAMA_MODEL}
    except Exception as e:
        return {"status": "error", "detail": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
