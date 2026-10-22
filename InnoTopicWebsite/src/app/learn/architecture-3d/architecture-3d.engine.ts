// @ts-nocheck - the scene code is ported from the standalone Vis/index.html page (untyped three.js);
// mountArchitecture3d below is the typed entry point used by the Angular components.
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { BRANDS } from './brands.data';
import { AGENTIC_DEEP, AGENTIC_TECHINFO } from './agentic.data';
import { RAG_DEEP, RAG_TECHINFO } from './rag.data';

export type Architecture3dId = 'rag' | 'agentic';

export interface Architecture3dOptions {
  /** App routes of the views, for cards that link from one view to the other. */
  routes: Record<Architecture3dId, string>;
  /** Client-side navigation for those links. */
  navigate(route: string): void;
}

export interface Architecture3dView {
  /** Stops the view and frees its WebGL resources. */
  dispose(): void;
  /** Highlights components whose name or technologies pass `test` and dims the rest; undefined clears it. */
  setSearch(test?: (name: string) => boolean): void;
}

for (const b of Object.values(BRANDS)) b.uri = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(b.svg);

const FLOOR_Y = -3;

/**
 * Builds the 3D architecture view inside `root`, whose template provides the HUD, legend, info panel, card,
 * caption and tooltip elements (data-el="…"). Everything is sized to `root`, not the window.
 */
