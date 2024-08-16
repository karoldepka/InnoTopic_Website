# app/services/prompt_service.py

import logging
import time
from app.services.keywords_generator_service import KeywordsGeneratorService

logger = logging.getLogger(__name__)

# In-memory cache for icons with timestamps
icon_cache = {}
cache_expiry_seconds = 3600  # 1 hour cache expiry

# In-memory storage for query logs
query_logs = []

def purge_expired_cache():
    """
    Purge expired cache entries.
    """
    current_time = time.time()
    keys_to_delete = [key for key, (_, timestamp) in icon_cache.items() if current_time - timestamp > cache_expiry_seconds]
    for key in keys_to_delete:
        logger.debug(f"Purging expired cache for prompt: {key}")
        del icon_cache[key]

def generate_svgs_from_prompt(prompt: str, num_logos: int) -> [str]:
    logger.info(f"Received prompt: {prompt} with {num_logos} logos")

    # Purge expired cache entries
    purge_expired_cache()

    # Create a unique cache key based on prompt and num_logos
    cache_key = (prompt, num_logos)

    # Check if the prompt result is cached
    if cache_key in icon_cache:
        logger.debug(f"Returning cached result for prompt: {prompt} with {num_logos} logos")
        return icon_cache[cache_key][0]

    # If not cached, generate the logos
    try:
        logos = KeywordsGeneratorService().run_keyword_generator_chain(prompt, num_logos)
    except Exception as e:
        logger.error(f"Error generating logos: {str(e)}", exc_info=True)
        return []

    logger.debug(f"Found logos: {logos}")

    # Cache the result for future use
    icon_cache[cache_key] = (logos, time.time())

    # Log the query
    query_logs.append({"prompt": prompt, "num_logos": num_logos, "timestamp": time.time()})

    return logos

def get_query_logs():
    """
    Retrieve query logs.
    """
    return query_logs

# Placeholder functions for other imported but not implemented functions
def search_query(search_params):
    # Implement search functionality
    pass

def set_query_parameters(params):
    # Implement setting query parameters
    pass

def get_query_parameters():
    # Implement getting query parameters
    pass
