export type AgentNodeId =
  | 'goal' | 'llm' | 'plan' | 'act' | 'guardrails' | 'tools'
  | 'observe' | 'reflect' | 'memory' | 'subagents' | 'result'
  | 'knowledge' | 'embed' | 'vectordb' | 'retrieve'

/** Drives each node's color and size. */
export type AgentNodeKind = 'io' | 'core' | 'loop' | 'guard' | 'tools' | 'memory' | 'agents'

export interface AgentNode {
  id: AgentNodeId
  title: string
  kind: AgentNodeKind
  /** One line: shown under the node and as the walk-through caption. */
  summary: string
  /** Paragraphs of the extended tooltip. */
  details: string[]
  /**
   * Topic ids shown as example tags in the tooltip (resolved via app-topic-tag); in 3D, the first
   * few that have a logo also orbit the node as logo badges.
   */
  examples?: string[]
  /** x/y on the flat (2D) diagram; z is the node's depth layer in 3D. */
  position: [number, number, number]
  /** Side of the sphere the label sits on, chosen to keep it off the node's own edges. */
  label?: 'above' | 'below' | 'right'
}

export type AgentEdgeKind = 'flow' | 'loop' | 'memory' | 'delegate'

export interface AgentEdge {
  from: AgentNodeId
  to: AgentNodeId
  kind: AgentEdgeKind
  /** Sideways bend of the curve, in world units (positive bends to the left of the direction of travel). */
  bend?: number
}

/**
 * How an AI agent works: a goal goes into a loop of reasoning, acting through tools and observing
 * the results, until the goal is met or the agent needs help. The user-facing column (goal in,
 * result out) sits on the left, the loop in the middle, the outside world (tools) on the right.
 * Retrieval (RAG) runs along the bottom: knowledge sources are embedded and indexed in a vector
 * database, which the agent searches through a retrieval tool. In 3D, nodes spread into depth
 * layers - the user in front; memory, tools, sub-agents and the knowledge base behind.
 */