export function mountArchitecture3d(root: HTMLElement, visId: Architecture3dId, options: Architecture3dOptions): Architecture3dView {
const $ = name => root.querySelector(`[data-el="${name}"]`);
const W = () => root.clientWidth || 1, H = () => root.clientHeight || 1;
const cleanups = [];
const on = (target, type, fn, opts) => { target.addEventListener(type, fn, opts); cleanups.push(() => target.removeEventListener(type, fn, opts)); };

/* ---------------- visualizations ----------------
   Each entry returns its content (TECHINFO, DEEP, TECH, LAYERS, FLOWS, NODES, LINKS, PLAY) plus the bits of
   scene setup that differ: camera home, floor zones, and the floor "overlay" (a clickable region with its own
   card). Overlay builders run after the engine below has set up the scene, so they use its helpers directly. */
const VIS = {
  rag: () => {
const TECHINFO = RAG_TECHINFO, DEEP = RAG_DEEP;
const TECH = {
  docs:   { show:2, list:[['unstructured','Unstructured'],['llamaparse','LlamaParse (LlamaIndex)'],['tika','Apache Tika'],['docling','Docling']] },
  chunk:  { show:3, list:[['langchain','LangChain text splitters'],['llamaindex','LlamaIndex node parsers'],['unstructured','Unstructured chunking']] },
  embed:  { show:4, list:[['openai','OpenAI text-embedding-3'],['cohere','Cohere Embed'],['huggingface','sentence-transformers (Hugging Face)'],['voyage','Voyage AI']] },
  vdb:    { show:6, list:[['pgvector','pgvector (PostgreSQL)'],['pinecone','Pinecone'],['weaviate','Weaviate'],['qdrant','Qdrant'],['milvus','Milvus'],['chroma','Chroma'],['mongodb','MongoDB Atlas Vector Search'],['supabase','Supabase Vector'],['neon','Neon'],['elasticsearch','Elasticsearch'],['opensearch','OpenSearch'],['vespa','Vespa'],['lancedb','LanceDB']] },
  kg:     { show:1, list:[['neo4j','Neo4j'],['graphrag','Microsoft GraphRAG']] },
  app:    { show:2, list:[['fastapi','FastAPI'],['nextjs','Next.js']] },
  rewrite:{ show:2, list:[['langchain','LangChain MultiQueryRetriever'],['llamaindex','LlamaIndex query transforms']] },
  qembed: { show:2, list:[['openai','OpenAI'],['cohere','Cohere'],['huggingface','sentence-transformers'],['voyage','Voyage AI']] },
  retriever:{ show:3, list:[['elasticsearch','Elasticsearch (BM25 + kNN)'],['opensearch','OpenSearch hybrid'],['weaviate','Weaviate hybrid'],['qdrant','Qdrant'],['pgvector','pgvector + full-text'],['neo4j','Neo4j (graph)']] },
  rerank: { show:3, list:[['cohere','Cohere Rerank'],['huggingface','Cross-encoders (Hugging Face)'],['voyage','Voyage rerank']] },
  prompt: { show:2, list:[['langchain','LangChain prompt templates'],['llamaindex','LlamaIndex response synthesizers']] },
  llm:    { show:7, list:[['openai','OpenAI GPT'],['claude','Anthropic Claude'],['bedrock','Amazon Bedrock'],['gemini','Google Gemini'],['meta','Meta Llama'],['mistral','Mistral AI'],['xai','xAI Grok'],['ollama','Ollama (self-hosted)'],['vllm','vLLM (self-hosted)']] },
  tools:  { show:2, list:[['mcp','Model Context Protocol (MCP)'],['openai','OpenAI function calling'],['langgraph','LangGraph agents']] },
  memory: { show:4, list:[['redis','Redis'],['zep','Zep'],['mem0','Mem0'],['pgvector','PostgreSQL (chat history)']] },
  guard:  { show:3, list:[['nvidia','NVIDIA NeMo Guardrails'],['guardrailsai','Guardrails AI'],['llamaguard','Llama Guard (Meta)']] },
  cache:  { show:1, list:[['redis','Redis (semantic cache)'],['gptcache','GPTCache']] },
  eval:   { show:4, list:[['langsmith','LangSmith'],['langfuse','Langfuse'],['phoenix','Arize Phoenix'],['wandb','Weights & Biases'],['ragas','Ragas']] },
  orch:   { show:5, list:[['langchain','LangChain'],['llamaindex','LlamaIndex'],['langgraph','LangGraph'],['haystack','Haystack'],['bedrockagents','Amazon Bedrock Agents']] },
};
const ORCH = { id:'orch', label:'Orchestration framework', layer:'query', 
  desc:'The glue code that wires the whole online pipeline together — calling the retriever, building prompts, running the LLM, tools and memory — usually written with an orchestration framework.',
  ex:'<b>Spans:</b> App / API, Query Rewriting, Embedding, Retriever, Reranker, Prompt Builder, LLM, Guardrails.' };

const LAYERS = {
  ingest: { name:'Offline ingestion', color:'#ffb547' },
  client: { name:'Client & API',      color:'#dfe8ff' },
  query:  { name:'Retrieval (query)', color:'#3ad7ff' },
  gen:    { name:'Generation',        color:'#ff5fd2' },
  agent:  { name:'Agent: tools & memory', color:'#a98bff' },
  ops:    { name:'Safety & operations', color:'#4ef0a0' },
};
const FLOWS = {
  ingest: { name:'Ingestion (indexing)', color:'#ffb547', speed:.16 },
  query:  { name:'Query / retrieval',    color:'#3ad7ff', speed:.22 },
  gen:    { name:'Generated answer',     color:'#ff5fd2', speed:.22 },
  agent:  { name:'Tool & memory calls',  color:'#b69bff', speed:.2 },
  ops:    { name:'Telemetry / traces',   color:'#6f87a6', speed:.08 },
};

const NODES = [
  // ingestion
  { id:'docs',  label:'Documents & Sources', layer:'ingest', pos:[-22,0,-18], shape:'docs', size:1.5,
    desc:'The raw knowledge your AI should know about: PDFs, wikis, web pages, tickets, databases. Connectors pull them in and keep them fresh.',
    ex:'<b>Examples:</b> Confluence, Google Drive, Notion, SQL tables, website crawls.' },
  { id:'chunk', label:'Chunking', layer:'ingest', pos:[-13,0,-19], shape:'chunk', size:1.4,
    desc:'Long documents are cleaned and split into small, overlapping passages ("chunks") so that each one can be found and fits into the model\'s context.',
    ex:'<b>Typical:</b> 300–800 tokens per chunk, split by headings or sentences, with metadata attached.' },
  { id:'embed', label:'Embedding Model', layer:'ingest', pos:[-4,0,-19], shape:'icosa', size:1.5,
    desc:'Turns each chunk into a vector — a list of numbers that captures its meaning — so similar ideas end up close together in "meaning space".',
    ex:'<b>Examples:</b> text-embedding-3, Cohere Embed, BGE, E5. Output: e.g. 1,024–3,072 numbers per chunk.' },
  { id:'vdb',   label:'Vector Database', layer:'ingest', pos:[6,0,-18], shape:'db', size:1.6,
    desc:'Stores all the chunk vectors plus their text and metadata, and can find the nearest ones to any query vector in milliseconds.',
    ex:'<b>Examples:</b> pgvector, Pinecone, Weaviate, Qdrant, Milvus. Uses ANN indexes like HNSW.' },
  { id:'kg',    label:'Knowledge Graph', layer:'ingest', pos:[16,0,-14], shape:'graph', size:1.6, optional:true,
    desc:'Optional: entities (people, products, policies) and their relationships extracted from documents, so the system can follow connections rather than just match text.',
    ex:'<b>Used in:</b> GraphRAG, Neo4j-backed retrieval, multi-hop questions.' },
  // client
  { id:'user',  label:'User', layer:'client', pos:[-27,0,6], shape:'user', size:1.4,
    desc:'The person asking a question in a chat window, app, or via voice. Everything in the online path exists to give them a correct, grounded answer.',
    ex:'<b>Example:</b> "What\'s our refund policy for annual plans?"' },
  { id:'app',   label:'App / API', layer:'client', pos:[-20,0,-4], shape:'box', size:1.4,
    desc:'The backend that receives the request, handles auth and sessions, and orchestrates every step of the pipeline.',
    ex:'<b>Often built with:</b> LangChain, LlamaIndex, custom Python/TS services behind a REST or streaming API.' },
  // query
  { id:'rewrite', label:'Query Rewriting', layer:'query', pos:[-11.5,0,-4.4], shape:'knot', size:1.3,
    desc:'Turns a messy or follow-up question into a clear, standalone search query — sometimes several — using the chat history.',
    ex:'<b>Techniques:</b> condense-question, multi-query expansion, HyDE (hypothetical answer).' },
  { id:'qembed', label:'Query Embedding', layer:'query', pos:[-4,0,-6.8], shape:'icosa', size:1.15,
    desc:'The search query is turned into a vector with the same embedding model used for the documents, so the two can be compared.',
    ex:'<b>Key rule:</b> query and documents must share one embedding model.' },
  { id:'retriever', label:'Hybrid Retriever', layer:'query', pos:[6.5,0,-5.6], shape:'retriever', size:1.45,
    desc:'Finds candidate chunks two ways at once: vector search for meaning and keyword search (BM25) for exact terms, then merges the results.',
    ex:'<b>Output:</b> top ~20–100 candidates, merged with reciprocal rank fusion; can also query the knowledge graph.' },
  { id:'rerank', label:'Reranker', layer:'query', pos:[13.5,0,-2], shape:'bars', size:1.3,
    desc:'A slower, more precise model reads the query next to each candidate and re-scores them, keeping only the handful that truly answer the question.',
    ex:'<b>Examples:</b> Cohere Rerank, bge-reranker, cross-encoders. Keeps top 3–10.' },
  // gen
  { id:'prompt', label:'Prompt Builder · Context Window', layer:'gen', pos:[15,0,6], shape:'frame', size:1.5,
    desc:'Assembles the final prompt: system instructions, the retrieved chunks with sources, relevant memory, and the user\'s question — all within the model\'s token budget.',
    ex:'<b>Context window:</b> the fixed number of tokens the LLM can read at once (e.g. 128k–1M).' },
  { id:'llm', label:'LLM', layer:'gen', pos:[4,2.5,9], shape:'llm', size:3.0, big:true,
    desc:'The large language model reads the assembled context and writes the answer token by token. Stacked transformer layers do the "thinking"; retrieval keeps it grounded in your data.',
    ex:'<b>Can also:</b> decide to call tools, ask for more retrieval, or reason in multiple steps (agentic RAG).' },
  { id:'response', label:'Response', layer:'gen', pos:[-9,0,14], shape:'dodeca', size:1.3,
    desc:'The final answer, usually streamed word by word, with citations pointing to the source chunks so the user can verify it.',
    ex:'<b>Example:</b> "Annual plans are refundable within 30 days of purchase [Billing Policy §4]."' },
  // agent
  { id:'tools', label:'Tools & Function Calling', layer:'agent', pos:[14,4,17], shape:'gear', size:1.4,
    desc:'Lets the LLM take actions or fetch live data by calling functions: web search, running code, or hitting company APIs, then using the results.',
    ex:'<b>Examples:</b> web_search(), run_python(), get_account(id), MCP servers.' },
  { id:'memory', label:'Memory (short & long term)', layer:'agent', pos:[23,3,8], shape:'memory', size:1.35,
    desc:'Short-term memory is the current conversation; long-term memory stores facts and preferences about the user across sessions and is retrieved when relevant.',
    ex:'<b>Stored as:</b> chat buffers, summaries, and a per-user vector store.' },
  // ops
  { id:'guard', label:'Guardrails & Safety', layer:'ops', pos:[-12.8,2,7.4], shape:'shield', size:1.35,
    desc:'Checks what goes in and comes out: blocks prompt injection and unsafe requests, redacts personal data, and verifies the answer is grounded and on-policy.',
    ex:'<b>Examples:</b> moderation models, PII filters, Llama Guard, NeMo Guardrails, grounding checks.' },
  { id:'cache', label:'Semantic Cache', layer:'ops', pos:[-29,3,-5], shape:'cache', size:1.2,
    desc:'Remembers recent questions and answers. If a new question means the same thing as a cached one, the answer is returned instantly and cheaply.',
    ex:'<b>Saves:</b> latency and LLM cost; keyed by embedding similarity, not exact text.' },
  { id:'eval', label:'Evaluation & Observability', layer:'ops', pos:[25,2.5,-4], shape:'eye', size:1.5,
    desc:'Traces every step (latency, tokens, retrieved chunks) and scores answers for faithfulness and relevance, so teams can spot failures and improve the system.',
    ex:'<b>Tools:</b> LangSmith, Langfuse, Arize Phoenix, Ragas, OpenTelemetry.' },
];

const LINKS = [
  ['docs','chunk','ingest'], ['chunk','embed','ingest'], ['embed','vdb','ingest'], ['chunk','kg','ingest', {lift:.45}],
  ['user','app','query'], ['app','cache','query',{bidir:true}], ['app','guard','query'], ['guard','rewrite','query'],
  ['rewrite','qembed','query'], ['qembed','retriever','query'], ['vdb','retriever','query'], ['kg','retriever','query'],
  ['retriever','rerank','query'], ['rerank','prompt','query'],
  ['memory','prompt','agent'], ['llm','memory','agent'], ['llm','tools','agent',{bidir:true}],
  ['prompt','llm','gen'], ['llm','guard','gen',{lift:.25}], ['guard','response','gen'], ['response','user','gen'],
  ['eval','llm','ops'], ['eval','retriever','ops'], ['eval','guard','ops'], ['eval','app','ops'],
  ['embed','qembed','shared'],
];

const PLAY = [
  { n:'user',     t:'A user asks: <i>"What\'s our refund policy for annual plans?"</i>' },
  { n:'app',      t:'The App / API receives the request and attaches the session, user ID and chat history.' },
  { n:'cache',    t:'Semantic cache lookup: nothing similar was answered recently, so it\'s a <b>cache miss</b>.' },
  { n:'guard',    t:'Input guardrails scan for prompt injection, personal data and policy violations. <b>Passed.</b>' },
  { n:'rewrite',  t:'The question is rewritten into a clear search query: <i>"refund policy annual subscription plan"</i>.' },
  { n:'qembed',   t:'The query is embedded into a vector with the same model that indexed the documents.' },
  { n:'retriever',t:'Hybrid search: nearest vectors in the Vector DB + BM25 keyword matches + graph links. <b>Top 50 chunks.</b>', also:['vdb','kg'] },
  { n:'rerank',   t:'The reranker scores every candidate against the question and keeps the <b>best 5</b>.' },
  { n:'prompt',   t:'The prompt builder packs instructions, the 5 chunks with sources, and the question into the context window.' },
  { n:'memory',   t:'Long-term memory adds a useful fact: this user is on the <b>Pro annual plan</b>, bought 12 days ago.', back:true },
  { n:'llm',      t:'The LLM reads the context and starts drafting an answer grounded in the retrieved policy text.' },
  { n:'tools',    t:'It calls a tool, <code>get_account(user_id)</code>, to confirm the purchase date, then continues writing.' },
  { n:'llm',      t:'The tool result comes back into the context and the LLM finishes the answer, with citations.' },
  { n:'guard',    t:'Output guardrails check the answer is grounded in sources, safe, and leaks no private data.' },
  { n:'response', t:'The answer streams back: <i>"Yes, annual plans are refundable within 30 days [Billing Policy §4]…"</i>' },
  { n:'user',     t:'The user gets a correct, sourced answer, usually within 1–3 seconds.' },
  { n:'eval',     t:'Every step was traced. Evaluations score faithfulness and relevance so the team can monitor quality.', also:['llm','retriever','app'] },
];
    return { TECHINFO, DEEP, TECH, LAYERS, FLOWS, NODES, LINKS, PLAY,
      home: { pos:[-1, 30, 44], target:[-1.5, 1, -0.5] },
      starHue: [0.58, 0.15, 0.5], grid: [140, 70],
      zones: [{ id:'z-ingest', text:'OFFLINE INGESTION', color:'#ffb547', x:-3, z:-17.5, w:50, d:12, tx:-19.5, tz:-12.8, tw:11,
        tip:'Runs ahead of time, not per question: documents are parsed, chunked, embedded and stored, so a query only searches what is already indexed.',
        spans:['docs','chunk','embed','vdb','kg'],
        card:{ deep:'The offline half of RAG runs on a schedule or when sources change, never while a user waits. Connectors pull documents, parsers turn PDFs, HTML and slides into clean text, chunkers split it into passages with metadata, an embedding model turns each chunk into a vector, and everything is written to the vector database (and optionally a knowledge graph). Query-time quality is capped by what this pipeline produced: a fact that was badly parsed or split across chunks cannot be retrieved later.',
          concepts:[['Incremental sync','Re-index only documents that changed, using hashes or timestamps.'],['Chunking strategy','Size, overlap and split points (headings, sentences).'],['Metadata','Source, date, permissions and section titles stored with each chunk.'],['Re-embedding','Changing the embedding model means re-indexing everything.']],
          inp:'Source systems: files, wikis, tickets, databases, web pages.', out:'Chunks with vectors and metadata in the vector DB, plus an optional knowledge graph.',
          tips:['Look at the parsed text before tuning anything else: bad extraction is the most common failure.','Store access permissions as metadata so retrieval can filter per user.','Version the index so a bad re-index can be rolled back.'] } }],
      frameBands: ['#e6edf7','#3ad7ff','#3ad7ff','#3ad7ff','#a98bff','#ffffff'],
      orbitR: 5.6, stepDwell: 1.9, playFlow: 'query', conceptsTitle: 'Key concepts &amp; parameters',
      legendLead: [], sharedLabel: 'Same embedding model',
      overlay: {
        info: ORCH, layer: { name:'Orchestration layer', color:'#9fd8ff' },
        spans: ['app','guard','rewrite','qembed','retriever','rerank','prompt','llm','tools','memory'],
        label: '<span class="t">Orchestration</span>', labelPos: new THREE.Vector3(-20.5, FLOOR_Y, 6.8),
        focus: new THREE.Vector3(-1.5, 1, -0.5), flyDist: 52,
        // translucent floor region around the online pipeline
        build(){
          const P = [[-24,-7.5],[-12,-8.8],[6,-9.6],[16.8,-5],[18.6,8],[9,14],[-1,12.6],[-14,10],[-24.2,8.5]].map(([x,z]) => new THREE.Vector3(x, 0, z));
          const pts = new THREE.CatmullRomCurve3(P, true, 'centripetal').getPoints(160);
          const shape = new THREE.Shape(pts.map(p => new THREE.Vector2(p.x, -p.z)));
          const fill = new THREE.Mesh(new THREE.ShapeGeometry(shape), new THREE.MeshBasicMaterial({ color:'#3ad7ff', transparent:true, opacity:.025, depthWrite:false, side:THREE.DoubleSide }));
          fill.rotation.x = -Math.PI/2; fill.position.y = FLOOR_Y + .01; scene.add(fill);
          const eg = new THREE.BufferGeometry().setFromPoints(pts.map(p => new THREE.Vector3(p.x, FLOOR_Y + .04, p.z)));
          const edge = new THREE.LineLoop(eg, new THREE.LineDashedMaterial({ color:'#9fd8ff', dashSize:.7, gapSize:.45, transparent:true, opacity:.5 }));
          edge.computeLineDistances(); scene.add(edge);
          return { fill, update(t, v){ fill.material.opacity = .025 + v * .035; edge.material.opacity = (.5 + v * .45) * (player.active ? .5 : 1); } };
        },
      },
    };
  },
  agentic: () => {
const TECHINFO = AGENTIC_TECHINFO, DEEP = AGENTIC_DEEP;
/* tech per component: [techKey, display name]; techs without a genuine logo render as text pills.
   The first `show` items with a logo float in the scene. */
const TECH = {
  user:     { show:3, list:[['nextjs','Next.js'],['aisdk','Vercel AI SDK (UI)'],['copilotkit','CopilotKit (AG-UI)'],['slack','Slack']] },
  triggers: { show:3, list:[['githubactions','GitHub Actions'],['zapier','Zapier'],['n8n','n8n'],['slack','Slack events']] },
  guard:    { show:3, list:[['nvidia','NVIDIA NeMo Guardrails'],['guardrailsai','Guardrails AI'],['llamaguard','Llama Guard (Meta)'],['openaiagents','OpenAI Agents SDK guardrails']] },
  hitl:     { show:3, list:[['slack','Slack approvals'],['langgraph','LangGraph interrupts'],['temporal','Temporal signals']] },
  context:  { show:2, list:[['langchain','LangChain'],['llamaindex','LlamaIndex'],['dspy','DSPy'],['mcp','MCP resources & prompts']] },
  ltm:      { show:5, list:[['mem0','Mem0'],['zep','Zep'],['letta','Letta (MemGPT)'],['postgres','PostgreSQL'],['redis','Redis']] },
  knowledge:{ show:7, list:[['pgvector','pgvector (PostgreSQL)'],['pinecone','Pinecone'],['qdrant','Qdrant'],['weaviate','Weaviate'],['milvus','Milvus'],['chroma','Chroma'],['mongodb','MongoDB Atlas Vector Search'],['elasticsearch','Elasticsearch'],['supabase','Supabase Vector'],['neon','Neon'],['vespa','Vespa'],['lancedb','LanceDB'],['neo4j','Neo4j (graph)']] },
  llm:      { show:9, list:[['openai','OpenAI GPT'],['claude','Anthropic Claude'],['bedrock','Amazon Bedrock'],['gemini','Google Gemini'],['meta','Meta Llama'],['mistral','Mistral AI'],['deepseek','DeepSeek'],['qwen','Qwen'],['xai','xAI Grok'],['ollama','Ollama (self-hosted)'],['vllm','vLLM (self-hosted)']] },
  planner:  { show:2, list:[['langgraph','LangGraph plan-and-execute'],['crewai','CrewAI planning'],['dspy','DSPy']] },
  reflect:  { show:2, list:[['langgraph','LangGraph reflection loops'],['guardrailsai','Guardrails AI validators'],['deepeval','DeepEval (LLM-as-judge)']] },
  tools:    { show:4, list:[['openai','OpenAI function calling'],['claude','Claude tool use'],['tavily','Tavily search'],['exa','Exa search'],['firecrawl','Firecrawl'],['perplexity','Perplexity Sonar']] },
  mcp:      { show:5, list:[['mcp','Model Context Protocol'],['github','GitHub MCP server'],['postgres','Postgres MCP server'],['slack','Slack MCP server'],['playwright','Playwright MCP'],['notion','Notion MCP'],['stripe','Stripe MCP']] },
  code:     { show:4, list:[['e2b','E2B'],['modal','Modal Sandboxes'],['docker','Docker'],['vercelsandbox','Vercel Sandbox']] },
  browser:  { show:5, list:[['playwright','Playwright'],['browserbase','Browserbase (Stagehand)'],['browseruse','Browser Use'],['claude','Claude computer use'],['openai','OpenAI computer use']] },
  apis:     { show:5, list:[['github','GitHub'],['slack','Slack'],['jira','Jira'],['stripe','Stripe'],['notion','Notion'],['google','Google Workspace']] },
  subagents:{ show:4, list:[['crewai','CrewAI crews'],['msaf','Microsoft Agent Framework (AutoGen)'],['openaiagents','OpenAI Agents SDK handoffs'],['claudeagent','Claude Agent SDK subagents'],['langgraph','LangGraph supervisor']] },
  a2a:      { show:3, list:[['a2a','Agent2Agent (A2A)'],['adk','Google ADK'],['msaf','Microsoft Agent Framework']] },
  obs:      { show:5, list:[['langsmith','LangSmith'],['langfuse','Langfuse'],['phoenix','Arize Phoenix'],['opentelemetry','OpenTelemetry'],['braintrust','Braintrust'],['wandb','W&B Weave'],['deepeval','DeepEval']] },
  loop:     { show:9, list:[['langgraph','LangGraph'],['openaiagents','OpenAI Agents SDK'],['claudeagent','Claude Agent SDK'],['bedrockagents','Amazon Bedrock Agents'],['bedrockagentcore','Amazon Bedrock AgentCore'],['strands','Strands Agents'],['crewai','CrewAI'],['msaf','Microsoft Agent Framework'],['adk','Google ADK'],['pydanticai','Pydantic AI'],['mastra','Mastra'],['aisdk','Vercel AI SDK'],['llamaindex','LlamaIndex'],['smolagents','smolagents'],['temporal','Temporal (durable)'],['inngest','Inngest (durable)']] },
};
const LAYERS = {
  client:  { name:'Users & triggers',    color:'#dfe8ff' },
  core:    { name:'Reasoning core',      color:'#ff5fd2' },
  context: { name:'Context & memory',    color:'#3ad7ff' },
  action:  { name:'Tools & environment', color:'#ffb547' },
  multi:   { name:'Multi-agent',         color:'#a98bff' },
  ops:     { name:'Safety & operations', color:'#4ef0a0' },
};
const FLOWS = {
  task:     { name:'Task in · answer out',     color:'#dfe8ff', speed:.2 },
  context:  { name:'Context & memory',          color:'#3ad7ff', speed:.2 },
  control:  { name:'Plan · reflect',            color:'#ff5fd2', speed:.22 },
  action:   { name:'Tool calls & results',      color:'#ffb547', speed:.24 },
  delegate: { name:'Delegation',                color:'#b69bff', speed:.2 },
  govern:   { name:'Policy & approvals',        color:'#4ef0a0', speed:.16 },
  ops:      { name:'Traces & evals',            color:'#6f87a6', speed:.08 },
};
const LOOP = { id:'loop', label:'Agent loop · runtime', layer:'core',
  desc:'The runtime that turns a model into an agent: it repeats observe → think → act until the goal is met, keeping state, enforcing step and budget limits, streaming progress and checkpointing so runs survive failures.',
  ex:'<b>Spans:</b> Context Window, LLM, Planner, Reflection and Tool Calling. Built with an agent framework.' };
const LOOP_LAYER = { name:'Agent runtime', color:'#ff9be6' };
const LOOP_SPANS = ['context','llm','planner','reflect','tools'];

const NODES = [
  // users & triggers
  { id:'user', label:'User', layer:'client', pos:[-26,0,7], shape:'user', size:1.4,
    desc:'The person who gives the agent a goal (in a chat, an IDE, Slack or an app) and stays in control: they can steer, interrupt and approve risky steps.',
    ex:'<b>Example goal:</b> "Checkout conversions dropped. Find out why and fix it."' },
  { id:'triggers', label:'Triggers & Events', layer:'client', pos:[-24,1.5,-4], shape:'bolt', size:1.3,
    desc:'Not every run starts with a chat message. Schedules, webhooks, new emails, tickets or CI events can start an agent on their own, which is how agents work in the background.',
    ex:'<b>Examples:</b> nightly cron, GitHub issue opened, Stripe webhook, inbox rule.' },
  // reasoning core
  { id:'llm', label:'LLM', layer:'core', pos:[0,3,-2], shape:'llm', size:3.0, big:true,
    desc:'The reasoning engine. On every turn it reads the context and decides what to do next: answer, call one or more tools, delegate, or ask for help. The loop around it is what turns a model into an agent.',
    ex:'<b>Needs:</b> strong reasoning and reliable tool calling; smaller models handle cheap sub-tasks.' },
  { id:'planner', label:'Planning', layer:'core', pos:[-6.8,3,-8.8], shape:'tree', size:1.2,
    desc:'Breaks a goal into steps and keeps a living plan (a to-do list) in the context, revising it as results come in. Explicit (plan-then-execute) or implicit in the model\'s reasoning.',
    ex:'<b>Patterns:</b> ReAct, plan-and-execute, task decomposition, extended thinking.' },
  { id:'reflect', label:'Reflection & Self-critique', layer:'core', pos:[6.8,3,4.8], shape:'reflect', size:1.2,
    desc:'The agent checks its own work: a critic step (same or another model, or a test suite) reviews results against the goal, catches errors and triggers a fix before anything ships.',
    ex:'<b>Patterns:</b> self-critique, Reflexion, LLM-as-judge, verify-by-test.' },
  // context & memory
  { id:'context', label:'Context Window', layer:'context', pos:[-9.6,0,-2], shape:'frame', size:1.45,
    desc:'Everything the model sees on each turn: instructions, tool definitions, the plan, relevant memories, retrieved knowledge and the latest tool results. Curating it ("context engineering") drives most of an agent\'s quality.',
    ex:'<b>Budget:</b> a fixed token window (e.g. 200k–1M); older steps get summarised or dropped.' },
  { id:'ltm', label:'Long-term Memory', layer:'context', pos:[-25,2.5,-13], shape:'memory', size:1.35,
    desc:'What the agent remembers across sessions: facts and preferences (semantic), past runs (episodic) and learned procedures. Recalled into context when relevant, updated after runs.',
    ex:'<b>Stored in:</b> vector and key-value stores, often plain PostgreSQL with pgvector.' },
  { id:'knowledge', label:'Knowledge · Vector DB (RAG)', layer:'context', pos:[-15,0,-21], shape:'db', size:1.5,
    desc:'Company documents and data the agent can search: the RAG part. In agentic RAG the agent itself decides when to search, with which query, and whether the results are good enough.',
    ex:'<b>Backed by:</b> PostgreSQL + pgvector, Pinecone, Qdrant, Weaviate, Milvus, MongoDB Atlas…' },
  // tools & environment
  { id:'tools', label:'Tool Calling', layer:'action', pos:[9.6,0,-2], shape:'gear', size:1.4,
    desc:'How the agent acts. The model emits a structured tool call (name + JSON arguments); the runtime validates it, checks permissions, runs it and feeds the result back as an observation.',
    ex:'<b>Examples:</b> search_web(q), run_sql(query), create_pr(…), call_subagent(task).' },
  { id:'mcp', label:'MCP Servers', layer:'action', pos:[20,1,-8], shape:'hub', size:1.35,
    desc:'Model Context Protocol servers expose tools, data and prompts in a standard way, so an agent can plug into GitHub, databases, Slack or internal systems without custom glue for each.',
    ex:'<b>Think:</b> "USB-C for AI tools": local (stdio) or remote (HTTP) servers.' },
  { id:'code', label:'Code Sandbox', layer:'action', pos:[19,0,6], shape:'terminal', size:1.3,
    desc:'An isolated sandbox where the agent writes and runs code (to analyse data, test a fix or build files) without touching production machines.',
    ex:'<b>Isolation:</b> microVMs or containers, no secrets, limited network, time limits.' },
  { id:'browser', label:'Browser & Computer Use', layer:'action', pos:[27.5,2,-1], shape:'window', size:1.3,
    desc:'Lets the agent use websites and apps like a person (navigate, click, type and read pages) for tasks with no API. "Computer use" extends this to whole desktops.',
    ex:'<b>Driven by:</b> accessibility trees or screenshots, plus a model that picks the next action.' },
  { id:'apis', label:'Business Systems & APIs', layer:'action', pos:[29,0,-14], shape:'apis', size:1.3,
    desc:'The real systems the agent changes: code hosts, ticketing, CRM, payments, email and chat. Actions here have side effects, so scopes, audit logs and approvals matter most.',
    ex:'<b>Examples:</b> GitHub, Jira, Slack, Stripe, Google Workspace, internal REST APIs.' },
  // multi-agent
  { id:'subagents', label:'Sub-agents', layer:'multi', pos:[8,2,-19], shape:'agents', size:1.5,
    desc:'Specialist agents with their own prompt, tools and fresh context. The main agent delegates sub-tasks (often in parallel) and gets back a compact result instead of all the noise.',
    ex:'<b>Examples:</b> researcher, coder, tester, reviewer: the orchestrator-worker pattern.' },
  { id:'a2a', label:'Remote Agents (A2A)', layer:'multi', pos:[19,3,-21], shape:'a2a', size:1.3,
    desc:'Agents built by other teams or companies, on other frameworks, reached over a network protocol. They advertise their skills in an Agent Card and exchange tasks and results.',
    ex:'<b>Protocol:</b> Agent2Agent (A2A): HTTP + JSON-RPC, streaming, long-running tasks.' },
  // safety & operations
  { id:'guard', label:'Guardrails & Permissions', layer:'ops', pos:[-9,1.5,14.5], shape:'shield', size:1.35,
    desc:'Checks what goes in, what comes out and what the agent may do: blocks prompt injection, redacts secrets and personal data, and enforces least-privilege permissions on every tool call.',
    ex:'<b>Examples:</b> input/output classifiers, tool allow-lists, scoped OAuth tokens, policy rules.' },
  { id:'hitl', label:'Human Approval', layer:'ops', pos:[-18.5,2.5,15.5], shape:'approve', size:1.3,
    desc:'For high-impact actions (spending money, deleting data, merging code, emailing customers) the run pauses and asks a person to approve, edit or reject before continuing.',
    ex:'<b>Typical:</b> an approval card in Slack or the app; the run resumes from a checkpoint.' },
  { id:'obs', label:'Tracing & Evals', layer:'ops', pos:[15,3,15], shape:'eye', size:1.4,
    desc:'Traces every step of every run (model calls, tool calls, sub-agents, tokens, cost and latency) and scores runs with evals, so teams can debug failures and catch regressions.',
    ex:'<b>Measures:</b> task success, tool-call accuracy, steps, cost per task, safety violations.' },
];

const LINKS = [
  ['user','guard','task',{bidir:true}], ['guard','context','task'], ['triggers','context','task'],
  ['ltm','context','context',{bidir:true}], ['knowledge','context','context'], ['context','llm','context'],
  ['planner','llm','control',{bidir:true}], ['reflect','llm','control',{bidir:true}],
  ['llm','tools','action'], ['tools','mcp','action',{bidir:true}], ['tools','code','action',{bidir:true}],
  ['tools','browser','action',{bidir:true}], ['mcp','apis','action',{bidir:true}],
  ['tools','subagents','delegate',{bidir:true}], ['subagents','a2a','delegate',{bidir:true}],
  ['llm','guard','task',{lift:.3}], ['tools','guard','govern'], ['guard','hitl','govern',{bidir:true}], ['hitl','user','govern',{bidir:true}],
  ['obs','llm','ops'], ['obs','tools','ops'], ['obs','guard','ops'],
  ['ltm','knowledge','shared'],
];

const PLAY = [
  { n:'user',      t:'A user asks: <i>"Checkout conversions dropped 18% since yesterday. Find out why and fix it."</i>' },
  { n:'guard',     t:'Input guardrails scan for prompt injection and check this user may request code changes. <b>Passed.</b>' },
  { n:'context',   t:'The runtime starts a run and assembles the context: instructions, tool definitions, the goal, and a recalled memory: <i>"checkout lives in shop/checkout; deploys go through GitHub Actions"</i>.', also:['ltm'] },
  { n:'llm',       it:1, t:'<b>Think.</b> The LLM reads the context and decides the goal needs a plan first.' },
  { n:'planner',   it:1, t:'It writes a plan into the context: ① check metrics &amp; recent deploys ② reproduce ③ fix ④ verify ⑤ ship.' },
  { n:'tools',     it:1, t:'<b>Act.</b> Three tool calls go out in parallel; the runtime checks each one against policy before running it.', also:['guard'] },
  { n:'mcp',       it:1, t:'Through MCP servers it queries analytics and GitHub: a deploy at 18:04 changed the payment form.', also:['apis'] },
  { n:'subagents', it:1, t:'Meanwhile a <b>tester</b> sub-agent, with its own fresh context, is sent to reproduce the drop.', also:['tools'] },
  { n:'browser',   it:1, t:'It drives a real browser through checkout: on Safari the <b>Pay</b> button stays disabled.' },
  { n:'context',   it:1, t:'<b>Observe.</b> Results come back as observations; the runtime trims them into the context and checkpoints the run.', also:['tools'] },
  { n:'llm',       it:2, t:'<b>Think.</b> The LLM connects the dots: the new form validator breaks on Safari.' },
  { n:'code',      it:2, t:'<b>Act.</b> In a sandbox it writes a failing test, patches the validator and runs the suite: <b>all green</b>.', also:['tools'] },
  { n:'reflect',   it:2, t:'<b>Reflect.</b> A critic pass checks the diff against the goal and asks for one more edge-case test. Added.', also:['llm'] },
  { n:'hitl',      t:'Shipping to production is high-risk, so policy escalates: the run pauses at a checkpoint until the user approves in Slack. <b>Approved.</b>', also:['guard','user'], dwell:2.8 },
  { n:'apis',      it:3, t:'<b>Act.</b> The agent opens a pull request on GitHub and posts a summary to Slack, both through MCP.', also:['mcp'] },
  { n:'guard',     t:'Output guardrails check the final report: no secrets, no personal data, every claim linked to evidence.' },
  { n:'user',      t:'The user gets the result: root cause, fix, PR link and evidence, after about 4 minutes and 23 tool calls.' },
  { n:'obs',       t:'Every model call, tool call and sub-agent was traced, and evals score the run: task success ✓, cost $0.41.', also:['llm','tools','subagents'] },
];
    const RING = { c: new THREE.Vector3(0, FLOOR_Y, -2), r: 9.6 };
    return { TECHINFO, DEEP, TECH, LAYERS, FLOWS, NODES, LINKS, PLAY,
      home: { pos:[-3, 38, 54], target:[-2.5, 0, -3] },
      starHue: [0.8, 0.18, 0.45], grid: [150, 75],
      zones: [{ id:'z-memory', text:'MEMORY & KNOWLEDGE', color:'#3ad7ff', x:-20, z:-17.5, w:19, d:12, tx:-20, tz:-11.9,
                tip:'Where context comes from beyond the conversation: long-term memory kept across sessions, and company knowledge the agent can search (RAG).',
                spans:['ltm','knowledge','context'],
                card:{ deep:'An agent only knows what is in its context window, so everything it should remember or look up has to be fetched into it. This zone holds the two long-lived sources: long-term memory, which the agent writes itself about users, past runs and learned procedures, and company knowledge, documents indexed for search (RAG). Unlike classic RAG, the agent decides when to recall or search, with which query, and whether the result is good enough.',
                  concepts:[['Recall vs. search','Memory is about this user and past runs; knowledge is shared company content.'],['Write-back','After a run, the agent stores new facts and outcomes.'],['Agentic retrieval','The model issues searches as tool calls and retries with better queries.'],['Shared storage','Both often live in one Postgres database with pgvector.']],
                  inp:'Recall and search requests while the context is assembled.', out:'Relevant memories and passages placed in the context window.',
                  tips:['Scope memory per user or tenant from the start.','Let users see and delete what the agent remembers.','Expire or summarise old memories so recall stays relevant.'] } },
              { id:'z-tools', text:'TOOLS & ENVIRONMENT', color:'#ffb547', x:23, z:-4, w:15, d:26, tx:23, tz:8.4,
                tip:'Everything the agent can act on: tool calls, MCP servers, a code sandbox, a browser and the real business systems behind them.',
                spans:['tools','mcp','code','browser','apis'],
                card:{ deep:'Everything outside the model that the agent can act on. The LLM only emits tool calls; the runtime executes them against real systems: MCP servers that wrap APIs and databases, a sandbox for running code, a browser for websites without an API, and business systems where actions have side effects. Results come back as observations. This is where an agent\'s mistakes become real, so permissions, isolation and audit logs belong here.',
                  concepts:[['Read vs. write tools','Reads are cheap to allow; writes need scopes and often approval.'],['Isolation','Run untrusted code and browsing in sandboxes without secrets.'],['Idempotency','A retried call must not charge or send twice.'],['Audit log','Every call recorded with arguments, caller and result.']],
                  inp:'Validated tool calls from the agent loop.', out:'Observations (data, files, screenshots, errors) and side effects in real systems.',
                  tips:['Give each tool a clear name, description and JSON schema: the model reads them.','Return compact, structured results instead of raw dumps.','Start read-only and add write access one tool at a time.'] } },
              { id:'z-multi', text:'MULTI-AGENT', color:'#a98bff', x:13.5, z:-21.5, w:17, d:7, tx:13.5, tz:-18.4,
                tip:'Work handed to other agents: local sub-agents with their own fresh context, or remote agents reached over the A2A protocol.',
                spans:['subagents','a2a','tools'],
                card:{ deep:'Some work is better split across agents. Sub-agents run inside the same system with their own prompt, tools and fresh context; they take a sub-task from the main agent and return a compact result, often in parallel. Remote agents are built by other teams or vendors and reached over the A2A protocol, which advertises their skills and carries tasks and results between frameworks. Every extra agent adds cost and coordination, so delegate only when it buys focus or parallelism.',
                  concepts:[['Orchestrator–worker','A lead agent splits the work and merges the results.'],['Context isolation','Workers see only their sub-task, not the whole history.'],['Handoff','Pass the conversation to a specialist agent.'],['Agent Card','A2A description of a remote agent\'s skills and endpoint.']],
                  inp:'Sub-tasks delegated by the main agent.', out:'Compact results, artifacts or status updates.',
                  tips:['Write delegation prompts like briefs: goal, constraints, expected output format.','Cap parallel workers and the total budget per run.','Trace across agents so one run stays one tree.'] } }],
      // floor words on the loop ring, each with its own card
      loopWords: [
        { id:'w-observe', text:'OBSERVE', label:'Observe', dx:-5.6, dz:.2, w:4.2, spans:['context','tools','ltm'],
          tip:'Tool results and new information come back as observations and are trimmed into the context window.',
          card:{ deep:'Each iteration starts with what the model will see. New inputs (tool results, sub-agent reports, user messages, approvals) arrive as observations. The runtime appends them to the context, trims or summarises older steps to stay within the token budget, and may recall memories that just became relevant. What is kept here decides what the model can reason about next.',
            concepts:[['Observation','The result of the last action, fed back as input.'],['Compaction','Summarise or drop old steps to free tokens.'],['Errors as signal','A failed call is an observation too; the model can recover from it.']],
            inp:'Tool results, messages and events.', out:'An updated, trimmed context window.',
            tips:['Truncate large tool outputs and keep a pointer to the full data.','Keep error messages readable: the model fixes what it understands.','Checkpoint the state after each observation.'] } },
        { id:'w-think', text:'THINK', label:'Think', dx:0, dz:-6.4, w:3.4, spans:['llm','planner','reflect'],
          tip:'The LLM reads the context and decides the next step: plan, call tools, delegate, ask for approval or answer.',
          card:{ deep:'The model reads the whole context and produces its next move: a final answer, one or more tool calls, a delegation, a request for approval, or an update to its plan. Reasoning models may think at length before acting, and planning and reflection happen here too. This is the only non-deterministic step of the loop, which is why validation and guardrails surround it.',
            concepts:[['Next action','Answer, call tools, delegate or ask a human.'],['Parallel tool calls','Several independent calls in one step.'],['Reasoning budget','How long the model may think before it has to act.']],
            inp:'The current context window.', out:'A structured decision: tool calls or a final answer.',
            tips:['Use a strong model here and cheaper ones for sub-tasks.','Validate tool-call arguments against the schema before running them.','Log a reasoning summary with each step for debugging.'] } },
        { id:'w-act', text:'ACT', label:'Act', dx:5.8, dz:.2, w:2.6, spans:['tools','guard','mcp','code','browser'],
          tip:'The runtime checks each tool call against policy and runs it; its result becomes the next observation.',
          card:{ deep:'The runtime executes what the model decided. Each tool call is validated, checked against policy and permissions, possibly paused for human approval, then run with a timeout and retries; independent calls run in parallel. The result, or the error, becomes the next observation and closes the loop.',
            concepts:[['Policy check','Allow, deny or escalate each call before it runs.'],['Timeouts & retries','Bound every call; retry only idempotent ones.'],['Side effects','Writes to real systems that may not be undoable.']],
            inp:'Tool calls chosen by the model.', out:'Results and errors, returned as observations.',
            tips:['Run independent calls in parallel to cut latency.','Escalate irreversible actions to a human.','Enforce step and spend limits in the runtime, not just in the prompt.'] } },
      ],
      // context window layout: instructions, tools, plan, memories, knowledge, observations
      frameBands: ['#e6edf7','#ffb547','#ff5fd2','#3ad7ff','#3ad7ff','#ffffff'],
      orbitR: 5.4, stepDwell: 2.0, playFlow: 'control', conceptsTitle: 'Key concepts',
      legendLead: [['Agent loop (ring)', '#ff9be6']], sharedLabel: 'Often one Postgres DB',
      overlay: {
        info: LOOP, layer: LOOP_LAYER, spans: LOOP_SPANS,
        label: '<span class="t">Agent loop</span><span class="s">observe → think → act</span>',
        labelPos: new THREE.Vector3(RING.c.x + Math.cos(Math.PI*.56) * RING.r, FLOOR_Y, RING.c.z + Math.sin(Math.PI*.56) * RING.r),
        focus: RING.c.clone().setY(1), flyDist: 46,
        // the agent loop: a ring around the reasoning core
        build(){
          const fill = new THREE.Mesh(new THREE.CircleGeometry(RING.r, 96), new THREE.MeshBasicMaterial({ color:'#ff5fd2', transparent:true, opacity:.03, depthWrite:false, side:THREE.DoubleSide }));
          fill.rotation.x = -Math.PI/2; fill.position.set(RING.c.x, FLOOR_Y + .01, RING.c.z); scene.add(fill);
          const tube = new THREE.Mesh(new THREE.TorusGeometry(RING.r, .07, 8, 192), new THREE.MeshBasicMaterial({ color:'#ff7fe0', transparent:true, opacity:.45, depthWrite:false }));
          tube.rotation.x = Math.PI/2; tube.position.set(RING.c.x, FLOOR_Y + .06, RING.c.z); scene.add(tube);
          // arrowheads show the direction of the loop: observe (context) → think (LLM) → act (tools) → observe
          const arrowM = new THREE.MeshBasicMaterial({ color:'#ffc2f0', transparent:true, opacity:.9 });
          for (let k = 0; k < 4; k++){ const a = Math.PI*1.25 + k * Math.PI/2;
            const cone = new THREE.Mesh(new THREE.ConeGeometry(.34, .9, 16), arrowM);
            cone.position.set(RING.c.x + Math.cos(a)*RING.r, FLOOR_Y + .12, RING.c.z + Math.sin(a)*RING.r);
            cone.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), new THREE.Vector3(-Math.sin(a), 0, Math.cos(a))); scene.add(cone); }
          // three comets chase each other around the ring
          const TRAIL = 9, comets = [];
          for (let c = 0; c < 3; c++){ const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(TRAIL*3), 3));
            const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color:'#ffc2f0', size:1.0, map:GLOW, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, opacity:.95 }));
            scene.add(pts); comets.push({ pts, base: c / 3 * Math.PI * 2 }); }
          V.loopWords.forEach(({ id, text, label, dx, dz, w, tip, spans, card }) => {
            const m = floorText(text, '#ff9be6', RING.c.x + dx, RING.c.z + dz, w, .55);
            addFloorItem(id, { info:{ label, desc:tip, ex:'' }, layer:LOOP_LAYER, spans, card, spansTitle:'Involved components',
              focus:new THREE.Vector3(RING.c.x + dx, 1, RING.c.z + dz), flyDist:34, glow: on => { m.material.opacity = on ? 1 : .55; } }, m);
          });
          let phase = 0, lastT = null;
          return { fill, update(t, v){
            fill.material.opacity = .03 + v * .04; tube.material.opacity = .45 + v * .4;
            phase += Math.min(.1, t - (lastT ?? t)) * (player.active ? .75 : .42); lastT = t;
            for (const cm of comets){
              const arr = cm.pts.geometry.attributes.position.array;
              for (let i = 0; i < TRAIL; i++){ const a = cm.base + phase - i * .035;
                arr[i*3] = RING.c.x + Math.cos(a) * RING.r; arr[i*3+1] = FLOOR_Y + .2; arr[i*3+2] = RING.c.z + Math.sin(a) * RING.r; }
              cm.pts.geometry.attributes.position.needsUpdate = true;
            }
          } };
        },
      },
    };
  },
};
const VIS_ID = visId in VIS ? visId : 'rag';
/** Pointer position relative to the view (the canvas fills \`root\`), in CSS pixels. */
const local = e => { const r = root.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
const V = VIS[VIS_ID]();
const { TECHINFO, DEEP, TECH, LAYERS, FLOWS, NODES, LINKS, PLAY, overlay } = V;
const OV = overlay.info.id;

/* tech per component: techs without a genuine logo render as text pills; the first `show` items with a logo float in the scene */
const sceneLogos = id => TECH[id] ? TECH[id].list.slice(0, TECH[id].show).map(([k]) => k).filter(k => TECHINFO[k].logo) : [];
const logoImg = (k, cls='') => TECHINFO[k].logo ? `<img class="${cls}" alt="" src="${BRANDS[TECHINFO[k].logo].uri}">` : `<span class="nologo ${cls}">${TECHINFO[k].name.replace(/^(Apache|Microsoft) /,'').slice(0,2)}</span>`;

/* ---------------- setup ---------------- */
const container = $('scene');
const renderer = new THREE.WebGLRenderer({ antialias:true, powerPreference:'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(W(), H());
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
container.appendChild(renderer.domElement);
cleanups.push(() => { renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); });

const labelRenderer = new CSS2DRenderer({ element: $('labels') });
labelRenderer.setSize(W(), H());

const scene = new THREE.Scene();
scene.background = new THREE.Color('#05070d');
scene.fog = new THREE.FogExp2('#05070d', 0.0085);

const camera = new THREE.PerspectiveCamera(42, W()/H(), 0.1, 1000);
const HOME_POS = new THREE.Vector3(...V.home.pos);
const HOME_TARGET = new THREE.Vector3(...V.home.target);
camera.position.copy(HOME_POS);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(HOME_TARGET);
controls.enableDamping = true; controls.dampingFactor = 0.07;
controls.minDistance = 12; controls.maxDistance = 120;
controls.maxPolarAngle = Math.PI * 0.49;
controls.autoRotate = true; controls.autoRotateSpeed = 0.35;
controls.screenSpacePanning = true;
controls.enableZoom = false;   // all zooming goes through our own handler (pinch, optional wheel, +/− buttons)

scene.add(new THREE.AmbientLight('#8aa0c8', 0.55));
const key = new THREE.DirectionalLight('#ffffff', 1.1); key.position.set(10, 30, 20); scene.add(key);
const rim = new THREE.DirectionalLight('#6aa8ff', 0.6); rim.position.set(-20, 10, -30); scene.add(rim);
const llmLight = new THREE.PointLight('#ff5fd2', 60, 40, 1.6); scene.add(llmLight);

/* glow texture */
function glowTexture(){
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const g = c.getContext('2d'); const gr = g.createRadialGradient(64,64,0,64,64,64);
  gr.addColorStop(0,'rgba(255,255,255,1)'); gr.addColorStop(.25,'rgba(255,255,255,.55)');
  gr.addColorStop(.6,'rgba(255,255,255,.12)'); gr.addColorStop(1,'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0,0,128,128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const GLOW = glowTexture();

/* starfield */
{
  const [h0, hr, sat] = V.starHue;
  const N = 3000, p = new Float32Array(N*3), col = new Float32Array(N*3);
  for (let i=0;i<N;i++){
    const r = 160 + Math.random()*260, th = Math.random()*Math.PI*2, ph = Math.acos(2*Math.random()-1);
    p[i*3] = r*Math.sin(ph)*Math.cos(th); p[i*3+1] = Math.abs(r*Math.cos(ph))*0.9 - 30; p[i*3+2] = r*Math.sin(ph)*Math.sin(th);
    const c = new THREE.Color().setHSL(h0 + Math.random()*hr, sat, 0.55 + Math.random()*0.4);
    col.set([c.r,c.g,c.b], i*3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(p,3)); g.setAttribute('color', new THREE.BufferAttribute(col,3));
  const m = new THREE.PointsMaterial({ size:1.4, map:GLOW, vertexColors:true, transparent:true, depthWrite:false, opacity:.8, fog:false, blending:THREE.AdditiveBlending });
  scene.add(new THREE.Points(g, m));
}
/* floor items: the overlay, zone platforms and floor words. Each opens the same extended card as a node:
   { info:{label, desc, ex}, layer, spans, spansTitle?, card (DEEP content), focus, flyDist, glow?(on) }.
   Meshes passed here show a hover tooltip and are clickable. */
const FLOOR = {}, floorTips = []; let floorTip = null;   // floorTip: id of the floor item under the cursor
function addFloorItem(id, item, ...meshes){
  FLOOR[id] = item; if (item.card) DEEP[id] = item.card;
  meshes.forEach(m => { m.userData.floor = id; floorTips.push(m); });
}
/* grid floor + zones */
{
  const grid = new THREE.GridHelper(...V.grid, '#2a3c66', '#16213a');
  grid.position.y = FLOOR_Y; grid.material.transparent = true; grid.material.opacity = .45; scene.add(grid);
  V.zones.forEach(floorZone);
}
function floorZone({ id, text, color, x, z, w, d, tx, tz, tw = Math.min(w - 1, 12), tip, spans, card }){
  const title = text.charAt(0) + text.slice(1).toLowerCase();
  const plat = new THREE.Mesh(new THREE.PlaneGeometry(w, d),
    new THREE.MeshBasicMaterial({ color, transparent:true, opacity:.045, depthWrite:false, side:THREE.DoubleSide }));
  plat.rotation.x = -Math.PI/2; plat.position.set(x, FLOOR_Y+0.02, z); scene.add(plat);
  const edge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(w, d)),
    new THREE.LineBasicMaterial({ color, transparent:true, opacity:.3 }));
  edge.rotation.x = -Math.PI/2; edge.position.copy(plat.position); scene.add(edge);
  const label = floorText(text, color, tx, tz, tw);
  if (id) addFloorItem(id, { info:{ label:title, desc:tip, ex:'' }, layer:{ name:'Zone', color }, spans, card,
    focus:new THREE.Vector3(x, 1, z), flyDist:26 + Math.max(w, d) * .9,
    glow: on => { plat.material.opacity = on ? .11 : .045; edge.material.opacity = on ? .7 : .3; } }, plat, label);
}
function floorText(text, color, x, z, w, opacity=.7){
  const c = document.createElement('canvas'); c.width = 1024; c.height = 128; const g = c.getContext('2d');
  g.font = '700 64px Inter, system-ui, sans-serif'; g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle';
  if ('letterSpacing' in g) g.letterSpacing = '10px'; g.fillText(text, 512, 64);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, w/8), new THREE.MeshBasicMaterial({ map:t, transparent:true, opacity, depthWrite:false }));
  m.rotation.x = -Math.PI/2; m.position.set(x, FLOOR_Y+0.05, z); scene.add(m); return m;
}

/* ---------------- shapes ---------------- */
function mat(color, opts={}){
  return new THREE.MeshStandardMaterial({ color, emissive:color, emissiveIntensity:opts.ei ?? .38,
    metalness:opts.metal ?? .35, roughness:opts.rough ?? .35, transparent: opts.opacity!=null, opacity: opts.opacity ?? 1,
    flatShading: !!opts.flat, side: opts.side ?? THREE.FrontSide, depthWrite: opts.depthWrite ?? true });
}
function checkShape(){
  const ck = new THREE.Shape(); ck.moveTo(-.45,.05); ck.lineTo(-.12,-.3); ck.lineTo(.5,.4); ck.lineTo(.38,.5); ck.lineTo(-.12,-.05); ck.lineTo(-.33,.18); return ck;
}
function mulberry(a){ return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const SWAY_SHAPES = new Set(['shield','user','docs','box','frame','tree','terminal','window','bolt','approve']);
function makeShape(n, color){
  const g = new THREE.Group(), s = n.size, mats = [], spin = [];
  const add = (geo, m, pos, rot, parent=g) => { const me = new THREE.Mesh(geo, m); if(pos) me.position.set(...pos); if(rot) me.rotation.set(...rot); parent.add(me); if(!mats.includes(m) && m.emissive) mats.push(m); return me; };
  const M = (o) => mat(color, o);
  const lines = (pts, opacity=.8) => g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color, transparent:true, opacity })));
  switch(n.shape){
    case 'user': { const m = M({ei:.3}); add(new THREE.SphereGeometry(s*.48, 32, 24), m, [0, s*.55, 0]); add(new THREE.CapsuleGeometry(s*.55, s*.5, 8, 24), m, [0, -s*.6, 0]); break; }
    case 'docs': { const m = M(); for(let i=0;i<4;i++) add(new THREE.BoxGeometry(s*1.1, s*1.45, .1), m, [ (i-1.5)*.32, (i-1.5)*.08, (i-1.5)*.38 ], [0, -.35, (i-1.5)*.06]);
      const lm = new THREE.MeshBasicMaterial({ color:'#ffffff', transparent:true, opacity:.55 });
      for(let k=0;k<5;k++) add(new THREE.BoxGeometry(s*.75, .06, .02), lm, [ 1.5*.32 + .02, s*.45 - k*.28 + .12, 1.5*.38 + .07 ], [0,-.35,.09]); break; }
    case 'chunk': { const m = M(); for(let x=0;x<3;x++) for(let y=0;y<3;y++) add(new THREE.BoxGeometry(s*.5, s*.5, s*.5), m, [(x-1)*s*.68, (y-1)*s*.68, 0]); break; }
    case 'icosa': { const m = M({flat:true}); add(new THREE.IcosahedronGeometry(s,0), m);
      const w = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(s*1.18,1)), new THREE.LineBasicMaterial({ color, transparent:true, opacity:.45 })); g.add(w); spin.push([w, .4]); break; }
    case 'graph': { const m = M(); const pts=[]; const rnd = mulberry(7);
      for(let i=0;i<8;i++){ const v = new THREE.Vector3(rnd()-.5, rnd()-.5, rnd()-.5).normalize().multiplyScalar(s*(.6+rnd()*.5)); pts.push(v); add(new THREE.SphereGeometry(s*(.17+rnd()*.12), 20, 16), m, [v.x,v.y,v.z]); }
      const lp=[]; for(let i=0;i<pts.length;i++) for(let j=i+1;j<pts.length;j++) if(pts[i].distanceTo(pts[j]) < s*1.35) lp.push(pts[i],pts[j]);
      lines(lp); break; }
    case 'box': { const m = M({ei:.28}); add(new THREE.BoxGeometry(s*1.6, s*1.1, s*1.1), m);
      const w = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(s*1.8, s*1.3, s*1.3)), new THREE.LineBasicMaterial({ color:'#9fd8ff', transparent:true, opacity:.6 })); g.add(w);
      const lm = new THREE.MeshBasicMaterial({ color:'#3ad7ff' }); for(let i=0;i<3;i++) add(new THREE.BoxGeometry(s*.18,s*.1,.02), lm, [-s*.5 + i*s*.3, s*.3, s*.56]); break; }
    case 'knot': { const m = M(); add(new THREE.TorusKnotGeometry(s*.62, s*.2, 120, 16, 2, 3), m); break; }
    case 'retriever': { const m = M({flat:true}); add(new THREE.OctahedronGeometry(s, 0), m);
      const r = new THREE.Mesh(new THREE.TorusGeometry(s*1.45, .07, 8, 80), new THREE.MeshBasicMaterial({ color:'#3ad7ff', transparent:true, opacity:.8 })); r.rotation.x = Math.PI/2; g.add(r);
      const r2 = new THREE.Mesh(new THREE.TorusGeometry(s*1.25, .05, 8, 80), new THREE.MeshBasicMaterial({ color:'#ffb547', transparent:true, opacity:.7 })); r2.rotation.set(Math.PI/2.6, .5, 0); g.add(r2); spin.push([r2, .9]); break; }
    case 'bars': { const m = M(); const h=[1.6,1.15,.8,.5]; h.forEach((v,i)=> add(new THREE.BoxGeometry(s*.38, s*v, s*.38), m, [(i-1.5)*s*.52, (v-1.6)*s*.5 + s*.3, 0])); break; }
    case 'dodeca': { const m = M({flat:true}); add(new THREE.DodecahedronGeometry(s, 0), m); break; }
    case 'cache': { const m = M({ei:.5}); add(new THREE.BoxGeometry(s*.8, s*.8, s*.8), m, null, [.6,.6,0]);
      g.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(s*1.5,s*1.5,s*1.5)), new THREE.LineBasicMaterial({ color, transparent:true, opacity:.8 }))); break; }
    case 'bolt': { const sh = new THREE.Shape(); sh.moveTo(.25,1.3); sh.lineTo(-.7,-.1); sh.lineTo(-.05,-.1); sh.lineTo(-.35,-1.3); sh.lineTo(.75,.25); sh.lineTo(.08,.25); sh.lineTo(.25,1.3);
      const geo = new THREE.ExtrudeGeometry(sh, { depth:.35, bevelEnabled:true, bevelSize:.06, bevelThickness:.06, bevelSegments:2 }); geo.center(); geo.scale(s,s,s); add(geo, M({ei:.65, metal:.4}));
      add(new THREE.TorusGeometry(s*1.25, .04, 8, 64), new THREE.MeshBasicMaterial({ color, transparent:true, opacity:.45 })); break; }
    case 'approve': { const m = M({ei:.3}); add(new THREE.SphereGeometry(s*.36, 32, 24), m, [-s*.42, s*.48, 0]); add(new THREE.CapsuleGeometry(s*.4, s*.38, 8, 24), m, [-s*.42, -s*.55, 0]);
      const badge = new THREE.Group(); badge.position.set(s*.62, s*.15, s*.1); g.add(badge);
      add(new THREE.TorusGeometry(s*.5, .08, 12, 48), M({ei:.75}), null, null, badge);
      add(new THREE.CircleGeometry(s*.46, 40), new THREE.MeshBasicMaterial({ color:'#0b1a14', transparent:true, opacity:.85, side:THREE.DoubleSide }), null, null, badge);
      const cg = new THREE.ExtrudeGeometry(checkShape(), { depth:.1, bevelEnabled:false }); cg.center(); cg.scale(s*.75, s*.75, s*.75);
      add(cg, new THREE.MeshBasicMaterial({ color:'#ffffff' }), [0,0,.06], null, badge); break; }
    case 'frame': { const m = M({ opacity:.18, depthWrite:false, side:THREE.DoubleSide, ei:.2 }); add(new THREE.BoxGeometry(s*1.9, s*1.3, s*.9), m);
      g.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(s*1.9, s*1.3, s*.9)), new THREE.LineBasicMaterial({ color })));
      V.frameBands.forEach((c,i)=>{ add(new THREE.BoxGeometry(s*(1.5 - (i%3)*.25), s*.12, s*.5), mat(c,{ei:.6}), [ -((i%3)*.25)*s*.5, s*.48 - i*s*.19, 0]); }); break; }
    case 'memory': { const m = M({ei:.45}); add(new THREE.TorusGeometry(s*.55, s*.13, 16, 64), m);
      add(new THREE.TorusGeometry(s*1.05, s*.1, 16, 80), M({ei:.3, opacity:.85}));
      add(new THREE.SphereGeometry(s*.2, 20, 16), mat('#ffffff',{ei:1})); break; }
    case 'db': { const m = M({metal:.5}); for(let i=0;i<4;i++) add(new THREE.CylinderGeometry(s, s, s*.42, 48), m, [0, (i-1.5)*s*.55, 0]);
      const rm = new THREE.MeshBasicMaterial({ color:'#ffffff', transparent:true, opacity:.6 });
      for(let i=0;i<4;i++) add(new THREE.TorusGeometry(s*1.005, .035, 6, 64), rm, [0,(i-1.5)*s*.55 + s*.21,0],[Math.PI/2,0,0]); break; }
    case 'llm': {
      add(new THREE.SphereGeometry(s*.42, 48, 32), new THREE.MeshStandardMaterial({ color:'#ffffff', emissive:color, emissiveIntensity:1.3 }));
      g.userData.core = g.children[g.children.length-1];
      add(new THREE.SphereGeometry(s, 64, 48), new THREE.MeshPhysicalMaterial({ color, emissive:color, emissiveIntensity:.12, transparent:true, opacity:.14, roughness:.1, metalness:0, depthWrite:false, side:THREE.DoubleSide }));
      const layerMat = new THREE.MeshStandardMaterial({ color, emissive:color, emissiveIntensity:.55, metalness:.2, roughness:.3 });
      const L = 7; for(let i=0;i<L;i++){ const y = (i-(L-1)/2) * s*.24; const r = Math.sqrt(Math.max(0.01, s*s*.86 - y*y));
        add(new THREE.TorusGeometry(r, .06 + (i%2)*.03, 10, 96), layerMat, [0,y,0], [Math.PI/2,0,0]); }
      const om = new THREE.MeshBasicMaterial({ color:'#ffd6f4', transparent:true, opacity:.7 });
      const piv1 = new THREE.Group(), piv2 = new THREE.Group(); g.add(piv1, piv2);
      add(new THREE.TorusGeometry(s*1.32, .045, 8, 128), om, null, [1.1, .3, 0], piv1);
      add(new THREE.TorusGeometry(s*1.5, .035, 8, 128), om, null, [1.9, -.5, 0], piv2);
      spin.push([piv1, .5], [piv2, -.35]); break; }
    case 'tree': { const m = M({ei:.45}); const P = [[0,1],[-.85,.05],[0,.05],[.85,.05],[-1.15,-.9],[-.55,-.9],[.55,-.9],[1.15,-.9]], E = [[0,1],[0,2],[0,3],[1,4],[1,5],[3,6],[3,7]];
      P.forEach(([x,y],i) => add(new THREE.BoxGeometry(i ? s*.36 : s*.5, i ? s*.22 : s*.3, s*.3), i ? m : mat('#ffffff',{ei:.8}), [x*s, y*s, 0]));
      lines(E.flatMap(([a,b]) => [new THREE.Vector3(P[a][0]*s, P[a][1]*s, 0), new THREE.Vector3(P[b][0]*s, P[b][1]*s, 0)])); break; }
    case 'reflect': { add(new THREE.OctahedronGeometry(s*.55, 0), M({flat:true, ei:.55}));
      const am = M({ei:.5}); const piv = new THREE.Group(); g.add(piv); const A = Math.PI*1.55;
      add(new THREE.TorusGeometry(s*1.05, .09, 10, 64, A), am, null, null, piv);
      add(new THREE.ConeGeometry(.28, .6, 16), am, [Math.cos(A)*s*1.05, Math.sin(A)*s*1.05, 0], [0, 0, A], piv);
      spin.push([piv, 1.1]); break; }
    case 'gear': { const m = M({metal:.6}); add(new THREE.CylinderGeometry(s*.85, s*.85, s*.4, 40), m, null, [Math.PI/2,0,0]);
      for(let i=0;i<10;i++){ const a = i/10*Math.PI*2; add(new THREE.BoxGeometry(s*.32, s*.32, s*.38), m, [Math.cos(a)*s*.95, Math.sin(a)*s*.95, 0], [0,0,a]); }
      add(new THREE.CylinderGeometry(s*.32, s*.32, s*.5, 24), new THREE.MeshBasicMaterial({ color:'#0b0f1c' }), null, [Math.PI/2,0,0]); break; }
    case 'hub': { const m = M({metal:.5, ei:.45}); add(new THREE.SphereGeometry(s*.45, 32, 24), m); const sm = M({ei:.3}); const up = new THREE.Vector3(0,1,0);
      [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]].forEach(d => { const v = new THREE.Vector3(...d);
        add(new THREE.CylinderGeometry(.07, .07, s*.9, 8), sm, [v.x*s*.45, v.y*s*.45, v.z*s*.45]).quaternion.setFromUnitVectors(up, v);
        add(new THREE.BoxGeometry(s*.36, s*.22, s*.36), m, [v.x*s*.95, v.y*s*.95, v.z*s*.95]).quaternion.setFromUnitVectors(up, v); }); break; }
    case 'terminal': { add(new THREE.BoxGeometry(s*1.8, s*1.25, s*.25), M({ei:.25, metal:.4}));
      add(new THREE.BoxGeometry(s*1.62, s*1.07, .02), new THREE.MeshBasicMaterial({ color:'#0b0f1c' }), [0, 0, s*.13]);
      const tm = new THREE.MeshBasicMaterial({ color:'#7dffb0' }), am = new THREE.MeshBasicMaterial({ color });
      add(new THREE.BoxGeometry(s*.2, .07, .02), am, [-s*.66, s*.33, s*.15], [0,0,-.6]); add(new THREE.BoxGeometry(s*.2, .07, .02), am, [-s*.66, s*.23, s*.15], [0,0,.6]);
      [[.85,.28],[.6,.06],[1.05,-.16],[.4,-.38]].forEach(([w,y],i) => add(new THREE.BoxGeometry(s*w, .07, .02), i%2 ? am : tm, [-s*.5 + s*w/2, s*y, s*.15]));
      add(new THREE.BoxGeometry(s*.1, s*.16, .02), new THREE.MeshBasicMaterial({ color:'#ffffff' }), [-s*.03, -s*.38, s*.15]); break; }
    case 'window': { add(new THREE.BoxGeometry(s*1.9, s*1.35, s*.12), M({ei:.25}));
      add(new THREE.BoxGeometry(s*1.76, s*1.0, .02), new THREE.MeshBasicMaterial({ color:'#0b0f1c' }), [0, -s*.1, s*.07]);
      ['#ff5f57','#febc2e','#28c840'].forEach((c,i) => add(new THREE.CircleGeometry(s*.06, 16), new THREE.MeshBasicMaterial({ color:c }), [-s*.78 + i*s*.17, s*.55, s*.07]));
      const bm = new THREE.MeshBasicMaterial({ color, transparent:true, opacity:.8 });
      add(new THREE.BoxGeometry(s*1.4, s*.12, .02), bm, [0, s*.25, s*.085]); add(new THREE.BoxGeometry(s*.6, s*.42, .02), bm, [-s*.45, -s*.15, s*.085]);
      add(new THREE.BoxGeometry(s*.65, s*.1, .02), bm, [s*.35, -s*.05, s*.085]); add(new THREE.BoxGeometry(s*.5, s*.1, .02), bm, [s*.28, -s*.25, s*.085]);
      add(new THREE.ConeGeometry(s*.13, s*.36, 3), new THREE.MeshBasicMaterial({ color:'#ffffff' }), [s*.55, -s*.38, s*.2], [0, 0, .5]); break; }
    case 'apis': { const m = M(); add(new THREE.SphereGeometry(s*.3, 24, 16), mat('#ffffff',{ei:.9})); const lp = [];
      for (let i=0;i<5;i++){ const a = i/5*Math.PI*2 + Math.PI/2, p = [Math.cos(a)*s*.95, Math.sin(a)*s*.95, 0];
        add(new THREE.BoxGeometry(s*.42, s*.42, s*.42), m, p, [a, a*.5, 0]); lp.push(new THREE.Vector3(0,0,0), new THREE.Vector3(...p)); }
      lines(lp); break; }
    case 'agents': { const m = M({ei:.35}), rm = M({ei:.7}); const lp = [];
      for (let i=0;i<3;i++){ const a = i/3*Math.PI*2 + Math.PI/2, p = [Math.cos(a)*s*.85, Math.sin(a)*s*.7, 0];
        add(new THREE.SphereGeometry(s*.32, 24, 16), m, p); add(new THREE.TorusGeometry(s*.5, .05, 8, 48), rm, p, [Math.PI/2.4, 0, 0]);
        lp.push(new THREE.Vector3(0,0,0), new THREE.Vector3(...p)); }
      add(new THREE.SphereGeometry(s*.15, 16, 12), mat('#ffffff',{ei:1})); lines(lp, .6); break; }
    case 'a2a': { const m = M({ei:.45, metal:.5}); add(new THREE.TorusGeometry(s*.6, s*.14, 16, 64), m, [-s*.42, 0, 0]);
      add(new THREE.TorusGeometry(s*.6, s*.14, 16, 64), m, [s*.42, 0, 0], [Math.PI/2, 0, 0]); break; }
    case 'shield': { const sh = new THREE.Shape(); sh.moveTo(0,1.2); sh.quadraticCurveTo(.6,1.02,1,1); sh.lineTo(1,.15); sh.quadraticCurveTo(.9,-.75,0,-1.3); sh.quadraticCurveTo(-.9,-.75,-1,.15); sh.lineTo(-1,1); sh.quadraticCurveTo(-.6,1.02,0,1.2);
      const geo = new THREE.ExtrudeGeometry(sh, { depth:.3, bevelEnabled:true, bevelSize:.08, bevelThickness:.08, bevelSegments:3 }); geo.center(); geo.scale(s,s,s); add(geo, M({metal:.5}));
      const cg = new THREE.ExtrudeGeometry(checkShape(), { depth:.1, bevelEnabled:false }); cg.scale(s,s,s); const cm = new THREE.MeshBasicMaterial({ color:'#ffffff' });
      add(cg, cm, [0,0,s*.24]); add(cg, cm, [0,0,-s*.34]); break; }
    case 'eye': { const m = M({ei:.5}); add(new THREE.TorusGeometry(s, .12, 12, 80), m, null, [Math.PI/2.2,0,0]);
      add(new THREE.SphereGeometry(s*.42, 32, 24), mat('#ffffff',{ei:.9})); add(new THREE.TorusGeometry(s*.62, .05, 8, 64), m, null, [Math.PI/2.2,0,0]);
      for(let i=0;i<12;i++){ const a=i/12*Math.PI*2; add(new THREE.BoxGeometry(.08,.08,s*.3), m, [Math.cos(a)*s*1.25, 0, Math.sin(a)*s*1.25]).lookAt(0,0,0); } break; }
  }
  return { group:g, mats, spin };
}
/* ---------------- 3D logo meshes (SVG → extruded geometry) ---------------- */
const LOGO_SIZE = 1.2;
const logoGeoCache = {};          // brandKey -> { parts:[{geo,color}], kind:'extrude'|'tile', stats } (geometry shared per brand)
const logoReport = { extrude:[], tile:[], notes:{} };
function resolveSvgPaints(svgText){
  // SVGLoader has no gradient support: replace url(#gradient) paints with a representative stop colour.
  const doc = new DOMParser().parseFromString(svgText, 'image/svg+xml');
  const byId = id => doc.getElementById(id);
  const stopColor = (grad, depth=0) => {
    if (!grad || depth > 3) return null;
    const stops = [...grad.querySelectorAll('stop')];
    if (!stops.length){ const h = grad.getAttribute('href') || grad.getAttribute('xlink:href'); if (h) return stopColor(byId(h.slice(1)), depth+1); return null; }
    const s = stops[Math.floor((stops.length - 1) / 2)];
    let c = s.getAttribute('stop-color'); const st = s.getAttribute('style') || '';
    const m = st.match(/stop-color\s*:\s*([^;]+)/); if (m) c = m[1].trim();
    return c || null;
  };
  let replaced = 0;
  const fix = v => v && v.replace(/url\(\s*['"]?#([^)'"]+)['"]?\s*\)/g, (_, id) => { replaced++; return stopColor(byId(id)) || '#888888'; });
  doc.querySelectorAll('*').forEach(el => {
    for (const a of ['fill', 'stroke']) { const v = el.getAttribute(a); if (v && v.includes('url(')) el.setAttribute(a, fix(v)); }
    const st = el.getAttribute('style'); if (st && st.includes('url(')) el.setAttribute('style', fix(st));
  });
  doc.querySelectorAll('style').forEach(s => { if (s.textContent.includes('url(')) s.textContent = fix(s.textContent); });
  // clip paths / masks are not supported by SVGLoader: drop their contents so they don't render as filled shapes
  doc.querySelectorAll('clipPath, mask').forEach(n => n.remove());
  doc.querySelectorAll('[clip-path],[mask]').forEach(n => { n.removeAttribute('clip-path'); n.removeAttribute('mask'); });
  return { text: new XMLSerializer().serializeToString(doc), replaced };
}
function buildLogoGeometry(brandKey){
  if (logoGeoCache[brandKey]) return logoGeoCache[brandKey];
  let entry = null;
  try {
    const { text, replaced } = resolveSvgPaints(BRANDS[brandKey].svg);
    const data = new SVGLoader().parse(text);
    const pieces = []; let strokeOnly = 0;
    data.paths.forEach(p => {
      const st = p.userData.style || {};
      if (!st.fill || st.fill === 'none'){ if (st.stroke && st.stroke !== 'none') strokeOnly++; return; }
      if (st.fillOpacity !== undefined && st.fillOpacity < 0.05) return;
      const shapes = SVGLoader.createShapes(p); if (!shapes.length) return;
      pieces.push({ shapes, color: p.color.clone() });
    });
    if (!pieces.length) throw new Error(strokeOnly ? 'stroke-only paths' : 'no filled paths');
    const bb = new THREE.Box2();
    pieces.forEach(pc => pc.shapes.forEach(s => s.getPoints(8).forEach(v => bb.expandByPoint(v))));
    const sz = Math.max(bb.max.x - bb.min.x, bb.max.y - bb.min.y);
    if (!(sz > 0)) throw new Error('empty bounds');
    const depth = sz * 0.15, bevel = sz * 0.012;
    const byColor = new Map();
    pieces.forEach((pc, i) => {
      const g = new THREE.ExtrudeGeometry(pc.shapes, { depth, bevelEnabled:true, bevelThickness:bevel, bevelSize:bevel, bevelOffset:-bevel, bevelSegments:2, curveSegments:6 });
      g.translate(0, 0, -i * sz * 0.02);         // later (painted-on-top) paths sit slightly in front
      const key = pc.color.getHexString(); if (!byColor.has(key)) byColor.set(key, { color: pc.color, geos: [] });
      byColor.get(key).geos.push(g.index ? g.toNonIndexed() : g);
    });
    const parts = []; const all = new THREE.Box3();
    byColor.forEach(({ color, geos }) => {
      const g = geos.length > 1 ? mergeGeometries(geos, false) : geos[0];
      g.rotateX(Math.PI);                         // SVG y-down → y-up without mirroring (front cap faces +z)
      g.computeBoundingBox(); all.union(g.boundingBox); parts.push({ geo: g, color });
    });
    const c = all.getCenter(new THREE.Vector3()), s = LOGO_SIZE / sz;
    let tris = 0;
    parts.forEach(p => { p.geo.translate(-c.x, -c.y, -c.z); p.geo.scale(s, s, s); p.geo.computeVertexNormals(); tris += p.geo.attributes.position.count / 3;
      if (!p.geo.attributes.position.count) throw new Error('empty geometry'); });
    entry = { kind:'extrude', parts, stats:{ tris:Math.round(tris), parts:parts.length, gradientsReplaced:replaced, strokeOnlySkipped:strokeOnly } };
    logoReport.extrude.push(brandKey); logoReport.notes[brandKey] = entry.stats;
  } catch (err) {
    entry = { kind:'tile', reason: String(err.message || err), stats:{ tris: 0 } };
    logoReport.tile.push(brandKey); logoReport.notes[brandKey] = { fallback: entry.reason };
  }
  logoGeoCache[brandKey] = entry; return entry;
}
// fallback: thin rounded tile with the SVG drawn on a CanvasTexture
const tileGeo = (() => { const w = LOGO_SIZE * 1.05, r = .18, s = new THREE.Shape();
  s.moveTo(-w/2 + r, -w/2); s.lineTo(w/2 - r, -w/2); s.quadraticCurveTo(w/2, -w/2, w/2, -w/2 + r); s.lineTo(w/2, w/2 - r); s.quadraticCurveTo(w/2, w/2, w/2 - r, w/2);
  s.lineTo(-w/2 + r, w/2); s.quadraticCurveTo(-w/2, w/2, -w/2, w/2 - r); s.lineTo(-w/2, -w/2 + r); s.quadraticCurveTo(-w/2, -w/2, -w/2 + r, -w/2);
  const g = new THREE.ExtrudeGeometry(s, { depth:.1, bevelEnabled:true, bevelThickness:.03, bevelSize:.03, bevelSegments:2, curveSegments:6 }); g.center(); return g; })();
