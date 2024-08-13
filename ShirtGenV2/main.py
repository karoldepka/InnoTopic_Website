# main.py - Integrated with Prometheus for monitoring and port management

import os
import socket
import subprocess
import logging
from dotenv import load_dotenv
from fastapi import FastAPI, Request
from app.routes import routes, feedback_routes
from prometheus_client import start_http_server, Counter, Histogram
from prometheus_client import REGISTRY, generate_latest

load_dotenv()

app = FastAPI(port=os.getenv('PORT', 8000))

app.include_router(routes.router)
app.include_router(feedback_routes.router)

# Enhanced logging configuration
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

def is_port_in_use(port: int) -> bool:
    """Check if a port is in use."""
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def free_port(port: int):
    """Terminate the process using the port."""
    if os.name == 'nt':  # For Windows
        command = f"netstat -ano | findstr :{port}"
        process_list = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE)
        output = process_list.stdout.read().decode()
        if output:
            pid = int(output.strip().split()[-1])
            subprocess.call(['taskkill', '/PID', str(pid), '/F'])
            logger.info(f"Terminated process using port {port} (PID: {pid})")
    else:  # For Unix-like systems
        command = f"lsof -t -i:{port}"
        process_list = subprocess.Popen(command, shell=True, stdout=subprocess.PIPE)
        output = process_list.stdout.read().decode().strip()
        if output:
            pid = int(output)
            subprocess.call(['kill', '-9', str(pid)])
            logger.info(f"Terminated process using port {port} (PID: {pid})")

# Check if the port is in use and free it if necessary
port = int(os.getenv('PORT', 8000))
if is_port_in_use(port):
    logger.info(f"Port {port} is in use. Attempting to free it...")
    free_port(port)

# Prometheus Metrics
REQUEST_COUNT = Counter('request_count', 'App Request Count', ['method', 'endpoint'])
REQUEST_LATENCY = Histogram('request_latency_seconds', 'Request latency', ['endpoint'])

@app.middleware("http")
async def prometheus_metrics_middleware(request: Request, call_next):
    method = request.method
    endpoint = request.url.path
    REQUEST_COUNT.labels(method=method, endpoint=endpoint).inc()

    with REQUEST_LATENCY.labels(endpoint=endpoint).time():
        response = await call_next(request)

    return response

@app.get("/metrics")
async def get_metrics():
    return generate_latest(REGISTRY)

@app.on_event("startup")
async def startup():
    logger.info("Application startup")

@app.on_event("shutdown")
async def shutdown():
    logger.info("Application shutdown")
