from fastapi import FastAPI
from app.routes import router
from app.logging_middleware import log_requests

app = FastAPI()

app.middleware("http")(log_requests)
app.include_router(router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