const tileTex = {};
function tileTexture(brandKey){
  if (tileTex[brandKey]) return tileTex[brandKey];
  const cv = document.createElement('canvas'); cv.width = cv.height = 256; const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
  const img = new Image(); img.onload = () => { const g = cv.getContext('2d'); g.drawImage(img, 32, 32, 192, 192); t.needsUpdate = true; }; img.src = BRANDS[brandKey].uri;
  return tileTex[brandKey] = t;
}
function makeLogoMesh(brandKey){
  const E = buildLogoGeometry(brandKey); const g = new THREE.Group(); const mats = [];
  if (E.kind === 'extrude'){
    E.parts.forEach(p => { const m = new THREE.MeshStandardMaterial({ color:p.color, emissive:p.color, emissiveIntensity:.4, metalness:.25, roughness:.38 });
      m.userData.base = p.color.clone(); mats.push(m); g.add(new THREE.Mesh(p.geo, m)); });
  } else {
    const m = new THREE.MeshStandardMaterial({ color:'#1a2236', emissive:'#1a2236', emissiveIntensity:.4, metalness:.3, roughness:.5 }); m.userData.base = m.color.clone(); mats.push(m);
    g.add(new THREE.Mesh(tileGeo, m));
    const fm = new THREE.MeshStandardMaterial({ map:tileTexture(brandKey), transparent:true, emissive:'#ffffff', emissiveMap:tileTexture(brandKey), emissiveIntensity:.4, roughness:.6 });
    fm.userData.base = new THREE.Color('#ffffff'); mats.push(fm);
    const f = new THREE.Mesh(new THREE.PlaneGeometry(LOGO_SIZE*.9, LOGO_SIZE*.9), fm); f.position.z = .085; g.add(f);
  }
  return { group:g, mats, kind:E.kind };
}

