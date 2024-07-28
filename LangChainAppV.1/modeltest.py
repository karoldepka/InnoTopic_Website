import os
import logging
from ollama import Client  # Use the actual class for model handling

logger = logging.getLogger(__name__)

# Set the model path (ensure this is correct and required by the library)
model_path = "C:\\AI_Work\\Projects\\Models\\models--t5-base\\snapshots\\a9723ea7f1b39c1eae772870f3b547bf6ef7e6c1"

# Example port number (if needed by the library)
port = 11434  # Replace with actual port if required

try:
    # Initialize the model client
    client = Client(model_path, port=port)  # Adjust based on actual initialization
    logger.info(f"Model loaded successfully from path: {model_path}")
except Exception as e:
    logger.error(f"Failed to load model from path: {model_path}. Error: {e}")
