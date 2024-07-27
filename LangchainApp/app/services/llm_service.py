# app/services/llm_service.py
from app.utils.rag_retriever import retrieve_documents

def generate_response_with_rag(prompt: str) -> str:
    documents = retrieve_documents(prompt, "app/utils/vector_store.db")
    if documents:
        # Combine the prompt and the retrieved document content to generate a response
        # Placeholder for actual model inference logic
        response = f"Response based on the prompt: '{prompt}' and document: '{documents[0]['content']}'"
    else:
        response = f"No relevant documents found for the prompt: '{prompt}'"
    return response