/* ---------------- build nodes ---------------- */
const nodeMap = {}; const hitMeshes = [];
NODES.forEach((n, i) => {
  const color = new THREE.Color(LAYERS[n.layer].color);
  const root = new THREE.Group(); root.position.set(...n.pos); scene.add(root);
  const holder = new THREE.Group(); root.add(holder);
  const { group, mats, spin } = makeShape(n, color);
  holder.add(group);
  mats.forEach(m => m.userData.baseEI = m.emissiveIntensity);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map:GLOW, color, transparent:true, opacity: n.big ? .28 : .22, depthWrite:false, blending:THREE.AdditiveBlending }));
  halo.scale.setScalar(n.size * (n.big ? 4.2 : 3.4)); root.add(halo);
  const hit = new THREE.Mesh(new THREE.SphereGeometry(n.size*1.45, 12, 8), new THREE.MeshBasicMaterial({ visible:false }));
  hit.userData.id = n.id; root.add(hit); hitMeshes.push(hit);
  const ring = new THREE.Mesh(new THREE.RingGeometry(n.size*1.15, n.size*1.32, 64),
    new THREE.MeshBasicMaterial({ color, transparent:true, opacity:.4, side:THREE.DoubleSide, depthWrite:false }));
  ring.rotation.x = -Math.PI/2; ring.position.set(n.pos[0], FLOOR_Y+0.03, n.pos[2]); scene.add(ring);
  const stem = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(n.pos[0], FLOOR_Y, n.pos[2]), new THREE.Vector3(n.pos[0], n.pos[1]-n.size, n.pos[2])]),
    new THREE.LineBasicMaterial({ color, transparent:true, opacity:.18 })); scene.add(stem);
  const d = document.createElement('div'); d.className = 'nlabel' + (n.big ? ' big':''); d.style.color = LAYERS[n.layer].color;
  d.innerHTML = `<span class="nm"><i></i><span style="color:#e6edf7">${n.label}${n.optional ? ' <span style="opacity:.55;font-weight:500">(optional)</span>' : ''}</span></span>`;
  d.addEventListener('pointerenter', () => hoverNode(n.id)); d.addEventListener('pointerleave', () => hoverNode(null));
  d.addEventListener('click', (e) => { e.stopPropagation(); pinNode(n.id); });
  const lab = new CSS2DObject(d);
  if (n.big){ lab.position.set(0, -n.size * 1.25, 0); lab.center.set(.5, 0); } else { lab.position.set(0, n.size * 1.55 + .5 + (sceneLogos(n.id).length ? 1.45 : 0), 0); lab.center.set(.5, 1); }
  root.add(lab);
  nodeMap[n.id] = { n, root, holder, group, mats, spin, halo, ring, labelEl:d, color, phase:i*.7, hl:0, hlTarget:0, dimT:0, dimTarget:0 };
});
const llmNode = nodeMap.llm; llmLight.position.copy(llmNode.root.position);