export const agentNodes: AgentNode[] = [
  {
    id: 'goal',
    title: 'Goal',
    kind: 'io',
    summary: 'You describe an outcome, not the steps.',
    details: [
      'Agentic systems start from a goal such as "fix this failing test" or "find the cheapest flight next Friday", plus constraints like budget, deadline or which files may change.',
      'Unlike a chatbot that answers once, the agent keeps working on the goal across many steps until it is done or needs your input.',
    ],
    position: [-7.4, 1.5, 2],
    label: 'above',
  },
  {
    id: 'llm',
    title: 'LLM',
    kind: 'core',
    summary: 'The reasoning core: decides what to do next.',
    details: [
      'A large language model reads its instructions, the available tools, the goal, the steps so far and the latest observations, then chooses the next move: think, call a tool, delegate, ask the user, or finish.',
      'It keeps no hidden state between calls - everything it knows about the task has to be in its context window, which is why memory and observations matter so much.',
      'Plan, Act and Reflect are the model\'s own steps. The program around it - the agent runtime - runs the tools, applies the guardrails, feeds results back and stops the loop at its limits.',
    ],
    examples: ['Claude', 'OpenAI', 'Google Gemini', 'DeepSeek', 'Mistral AI'],
    position: [-3.6, 0, 0.6],
    label: 'above',
  },
  {
    id: 'plan',
    title: 'Plan',
    kind: 'loop',
    summary: 'Breaks the goal into steps and keeps them current.',
    details: [
      'Many agents first break the goal into a to-do list, e.g. reproduce the bug, find the cause, patch it, run the tests; simpler ones just decide one step at a time.',
      'Plans are revised as observations arrive. Good agents re-plan when a step fails instead of blindly following their first idea.',
    ],
    position: [-1.2, 2.7, 0],
    label: 'above',
  },
  {
    id: 'act',
    title: 'Act',
    kind: 'loop',
    summary: 'Emits a structured tool call: which tool, which arguments.',
    details: [
      'The model outputs a structured request such as search(query: "...") or run_tests(path: "..."). The agent runtime - not the model - actually executes it.',
      'Tool calls are how the model\'s words turn into real effects - edited files, sent messages, booked tickets - not just text on a screen.',
    ],
    position: [2.0, 2.7, 0],
    label: 'above',
  },
  {
    id: 'guardrails',
    title: 'Guardrails',
    kind: 'guard',
    summary: 'Checks every action before it runs; asks a human when needed.',
    details: [
      'Permissions and policies decide which actions run automatically, which need approval and which are blocked; sandboxes and budgets limit the damage and cost of what does run. Many systems also screen inputs and outputs, e.g. for injected instructions or leaked secrets.',
      'Risky or irreversible steps - payments, deleting data, sending emails - should pause for a person to approve. This "human in the loop" keeps the agent useful without making it reckless.',
    ],
    examples: ['Docker', 'NeMo Guardrails', 'Guardrails AI'],
    position: [4.6, 1.6, -1.2],
    label: 'above',
  },
  {
    id: 'tools',
    title: 'Tools',
    kind: 'tools',
    summary: 'Search, code, APIs, files, browsers: the agent\'s hands.',
    details: [
      'Each tool has a name, a description and an input schema the model can read; protocols like MCP (Model Context Protocol) let one agent plug into many tool servers.',
      'Typical tools: web search, running code, databases and file systems, SaaS APIs, searching a knowledge base (see Retrieve), and even driving a browser or a whole computer.',
    ],
    examples: ['Bash', 'Python', 'Playwright', 'GitHub', 'PostgreSQL'],
    position: [7.2, 0, -2.4],
  },
  {
    id: 'observe',
    title: 'Observe',
    kind: 'loop',
    summary: 'Tool results flow back into the context.',
    details: [
      'The tool\'s output - search results, a stack trace, an API response - is added to the model\'s context as an observation.',
      'Observations ground the next decision in real data rather than the model\'s guesses. They are also untrusted input: a web page or email can hide instructions aimed at the agent (prompt injection) - one more reason risky actions go through guardrails.',
    ],
    position: [2.0, -2.7, 0],
  },
  {
    id: 'reflect',
    title: 'Reflect',
    kind: 'loop',
    summary: 'Did that work? Is the goal met? Try something else?',
    details: [
      'The agent checks the observation against the goal: is the test green, does the answer cite sources, did the API return an error?',
      'Then it loops back for the next step, retries differently, or decides it is done. Some systems back this up with automatic checks such as tests, or a separate critic model that reviews the work.',
    ],
    position: [-1.2, -2.7, 0],
  },
  {
    id: 'memory',
    title: 'Memory',
    kind: 'memory',
    summary: 'Short-term context plus long-term knowledge.',
    details: [
      'Short-term memory is the context window: the goal, recent steps and observations. It is limited, so long tasks get summarized or trimmed.',
      'Long-term memory lives outside the model - notes files, knowledge graphs, or the same vector databases used for retrieval (RAG). The agent can write down what is worth keeping and recall it in later sessions.',
    ],
    examples: ['Redis', 'Mem0', 'Zep'],
    position: [-5.2, -3, -2.2],
  },
  {
    id: 'knowledge',
    title: 'Knowledge sources',
    kind: 'memory',
    summary: 'Docs, wikis, tickets and code the agent should know.',
    details: [
      'Retrieval-augmented generation (RAG) lets an agent use knowledge that is not in the model\'s weights - company docs, a codebase, last week\'s tickets - without retraining the model.',
      'First the content is extracted from PDFs, web pages and other formats, then split into chunks small enough to embed and to fit in a prompt. Messy extraction here poisons everything downstream.',
    ],
    examples: ['Notion', 'GitHub', 'Slack', 'Jira', 'Unstructured.io', 'Docling'],
    position: [0, -5.8, -3.2],
  },
  {
    id: 'embed',
    title: 'Embed',
    kind: 'memory',
    summary: 'Turns each chunk - and later each question - into a vector.',
    details: [
      'An embedding model maps text to a vector of numbers, so that passages with similar meaning end up close together - even when they share no words.',
      'The same model embeds the question at query time, so questions and passages can be compared in the same space.',
    ],
    examples: ['OpenAI', 'Cohere', 'Hugging Face', 'Voyage AI'],
    position: [2.8, -5.8, -3],
  },
  {
    id: 'vectordb',
    title: 'Vector DB',
    kind: 'memory',
    summary: 'Stores the vectors and finds the nearest ones fast.',
    details: [
      'A vector database indexes millions of embeddings for approximate nearest-neighbour search, usually together with the original text and metadata such as source, date or access rights.',
      'Many combine vector search with keyword search ("hybrid search") and metadata filters - e.g. only documents this user is allowed to see.',
    ],
    examples: ['Pinecone', 'Qdrant', 'Weaviate', 'Chroma', 'Milvus'],
    position: [5.6, -5.4, -2.8],
  },
  {
    id: 'retrieve',
    title: 'Retrieve',
    kind: 'memory',
    summary: 'Finds the most relevant chunks and hands them to the model.',
    details: [
      'In an agent, retrieval is usually one of its tools: it embeds the query, fetches the nearest chunks from the vector database and ideally reranks them for relevance. The agent can search again with a better query if the first results miss.',
      'The best chunks come back as an observation, with their sources - the "augmented" in retrieval-augmented generation - so answers can quote and cite them. Classic RAG does a single retrieval before the first model call.',
    ],
    examples: ['LangChain', 'LlamaIndex', 'Elasticsearch', 'Haystack'],
    position: [5.6, -2.6, -1.6],
    label: 'right',
  },
  {
    id: 'subagents',
    title: 'Sub-agents',
    kind: 'agents',
    summary: 'Specialists take on parts of the work, often in parallel.',
    details: [
      'The main agent - the orchestrator - can hand focused sub-tasks (research this, review that) to sub-agents, each with its own context window and tools.',
      'Their condensed results come back as observations. That keeps the orchestrator\'s context small and lets independent work run in parallel, at the cost of many more tokens.',
    ],
    examples: ['LangGraph', 'CrewAI', 'LangChain'],
    position: [1, 0.2, -3],
    label: 'above',
  },
  {
    id: 'result',
    title: 'Result',
    kind: 'io',
    summary: 'The finished outcome, with a trace of how it got there.',
    details: [
      'When the goal is met, the agent returns the result: an answer, a pull request, a booked trip, a report. If it gets stuck or hits its step or cost limit, it should stop and report what it tried rather than loop forever or claim success.',
      'Good agents also leave a trace of their steps and sources, so a person can check the work instead of taking it on trust.',
    ],
    examples: ['LangSmith', 'Langfuse'],
    position: [-7.4, -1.7, 2],
  },
]

