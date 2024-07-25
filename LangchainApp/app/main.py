# app/main.py

from fastapi import FastAPI
from app.routes import router
from app.logging_middleware import LoggingMiddleware

app = FastAPI()

# Add logging middleware
app.add_middleware(LoggingMiddleware)

# Include the router from the routes module
app.include_router(router)

@app.get("/")
def read_root():
    return {"message": "Welcome to InnoTopic_Website API!"}