/* ---------------- floor overlay: a clickable floor region with its own card (orchestration layer / agent loop) ---------------- */
const ov = { target:0, v:0, ...overlay.build() };
addFloorItem(OV, { info:overlay.info, layer:overlay.layer, spans:overlay.spans, focus:overlay.focus, flyDist:overlay.flyDist });
{
  const d = document.createElement('div'); d.className = 'orchlabel'; d.innerHTML = overlay.label;
  d.addEventListener('pointerenter', () => hoverNode(OV)); d.addEventListener('pointerleave', () => hoverNode(null));
  d.addEventListener('click', e => { e.stopPropagation(); pinNode(OV); });
  const o = new CSS2DObject(d); o.position.copy(overlay.labelPos); scene.add(o); ov.label = d;
}

/* floating 3D logo badges: per component in a hovering arc, Y-billboarded toward the camera */
const badges = [], badgeHits = [];
const BADGE_SPACING = 1.5; let logoYawBias = 0;   // extra yaw used only by the verification close-up
function addBadges(owner, center, yOff, flank){
  const ks = sceneLogos(owner); const n = ks.length;
  ks.forEach((k, i) => {
    const xl = flank ? 0 : (i - (n - 1) / 2) * BADGE_SPACING;
    const zl = flank ? 0 : -.35 - .14 * xl * xl;
    const m = makeLogoMesh(TECHINFO[k].logo);
    const hit = new THREE.Mesh(new THREE.BoxGeometry(LOGO_SIZE * 1.15, LOGO_SIZE * 1.15, .5), new THREE.MeshBasicMaterial({ visible:false }));
    m.group.add(hit); scene.add(m.group);
    m.mats.forEach(mat => { mat.transparent = true; });
    const b = { k, owner, center, yOff, i, n, xl, zl, orbit: !!flank, group:m.group, mats:m.mats, kind:m.kind, phase: Math.random() * 6.28, hs:1, hsT:1, hit:false, op:1 };
    hit.userData.badge = b; badgeHits.push(hit); badges.push(b);
  });
}
for (const id in nodeMap){ const o = nodeMap[id];
  // LLM: provider logos evenly spaced on an orbit around the sphere; others: hovering arc above the node
  if (o.n.big) addBadges(id, o.root.position, 0, true); else addBadges(id, o.root.position, o.n.size * 1.15 + 1.05); }
