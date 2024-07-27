# app/utils/rag_retriever.py
import os
import sqlite3
import torch
import numpy as np
from transformers import AutoTokenizer, AutoModel
from typing import List, Dict

# Define paths for database
DB_PATH = "app/utils/vector_store.db"

# Load a model for embedding (BERT, for example)
tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
model = AutoModel.from_pretrained("bert-base-uncased")

def encode_text(text: str) -> torch.Tensor:
    inputs = tokenizer(text, return_tensors="pt")
    outputs = model(**inputs)
    return outputs.last_hidden_state.mean(dim=1)

# Initialize the database
def init_db(db_path: str):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS documents (
            id INTEGER PRIMARY KEY,
            content TEXT NOT NULL,
            vector BLOB NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

# Insert vectors into the database
def insert_vectors(document_store: List[Dict[str, str]], db_path: str):
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    for doc in document_store:
        vector = encode_text(doc['content']).detach().numpy()
        cursor.execute('''
            INSERT INTO documents (content, vector)
            VALUES (?, ?)
        ''', (doc['content'], vector.tobytes()))
    conn.commit()
    conn.close()

# Retrieve documents from the database
def retrieve_documents(prompt: str, db_path: str) -> List[Dict[str, str]]:
    prompt_vector = encode_text(prompt).detach().numpy()
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute('SELECT content, vector FROM documents')
    rows = cursor.fetchall()
    conn.close()

    similarities = []
    for content, vector in rows:
        vector = np.frombuffer(vector, dtype=np.float32).reshape(1, -1)
        similarity = torch.nn.functional.cosine_similarity(torch.tensor(prompt_vector), torch.tensor(vector), dim=1)
        similarities.append((content, similarity.item()))

    similarities.sort(key=lambda x: x[1], reverse=True)  # Sort by similarity

    return [{"content": content} for content, _ in similarities]

# Initialize the database and insert vectors if needed
init_db(DB_PATH)
if not os.path.exists(DB_PATH) or os.path.getsize(DB_PATH) == 0:
    DOCUMENT_STORE = [
        {"content": "The universe is vast and ever-expanding."},
        {"content": "Quantum mechanics deals with the behavior of particles on a very small scale."},
        {"content": "Artificial intelligence is a rapidly growing field with many applications."},
    ]
    insert_vectors(DOCUMENT_STORE, DB_PATH)
