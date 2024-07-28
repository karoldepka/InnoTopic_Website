from fastapi import FastAPI
from app.routes import llm_routes  # Importing from routes package

app = FastAPI()

app.include_router(llm_routes.router)  # Include routes from llm_routes