export const agentEdges: AgentEdge[] = [
  { from: 'goal', to: 'llm', kind: 'flow', bend: -0.6 },
  { from: 'llm', to: 'plan', kind: 'loop', bend: -0.5 },
  { from: 'plan', to: 'act', kind: 'loop', bend: -0.6 },
  { from: 'act', to: 'guardrails', kind: 'loop', bend: -0.3 },
  { from: 'guardrails', to: 'tools', kind: 'loop', bend: -0.3 },
  { from: 'tools', to: 'observe', kind: 'loop', bend: -1 },
  { from: 'observe', to: 'reflect', kind: 'loop', bend: -0.6 },
  { from: 'reflect', to: 'llm', kind: 'loop', bend: -0.5 },
  { from: 'llm', to: 'memory', kind: 'memory', bend: -0.5 },
  { from: 'memory', to: 'llm', kind: 'memory', bend: -0.5 },
  { from: 'llm', to: 'subagents', kind: 'delegate', bend: 0.6 },
  { from: 'subagents', to: 'observe', kind: 'delegate', bend: 0.6 },
  { from: 'reflect', to: 'result', kind: 'flow', bend: -0.4 },
  // Retrieval-augmented generation: indexing (knowledge -> embed -> vector DB) ahead of time, and
  // retrieval as one of the agent's tools at run time.
  { from: 'knowledge', to: 'embed', kind: 'memory', bend: 0.3 },
  { from: 'embed', to: 'vectordb', kind: 'memory', bend: 0.3 },
  { from: 'tools', to: 'retrieve', kind: 'memory', bend: 0.3 },
  { from: 'retrieve', to: 'vectordb', kind: 'memory', bend: -0.4 },
  { from: 'vectordb', to: 'retrieve', kind: 'memory', bend: -0.4 },
  { from: 'retrieve', to: 'observe', kind: 'memory', bend: 0.4 },
]

/**
 * The guided tour: one pass through the loop, then memory and delegation, then how retrieval
 * (RAG) feeds the loop, and back around to the result. Most moves follow an edge, so a token can
 * travel them.
 */
export const agentWalkthrough: AgentNodeId[] = [
  'goal', 'llm', 'plan', 'act', 'guardrails', 'tools', 'observe', 'reflect',
  'llm', 'memory', 'subagents', 'knowledge', 'embed', 'vectordb', 'retrieve', 'observe', 'reflect', 'result',
]
