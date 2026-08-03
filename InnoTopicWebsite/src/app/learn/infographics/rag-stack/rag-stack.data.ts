export interface RagStackLayer {
  /** Displayed as "01", "02", ... in stack order, tip to depths. */
  index: number
  title: string
  description: string
  /** Topic ids, resolved via app-topic-tag / TopicsService. */
  tools: string[]
}

/**
 * "Demos happen above the waterline. Production is decided underwater."
 * Order runs tip (what a demo shows off) to depths (what actually makes it production-ready),
 * matching the RAG pipeline's real data flow read bottom-up: extraction feeds embedding, embedding
 * feeds the vector store, which the framework retrieves from to prompt the LLM.
 */
export const ragStackLayers: RagStackLayer[] = [
  {
    index: 1,
    title: 'LLMs',
    description: 'The model actually generating answers - the most debated, least differentiating layer.',
    tools: ['OpenAI', 'Claude', 'Google Gemini', 'Meta', 'Mistral AI', 'DeepSeek'],
  },
  {
    index: 2,
    title: 'Framework',
    description: 'Query routing, step chaining, and agent orchestration.',
    tools: ['LangChain', 'LlamaIndex', 'AutoGen', 'CrewAI', 'Haystack', 'DSPy'],
  },
  {
    index: 3,
    title: 'Evaluation',
    description: 'Quality assurance catching errors before users encounter them.',
    tools: ['Ragas', 'LangSmith', 'TruLens', 'DeepEval', 'Weights & Biases'],
  },
  {
    index: 4,
    title: 'VectorDB',
    description: 'Retrieval speed and scalability infrastructure.',
    tools: ['Pinecone', 'Weaviate', 'Qdrant', 'Milvus', 'Chroma'],
  },
  {
    index: 5,
    title: 'Embedding',
    description: 'Turns documents into the vectors everything above actually searches over.',
    tools: ['OpenAI', 'Cohere', 'Hugging Face', 'Voyage AI', 'BGE'],
  },
  {
    index: 6,
    title: 'Data Extraction',
    description: 'Source document processing - junk here poisons every layer above it.',
    tools: ['Unstructured.io', 'LlamaParse', 'Docling', 'PyMuPDF', 'Firecrawl'],
  },
  {
    index: 7,
    title: 'Memory',
    description: 'Agent context retention across sessions.',
    tools: ['Mem0', 'Zep', 'Redis', 'LangGraph'],
  },
  {
    index: 8,
    title: 'Alignment',
    description: 'Guardrails and output tracing.',
    tools: ['Guardrails AI', 'NeMo Guardrails', 'Langfuse', 'OpenTelemetry'],
  },
  {
    index: 9,
    title: 'Deployment',
    description: 'Infrastructure determining latency and cost.',
    tools: ['Docker', 'Kubernetes', 'AWS', 'GCP - Google Cloud Platform', 'Microsoft Azure'],
  },
]

/** Layers up to (not including) this index are drawn above the waterline. */
export const ragStackWaterlineAfterLayer = 2