addBadges(OV, overlay.labelPos, 1.7);
const _yawV = new THREE.Vector3(); let orbitPhase = 0, lastBT = 0, orbitFrozen = false;
const ORBIT_R = V.orbitR;
function updateBadges(t){
  const dt = Math.min(.1, t - lastBT); lastBT = t; if (!hoverBadge && !orbitFrozen) orbitPhase += dt * .1;   // orbit pauses while a logo is hovered
  for (const b of badges){
    if (b.orbit){
      const a = orbitPhase + b.i / b.n * Math.PI * 2;
      b.group.position.set(b.center.x + Math.cos(a) * ORBIT_R, b.center.y + Math.sin(a) * 1.1 + Math.sin(t * 1.3 + b.phase) * .12, b.center.z + Math.sin(a) * ORBIT_R);
      _yawV.copy(camera.position).sub(b.group.position); const yw = Math.atan2(_yawV.x, _yawV.z);
      b.group.rotation.set(-.18, yw + logoYawBias + Math.sin(t * .55 + b.phase) * .42, 0, 'YXZ');
    } else {
      _yawV.copy(camera.position).sub(b.center); const yaw = Math.atan2(_yawV.x, _yawV.z);
      const rx = Math.cos(yaw), rz = -Math.sin(yaw), fx = Math.sin(yaw), fz = Math.cos(yaw);
      const bob = Math.sin(t * 1.3 + b.phase) * .12;
      b.group.position.set(b.center.x + rx * b.xl + fx * b.zl, b.center.y + b.yOff + bob, b.center.z + rz * b.xl + fz * b.zl);
      b.group.rotation.set(-.18, yaw + logoYawBias + Math.sin(t * .55 + b.phase) * .42 - b.xl * .12, 0, 'YXZ');  // billboard + gentle spin so the depth shows
    }
    // search: matching logos pulse continuously (swell + glow), the others fade almost out
    const pulse = searchHits && b.hit ? Math.sin(t * 4.5 + b.phase) * .5 + .5 : 0;
    b.op += ((searchHits && !b.hit ? .12 : 1) - b.op) * .15;
    b.hs += (b.hsT - b.hs) * .2; b.group.scale.setScalar(b.hs * (1 + pulse * .3));
    // play emphasis: the active component's logos brighten, others dim
    const o = nodeMap[b.owner];
    const dimT = b.owner === OV ? (player.active ? 1 : 0) : o.dimT, hl = b.owner === OV ? ov.v : o.hl;
    const dim = 1 - dimT * .75;
    b.mats.forEach(m => { m.emissiveIntensity = .4 * dim + hl * .55 + (b.hsT > 1 ? .25 : 0) + pulse * 1.2; m.color.copy(m.userData.base).multiplyScalar(.35 + .65 * dim);
      m.opacity = b.op; m.depthWrite = b.op > .98; });
  }
}

/* ---------------- links + particles ---------------- */
const links = [];
function curveBetween(a, b, lift=.18){
  const pa = nodeMap[a].root.position.clone(), pb = nodeMap[b].root.position.clone();
  const dist = pa.distanceTo(pb);
  const mid = pa.clone().add(pb).multiplyScalar(.5); mid.y += Math.max(2.2, dist * lift);
  return new THREE.QuadraticBezierCurve3(pa, mid, pb);
}
LINKS.forEach(([a, b, flow, opt={}]) => {
  const curve = curveBetween(a, b, opt.lift ?? .18);
  if (flow === 'shared'){
    const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(40));
    const line = new THREE.Line(geo, new THREE.LineDashedMaterial({ color:'#c7d3ea', dashSize:.5, gapSize:.4, transparent:true, opacity:.35 }));
    line.computeLineDistances(); scene.add(line); links.push({ a, b, flow, curve, line, tube:null, pts:null }); return;
  }
  const F = FLOWS[flow]; const color = new THREE.Color(F.color);
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, flow==='ops' ? .025 : .045, 6, false),
    new THREE.MeshBasicMaterial({ color, transparent:true, opacity: flow==='ops' ? .18 : .3, depthWrite:false }));
  scene.add(tube);
  const len = curve.getLength(); const count = Math.max(3, Math.round(len / (flow==='ops' ? 6 : 2.6)));
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count*3), 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color, size: flow==='ops' ? .55 : .85, map:GLOW, transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, opacity:.95 }));
  scene.add(pts);
  const offsets = Array.from({length:count}, (_, i) => i / count);
  links.push({ a, b, flow, curve, tube, pts, offsets, speed: F.speed * (14 / Math.max(8, len)), bidir: !!opt.bidir });
});
const tmpV = new THREE.Vector3();
function updateParticles(t){
  for (const L of links){
    if (!L.pts) continue;
    const arr = L.pts.geometry.attributes.position.array;
    for (let i=0;i<L.offsets.length;i++){
      let u = (L.offsets[i] + t * L.speed) % 1;
      if (L.bidir && i % 2) u = 1 - u;
      L.curve.getPoint(u, tmpV); arr[i*3] = tmpV.x; arr[i*3+1] = tmpV.y; arr[i*3+2] = tmpV.z;
    }
    L.pts.geometry.attributes.position.needsUpdate = true;
  }
}

