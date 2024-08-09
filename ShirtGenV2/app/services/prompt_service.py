import logging
from app.services.keywords_generator_service import KeywordsGeneratorService
from app.services.noun_api_service import search_noun_project

logger = logging.getLogger(__name__)

# In-memory cache for icons
icon_cache = {}

def generate_svgs_from_prompt(prompt: str, use_keywords: bool) -> [str]:
    logger.info(f"Received prompt: {prompt}, use_keywords: {use_keywords}")

    logos = KeywordsGeneratorService().run_keyword_generator_chain(prompt)
    logger.debug(f"Found logos: {logos}")

    return logos
