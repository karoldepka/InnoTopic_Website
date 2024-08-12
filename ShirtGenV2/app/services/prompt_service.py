# Refactoring prompt_service.py for better modularity and potential cache enhancement
import logging
from app.services.keywords_generator_service import KeywordsGeneratorService

logger = logging.getLogger(__name__)

# In-memory cache for icons
icon_cache = {}

def generate_svgs_from_prompt(prompt: str) -> [str]:
    logger.info(f"Received prompt: {prompt}")

    # Check if the prompt result is cached
    if prompt in icon_cache:
        logger.debug(f"Returning cached result for prompt: {prompt}")
        return icon_cache[prompt]

    logos = KeywordsGeneratorService().run_keyword_generator_chain(prompt)
    logger.debug(f"Found logos: {logos}")

    # Cache the result for future use
    icon_cache[prompt] = logos

    return logos