/* ---------------- legend ---------------- */
$('lg-layers').innerHTML = Object.values(LAYERS).map(l => `<div class="lg"><span class="dot" style="background:${l.color};color:${l.color}"></span>${l.name}</div>`).join('');
$('lg-flows').innerHTML = [...V.legendLead.map(([name, color]) => ({ name, color })), ...Object.values(FLOWS)].map(f => `<div class="lg"><span class="flow" style="background:${f.color};color:${f.color}"></span>${f.name}</div>`).join('')
  + `<div class="lg"><span class="flow" style="background:repeating-linear-gradient(90deg,#c7d3ea 0 4px,transparent 4px 7px)"></span>${V.sharedLabel}</div>`;

/* ---------------- info panel (hover) ---------------- */
const info = $('info');
let pinned = null, hovered = null, hoverSoft = false;
const nodeInfo = id => FLOOR[id]?.info ?? nodeMap[id].n;
const layerOf = id => FLOOR[id]?.layer ?? LAYERS[nodeMap[id].n.layer];
function connectionsOf(id){
  if (FLOOR[id]) return FLOOR[id].spans;
  const out = []; links.forEach(l => { if (l.a === id) out.push(l.b); else if (l.b === id) out.push(l.a); });
  return [...new Set(out)];
}
function showInfo(id){
  if (!id){ info.classList.remove('show'); return; }
  const n = nodeInfo(id), L = layerOf(id);
  const chip = $('info-chip'); chip.style.color = L.color; chip.innerHTML = `<span class="dot" style="background:${L.color};width:7px;height:7px"></span>${L.name}`;
  $('info-title').textContent = n.label + (n.optional ? ' (optional)' : '');
  $('info-desc').textContent = n.desc;
  const conn = connectionsOf(id).map(c => nodeMap[c].n.label);
  $('info-ex').innerHTML = FLOOR[id] ? n.ex : `${n.ex}<br><b>Connected to:</b> ${conn.join(' · ')}`;
  const T = TECH[id]; const st = $('info-stack'); st.style.display = T ? '' : 'none';
  if (T) $('info-chips').innerHTML = T.list.map(([k, nm]) => !TECHINFO[k].logo
    ? `<span class="tchip pill" title="No official logo embedded">${nm}</span>`
    : `<span class="tchip"><img alt="" src="${BRANDS[TECHINFO[k].logo].uri}">${nm}</span>`).join('');
  info.classList.add('show');
}
function syncAutoRotate(){ controls.autoRotate = autoRotateWanted && !(hovered && !hoverSoft) && !hoverBadge; }
function hoverNode(id, soft=false){
  if (player.active) return;
  hoverSoft = soft; hovered = id; root.style.cursor = id ? 'pointer' : '';
  syncAutoRotate();   // pause rotation while pointing at something
  showInfo(cardOpen ? null : id);
  refreshHighlights();
}
function pinNode(id){ if (player.active) return; if (!id){ closeCard(); return; } openNodeCard(id); }
$('info-close').onclick = () => { hovered = null; showInfo(null); refreshHighlights(); };

/* ---------------- extended cards (click) ---------------- */
const card = $('card'), cardBody = $('card-body');
let cardOpen = false, cardHist = [], cardCur = null;
const esc = t => String(t).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function setChip(L){ const c = $('card-chip'); c.style.color = L.color; c.innerHTML = `<span class="dot" style="background:${L.color};width:7px;height:7px"></span>${L.name}`; }
function techTile(k, nm){
  const t = TECHINFO[k];
  return `<div class="tt" data-tech="${k}"><span class="lg2">${logoImg(k)}</span><div><div class="nm2"><a href="${t.url}" target="_blank" rel="noopener noreferrer">${esc(nm || t.name)}</a></div><div class="ds">${esc(t.short)}</div></div></div>`;
}
const nodeChip = c => { const L = layerOf(c); return `<button class="cchip" data-node="${c}" style="color:${L.color}"><i></i><span style="color:#dbe4f3">${esc(nodeInfo(c).label)}</span></button>`; };
function showCard(kind, key, push){
  if (push && cardCur && !(cardCur[0] === kind && cardCur[1] === key)) cardHist.push(cardCur);
  cardCur = [kind, key]; cardOpen = true; showInfo(null);
  $('card-back').style.display = cardHist.length ? '' : 'none';
  card.classList.add('show'); card.scrollTop = 0;
}
function openNodeCard(id, opts={}){
  if (player.active) return;
  const n = nodeInfo(id), D = DEEP[id], T = TECH[id];
  setChip(layerOf(id));
  cardBody.innerHTML = `
    <h2 class="card-title">${esc(n.label)}${n.optional ? ' <span style="font-size:13px;color:var(--muted);font-weight:500">(optional)</span>' : ''}</h2>
    <p class="lead">${esc(D.deep)}</p>
    ${D.link ? `<a class="golink" href="${options.routes[D.link.route]}" data-route="${D.link.route}">${esc(D.link.text)}</a>` : ''}
    <h4>${V.conceptsTitle}</h4>
    <dl class="kc">${D.concepts.map(([a,b]) => `<dt>${esc(a)}</dt><dd>${esc(b)}</dd>`).join('')}</dl>
    <h4>Inputs → outputs</h4>
    <div class="io"><div><b>Input</b>${esc(D.inp)}</div><div><b>Output</b>${esc(D.out)}</div></div>
    <h4>Pitfalls &amp; tips</h4>
    <ul class="tips">${D.tips.map(t => `<li>${esc(t)}</li>`).join('')}</ul>
    ${T ? `<h4>Related technologies</h4><div class="tgrid">${T.list.map(([k, nm]) => techTile(k, nm)).join('')}</div>` : ''}
    <h4>${FLOOR[id] ? FLOOR[id].spansTitle ?? 'Spans these components' : 'Connects to'}</h4>
    <div class="cchips">${connectionsOf(id).map(nodeChip).join('')}</div>
    <div class="note">Names link to official sites (opens a new tab). Click a technology tile for its own card.</div>`;
  pinned = id; showCard('node', id, opts.push !== false); refreshHighlights();
  if (opts.fly) flyTo(id);
}
function openTechCard(k, opts={}){
  if (player.active) return;
  const t = TECHINFO[k]; if (!t) return;
  setChip({ name:'Technology', color:'#9fd8ff' });
  const usedIn = Object.keys(TECH).filter(id => TECH[id].list.some(([kk]) => kk === k));
  const alts = Object.keys(TECHINFO).filter(o => o !== k && TECHINFO[o].cat === t.cat);
  cardBody.innerHTML = `
    <div class="thead"><span class="big">${logoImg(k)}</span><div><h2 class="card-title">${esc(t.name)}</h2>
      <div class="tags"><span class="tag cat">${esc(t.cat)}</span>${t.lic ? `<span class="tag">${esc(t.lic)}</span>` : ''}</div></div></div>
    <p class="lead" style="margin-top:12px">${esc(t.what)}</p>
    <a class="golink" href="${t.url}" target="_blank" rel="noopener noreferrer">Official site ↗ <span style="font-weight:500;opacity:.7">${esc(t.url.replace(/^https?:\/\//,''))}</span></a>
    ${usedIn.length ? `<h4>Used for</h4><div class="cchips">${usedIn.map(nodeChip).join('')}</div>` : ''}
    ${alts.length ? `<h4>Alternatives · ${esc(t.cat)}</h4><div class="alts">${alts.map(o => `<div class="alt" data-tech="${o}" title="${esc(TECHINFO[o].short)}"><span class="lg2">${logoImg(o)}</span>${esc(TECHINFO[o].name)}</div>`).join('')}</div>` : ''}
    ${!t.logo ? '<div class="note">No official logo is embedded for this project, so it is shown as a text tile.</div>' : ''}`;
  showCard('tech', k, opts.push !== false);
}
function closeCard(){
  if (!cardOpen) return;
  cardOpen = false; card.classList.remove('show'); cardHist = []; cardCur = null; pinned = null; refreshHighlights();
}
card.addEventListener('click', e => {
  // links to the other view navigate within the app; external links open normally
  const route = e.target.closest('a[data-route]'); if (route){ e.preventDefault(); options.navigate(options.routes[route.dataset.route]); return; }
  if (e.target.closest('a')) return;
  const n = e.target.closest('[data-node]'); if (n){ openNodeCard(n.dataset.node, { fly:true }); return; }
  const t = e.target.closest('[data-tech]'); if (t){ openTechCard(t.dataset.tech); return; }
});
$('card-close').onclick = closeCard;
$('card-back').onclick = () => { const prev = cardHist.pop(); if (!prev) return; cardCur = null;
  prev[0] === 'node' ? openNodeCard(prev[1], { push:false }) : openTechCard(prev[1], { push:false }); };
on(document, 'keydown', e => { if (e.key === 'Escape') closeCard(); });
function flyTo(id){
  const p = FLOOR[id] ? FLOOR[id].focus.clone() : nodeMap[id].root.position.clone();
  const dir = camera.position.clone().sub(controls.target).normalize();
  const right = new THREE.Vector3().crossVectors(camera.up, dir).normalize();      // camera right (points to screen right)
  const tgt = p.clone().add(right.multiplyScalar(6));                               // shift view so the node sits left of the card
  camGoal.target = tgt; camGoal.pos = tgt.clone().add(dir.multiplyScalar(FLOOR[id]?.flyDist ?? 30));
}
function refreshHighlights(){
  if (player.active) return;
  const focus = hovered || pinned;
  for (const id in nodeMap){
    const o = nodeMap[id], found = searchHits?.has(id) ?? false, muted = !!searchHits && !found && id !== focus;
    o.hlTarget = id === focus ? 1 : found ? .6 : 0; o.dimTarget = muted ? 1 : 0;
    o.labelEl.classList.toggle('hot', id === focus || found); o.labelEl.classList.toggle('dim', muted);
    o.labelEl.classList.toggle('topic-search--match', found);
  }
  const ovFound = searchHits?.has(OV) ?? false;
  ov.label.classList.toggle('hot', focus === OV || ovFound); ov.target = focus === OV || ovFound ? 1 : 0;
  ov.label.classList.toggle('dim', !!searchHits && !ovFound && focus !== OV);
  ov.label.classList.toggle('topic-search--match', ovFound);
  for (const id in FLOOR) FLOOR[id].glow?.(id === focus || id === floorTip);
}

/* ---------------- search: highlight matching components, dim the rest ---------------- */
// A component matches when its name or any of its technologies does (so "bedrock" lights up the LLM
// through Amazon Bedrock). Uses the same highlight/dim as the walkthrough; null = no search.
let searchHits = null;
function setSearch(test){
  const badgeName = b => (TECH[b.owner]?.list.find(([k]) => k === b.k) ?? [])[1] ?? '';
  badges.forEach(b => { b.hit = !!test && (test(TECHINFO[b.k].name) || test(badgeName(b))); });
  if (!test){ searchHits = null; refreshHighlights(); return; }
  const techMatches = id => (TECH[id]?.list ?? []).some(([k, nm]) => test(nm) || test(TECHINFO[k]?.name ?? ''));
  searchHits = new Set(Object.keys(nodeMap).filter(id => test(nodeMap[id].n.label) || techMatches(id)));
  if (test(overlay.info.label) || techMatches(OV)) searchHits.add(OV);
  refreshHighlights();
}

/* raycast hover / click */
const ray = new THREE.Raycaster(), mouse = new THREE.Vector2(); let downAt = null;
const setRay = e => { const [x, y] = local(e); mouse.set(x/W()*2-1, -(y/H())*2+1); ray.setFromCamera(mouse, camera); };
// the tooltip sits beside the cursor, kept inside the view
const placeTip = e => { const [x, y] = local(e); tip.style.left = Math.max(0, Math.min(x + 14, W() - 280)) + 'px'; tip.style.top = Math.min(y + 16, H() - 60) + 'px'; };
function pickAt(e){
  setRay(e); pickAt.floor = false;
  const hit = ray.intersectObjects(hitMeshes, false)[0]; if (hit) return hit.object.userData.id;
  if (ray.intersectObject(ov.fill, false).length){ pickAt.floor = true; return OV; }   // floor area of the overlay
  return null;
}
let hoverBadge = null; const tip = $('tip');
function pickBadge(e){ setRay(e); const h = ray.intersectObjects(badgeHits, false)[0]; return h ? h.object.userData.badge : null; }
function setHoverBadge(b, e){
  if (hoverBadge && hoverBadge !== b) hoverBadge.hsT = 1;
  hoverBadge = b;
  if (b){ b.hsT = 1.2; tip.innerHTML = `<b>${TECHINFO[b.k].name}</b><span>${TECHINFO[b.k].short} · click for details</span>`; placeTip(e); tip.classList.add('show'); }
  else tip.classList.remove('show');
  syncAutoRotate();
}
const pickFloor = () => ray.intersectObjects(floorTips, false)[0]?.object.userData.floor ?? null;   // call after setRay/pickAt
function setFloorTip(id, e){
  const changed = id !== floorTip; floorTip = id;
  if (id){ const { info, layer } = FLOOR[id]; tip.innerHTML = `<b style="color:${layer.color}">${esc(info.label)}</b><span>${esc(info.desc)} · click for details</span>`;
    placeTip(e); tip.classList.add('show'); }
  else if (!hoverBadge) tip.classList.remove('show');
  if (changed){ root.style.cursor = id || hovered ? 'pointer' : ''; refreshHighlights(); }
}
renderer.domElement.addEventListener('pointerleave', () => { setHoverBadge(null); setFloorTip(null); });
renderer.domElement.addEventListener('pointermove', e => {
  const bh = pickBadge(e);
  if (bh){ if (hovered) hoverNode(null); setFloorTip(null); setHoverBadge(bh, e); root.style.cursor = 'pointer'; return; }
  if (hoverBadge){ setHoverBadge(null); root.style.cursor = ''; }
  const id = pickAt(e);
  if (id !== hovered || (id && hoverSoft !== (pickAt.floor === true))) hoverNode(id, pickAt.floor === true);
  // floor zones and floor words explain themselves in a tooltip (pickAt left the ray at the cursor)
  const ft = !id || pickAt.floor ? pickFloor() : null;
  if (ft || floorTip) setFloorTip(ft, e);
});
renderer.domElement.addEventListener('pointerdown', e => { downAt = [e.clientX, e.clientY]; });
renderer.domElement.addEventListener('pointerup', e => {
  if (!downAt || Math.hypot(e.clientX-downAt[0], e.clientY-downAt[1]) > 5) return;
  const bh = pickBadge(e); if (bh){ if (!player.active) openTechCard(bh.k); return; }
  const id = pickAt(e);
  pinNode((!id || pickAt.floor ? pickFloor() : null) ?? id);   // floor zones and words sit under nodes but above the overlay floor
});

/* ---------------- play the walkthrough ---------------- */
const cometGroup = new THREE.Group(); scene.add(cometGroup);
const COMET_N = 14; const comets = []; const WHITE = new THREE.Color('#ffffff');
for (let i=0;i<COMET_N;i++){ const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map:GLOW, color:'#ffffff', transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, opacity: 1 - i/COMET_N }));
  sp.scale.setScalar(2.2 * (1 - i/COMET_N*.75)); sp.visible = false; cometGroup.add(sp); comets.push(sp); }
const pulse = new THREE.Mesh(new THREE.RingGeometry(.9, 1, 64), new THREE.MeshBasicMaterial({ color:'#ffffff', transparent:true, opacity:0, side:THREE.DoubleSide, depthWrite:false }));
pulse.rotation.x = -Math.PI/2; scene.add(pulse);

const STEP_TRAVEL = 1.0, STEP_DWELL = V.stepDwell;
const player = { active:false, step:-1, t0:0, curve:null, reverse:false, color:new THREE.Color() };
const playBtn = $('play'), caption = $('caption');
const PLAY_LABEL = playBtn.textContent;
function findCurve(a, b){
  for (const L of links){ if (L.flow==='shared') continue; if (L.a===a && L.b===b) return { curve:L.curve, rev:false, flow:L.flow }; if (L.a===b && L.b===a) return { curve:L.curve, rev:true, flow:L.flow }; }
  return { curve: curveBetween(a, b, .22), rev:false, flow:V.playFlow };
}
function startPlay(){
  closeCard();
  player.active = true; player.step = -1; pinned = null; hovered = null;
  playBtn.textContent = '■ Stop'; caption.classList.add('show'); nextStep();
}
function stopPlay(){
  player.active = false; playBtn.textContent = PLAY_LABEL; caption.classList.remove('show');
  comets.forEach(c => c.visible = false); pulse.material.opacity = 0; showInfo(null);
  for (const id in nodeMap){ const o = nodeMap[id]; o.hlTarget = 0; o.dimTarget = 0; o.labelEl.classList.remove('dim','hot'); }
  ov.label.classList.remove('dim');
  refreshHighlights();   // an active search shows again
  camGoal.target = HOME_TARGET.clone(); camGoal.pos = HOME_POS.clone();   // ease back to the default view
}
function nextStep(){
  player.step++;
  if (player.step >= PLAY.length){ setTimeout(() => { if (player.active) stopPlay(); }, 2200); player.curve = null; return; }
  const S = PLAY[player.step], prev = PLAY[player.step-1];
  if (prev){ const c = findCurve(prev.n, S.n); player.curve = c.curve; player.reverse = c.rev; player.color.set(FLOWS[c.flow].color); }
  else player.curve = null;
  player.t0 = clock.getElapsedTime();
  $('cap-step').textContent = `Step ${player.step+1} / ${PLAY.length}`;
  $('cap-it').textContent = S.it ? `Loop iteration ${S.it}` : '';
  $('cap-node').textContent = nodeMap[S.n].n.label;
  $('cap-text').innerHTML = S.t;
  $('cap-bar').style.width = ((player.step+1)/PLAY.length*100) + '%';
  const focus = new Set([S.n, ...(S.also||[])]);
  for (const id in nodeMap){ const o = nodeMap[id]; const on = id === S.n, also = focus.has(id) && !on;
    o.hlTarget = on ? 1 : also ? .55 : 0; o.dimTarget = focus.has(id) ? 0 : 1;
    o.labelEl.classList.toggle('dim', !focus.has(id)); o.labelEl.classList.toggle('hot', on); }
  ov.label.classList.toggle('dim', !S.it);
  showInfo(S.n);
  const p = nodeMap[S.n].root.position;
  camGoal.target = HOME_TARGET.clone().lerp(p, .4);
  pulse.position.set(p.x, FLOOR_Y + .05, p.z); pulse.userData.t0 = player.t0 + (player.curve ? STEP_TRAVEL : 0); pulse.userData.size = nodeMap[S.n].n.size; pulse.material.color.copy(nodeMap[S.n].color);
}
function updatePlayer(t){
  if (!player.active) return;
  const dt = t - player.t0;
  if (player.curve && dt < STEP_TRAVEL){
    const u = easeInOut(dt / STEP_TRAVEL);
    comets.forEach((c, i) => { const uu = Math.max(0, u - i*.018); c.visible = true; player.curve.getPoint(player.reverse ? 1-uu : uu, c.position); c.material.color.copy(player.color).lerp(WHITE, i===0 ? .6 : .15); });
  } else comets.forEach(c => c.visible = false);
  const pt = t - (pulse.userData.t0 ?? 0);
  if (pt >= 0 && pt < 1.6){ const k = pt/1.6; const s = pulse.userData.size * (1.3 + k*3.2); pulse.scale.set(s, s, s); pulse.material.opacity = (1-k) * .8; } else pulse.material.opacity = 0;
  const S = PLAY[player.step];
  const total = (player.curve ? STEP_TRAVEL : 0) + (S?.dwell ?? STEP_DWELL);
  if (dt > total && player.step < PLAY.length) nextStep();
}
const easeInOut = x => x<.5 ? 2*x*x : 1 - Math.pow(-2*x+2, 2)/2;
playBtn.onclick = () => player.active ? stopPlay() : startPlay();
const rotBtn = $('rotate');
let autoRotateWanted = true;
rotBtn.onclick = () => { autoRotateWanted = !autoRotateWanted; syncAutoRotate(); rotBtn.classList.toggle('on', autoRotateWanted); };
const camGoal = { target: HOME_TARGET.clone(), pos:null };
controls.addEventListener('start', () => { if (!player.active){ camGoal.target = null; camGoal.pos = null; } });
$('reset').onclick = () => { camGoal.target = HOME_TARGET.clone(); camGoal.pos = HOME_POS.clone(); };

/* ---------------- zoom: pinch / optional wheel / buttons ---------------- */
const zoomState = { log:0, x:W()/2, y:H()/2 };
const storage = { get:k => { try { return localStorage.getItem(k); } catch { return null; } }, set:(k, v) => { try { localStorage.setItem(k, v); } catch {} } };
let wheelZoom = storage.get('rag3d.wheelZoom') === '1';   // shared by all visualizations
const wzBtn = $('wheelzoom');
function syncWheelUI(){
  wzBtn.textContent = '🖱 Wheel zoom: ' + (wheelZoom ? 'on' : 'off'); wzBtn.classList.toggle('on', wheelZoom);
  $('hint').textContent = 'Drag to orbit · Right-drag / Shift-drag to pan · Pinch' + (wheelZoom ? ', wheel' : '') + ' or +/− to zoom · wheel zoom: ' + (wheelZoom ? 'on' : 'off');
}
wzBtn.onclick = () => { wheelZoom = !wheelZoom; storage.set('rag3d.wheelZoom', wheelZoom ? '1' : '0'); syncWheelUI(); };
syncWheelUI();
function queueZoom(logScale, x, y){           // logScale > 0 = zoom out, < 0 = zoom in
  zoomState.log += logScale; zoomState.x = x; zoomState.y = y;
  if (!player.active){ camGoal.target = null; camGoal.pos = null; }
}
$('zoomin').onclick = () => queueZoom(-0.28, W()/2, H()/2);
$('zoomout').onclick = () => queueZoom(0.28, W()/2, H()/2);
const zPlane = new THREE.Plane(), zRay = new THREE.Raycaster(), zNdc = new THREE.Vector2(), zP = new THREE.Vector3(), zDir = new THREE.Vector3();
function applyZoom(k){
  if (Math.abs(zoomState.log) < 1e-4){ zoomState.log = 0; return; }
  const step = zoomState.log * k; zoomState.log -= step;
  const dist = camera.position.distanceTo(controls.target);
  const nd = THREE.MathUtils.clamp(dist * Math.exp(step), controls.minDistance, controls.maxDistance);
  const s = nd / dist; if (Math.abs(s - 1) < 1e-6) { zoomState.log = 0; return; }
  // zoom toward the cursor: point under cursor on the plane through the orbit target, facing the camera
  camera.getWorldDirection(zDir); zPlane.setFromNormalAndCoplanarPoint(zDir, controls.target);
  zNdc.set(zoomState.x/W()*2-1, -(zoomState.y/H())*2+1); zRay.setFromCamera(zNdc, camera);
  const P = zRay.ray.intersectPlane(zPlane, zP) ? zP : controls.target.clone();
  camera.position.sub(P).multiplyScalar(s).add(P);
  controls.target.sub(P).multiplyScalar(s).add(P);
}
const inScene = el => !(el && el.closest && el.closest('[data-el=hud],[data-el=legend],[data-el=info],[data-el=card],[data-el=caption]'));
on(root, 'wheel', e => {
  if (e.ctrlKey){                                // trackpad pinch (Chrome/Edge/Firefox) or ctrl+wheel: never zoom the page
    e.preventDefault();
    if (inScene(e.target)) queueZoom(e.deltaY * (e.deltaMode === 1 ? 0.16 : 0.01), ...local(e));
    return;
  }
  if (wheelZoom && inScene(e.target)){
    e.preventDefault();
    const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    queueZoom(THREE.MathUtils.clamp(dy, -200, 200) * 0.0011, ...local(e));
  }
}, { passive:false });
// Safari trackpad pinch
let gScale = 1;
const gOpt = { passive:false };
on(root, 'gesturestart', e => { e.preventDefault(); gScale = 1; }, gOpt);
on(root, 'gesturechange', e => { e.preventDefault(); if (inScene(e.target)) queueZoom(Math.log(gScale / e.scale), ...(e.clientX == null ? [W()/2, H()/2] : local(e))); gScale = e.scale; }, gOpt);
on(root, 'gestureend', e => { e.preventDefault(); }, gOpt);
// touch screens: two-finger pinch over the canvas (OrbitControls still handles one-finger orbit and two-finger pan)
const touches = new Map(); let pinchD = 0;
const tDist = () => { const [a, b] = [...touches.values()]; return Math.hypot(a.x-b.x, a.y-b.y); };
const touchAt = e => { const [x, y] = local(e); return { x, y }; };
renderer.domElement.addEventListener('pointerdown', e => { if (e.pointerType !== 'touch') return; touches.set(e.pointerId, touchAt(e)); if (touches.size === 2) pinchD = tDist(); });
renderer.domElement.addEventListener('pointermove', e => {
  if (e.pointerType !== 'touch' || !touches.has(e.pointerId)) return;
  touches.set(e.pointerId, touchAt(e));
  if (touches.size === 2){ const d = tDist(); if (pinchD > 0 && d > 0){ const [a, b] = [...touches.values()]; queueZoom(Math.log(pinchD / d), (a.x+b.x)/2, (a.y+b.y)/2); } pinchD = d; }
});
const tEnd = e => { touches.delete(e.pointerId); pinchD = touches.size === 2 ? tDist() : 0; };
renderer.domElement.addEventListener('pointerup', tEnd); renderer.domElement.addEventListener('pointercancel', tEnd);

/* ---------------- post-processing ---------------- */
let composer = null;
try {
  // Antialiasing: the canvas 'antialias' flag is ignored when rendering through a composer,
  // so use a multisampled (MSAA x4) render target, plus SMAA as a final edge-smoothing pass.
  const pr = renderer.getPixelRatio();
  const msaaTarget = new THREE.WebGLRenderTarget(W()*pr, H()*pr, { type: THREE.HalfFloatType, samples: 4 });
  composer = new EffectComposer(renderer, msaaTarget);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(W(), H()), .65, .5, .3));
  composer.addPass(new OutputPass());
  composer.addPass(new SMAAPass());   // sized by the composer
  composer.setSize(W(), H());
  cleanups.push(() => { composer.passes.forEach(p => p.dispose?.()); composer.dispose(); });
} catch (e) { console.warn('Bloom unavailable, rendering without it.', e); composer = null; }

// sized to the view, which can change without the window resizing (layout, embedding)
const resizeObserver = new ResizeObserver(() => {
  camera.aspect = W()/H(); camera.updateProjectionMatrix();
  renderer.setSize(W(), H()); labelRenderer.setSize(W(), H());
  if (composer) composer.setSize(W(), H());
});
resizeObserver.observe(root);
cleanups.push(() => resizeObserver.disconnect());

/* ---------------- loop ---------------- */
// Runs only while the view is on screen and the page visible: no frames for nobody to see.
const clock = new THREE.Clock(); let frames = 0, lastT = 0, frameId = 0, onScreen = false;
const shouldRun = () => onScreen && !document.hidden;
function syncLoop(){
  if (shouldRun() && !frameId) frameId = requestAnimationFrame(animate);
  else if (!shouldRun() && frameId){ cancelAnimationFrame(frameId); frameId = 0; }
}
const visibility = new IntersectionObserver(([entry]) => { onScreen = entry.isIntersecting; syncLoop(); });
visibility.observe(root);
on(document, 'visibilitychange', syncLoop);
cleanups.push(() => { visibility.disconnect(); cancelAnimationFrame(frameId); frameId = 0; onScreen = false; });
cleanups.push(() => { controls.dispose(); disposeScene(); });
function disposeScene(){
  const textures = new Set();
  scene.traverse(o => {
    o.geometry?.dispose();
    for (const m of [o.material].flat().filter(Boolean)){ for (const v of Object.values(m)) if (v?.isTexture) textures.add(v); m.dispose(); }
  });
  textures.forEach(t => t.dispose());
}
function animate(){
  frameId = shouldRun() ? requestAnimationFrame(animate) : 0;
  const t = clock.getElapsedTime(); const fdt = Math.min(.1, t - lastT); lastT = t;
  const kT = 1 - Math.exp(-2.6 * fdt), kP = 1 - Math.exp(-2.9 * fdt);   // frame-rate independent easing
  for (const id in nodeMap){
    const o = nodeMap[id];
    o.hl += (o.hlTarget - o.hl) * .12; o.dimT += (o.dimTarget - o.dimT) * .1;
    o.holder.position.y = Math.sin(t*1.1 + o.phase) * .18;
    if (SWAY_SHAPES.has(o.n.shape)) o.group.rotation.y = Math.sin(t*.4 + o.phase) * .35;
    else o.group.rotation.y = t * .25 + o.phase;
    o.spin.forEach(([m, s]) => m.rotation.z = t * s);
    const sc = 1 + o.hl * (o.n.big ? .1 : .28) + (o.hl > .9 ? Math.sin(t*6)*.03 : 0); o.holder.scale.setScalar(sc);
    const dim = 1 - o.dimT * .75;
    o.mats.forEach(m => m.emissiveIntensity = (m.userData.baseEI ?? .4) * dim + o.hl * (o.n.big ? .5 : 1.1));
    o.halo.material.opacity = ((o.n.big ? .28 : .22) + o.hl * (o.n.big ? .25 : .5)) * dim;
    o.ring.material.opacity = (.4 + o.hl * .5) * dim;
  }
  if (llmNode.group.userData.core) llmNode.group.userData.core.scale.setScalar(1 + Math.sin(t*2.2)*.08);
  llmLight.intensity = 30 + Math.sin(t*2.2)*8;
  // links dim during play
  for (const L of links){ if (!L.tube) continue; const base = L.flow==='ops' ? .18 : .3; L.tube.material.opacity = player.active ? base * .45 : base; L.pts.material.opacity = player.active ? .35 : .95; }
  ov.v += (ov.target - ov.v) * .1; ov.update(t, ov.v);
  updateParticles(t); updatePlayer(t); updateBadges(t);
  applyZoom(1 - Math.exp(-14 * fdt));
  if (camGoal.target){ controls.target.lerp(camGoal.target, kT); if (!camGoal.pos && !player.active && controls.target.distanceTo(camGoal.target) < .05) camGoal.target = null; }
  if (camGoal.pos){ camera.position.lerp(camGoal.pos, kP); if (camera.position.distanceTo(camGoal.pos) < .15) camGoal.pos = null; }
  controls.update();
  if (composer) composer.render(); else renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
  if (++frames === 3){ const l = $('loading'); l.style.opacity = 0; setTimeout(() => l.remove(), 600); }
}

return { dispose: () => { cleanups.splice(0).reverse().forEach(fn => fn()); }, setSearch };
}
