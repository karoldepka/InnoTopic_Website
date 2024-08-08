import logging
from app.services.keywords_generator_service import KeywordsGeneratorService
from app.services.noun_api_service import search_noun_project

logger = logging.getLogger(__name__)

# In-memory cache for icons
icon_cache = {}

def generate_svgs_from_prompt(prompt: str, use_keywords: bool) -> [str]:
    logger.info(f"Received prompt: {prompt}, use_keywords: {use_keywords}")

    if use_keywords:
        # Generate keywords from the prompt
        generated_keywords = KeywordsGeneratorService().run_keyword_generator_chain(prompt)
        logger.info(f"Generated keywords: {generated_keywords}")
    else:
        # Use the prompt directly as a keyword
        generated_keywords = [prompt]

    # Search Noun Project for each keyword, using cache if available
    logos = []
    for keyword in generated_keywords:
        if keyword in icon_cache:
            logos.extend(icon_cache[keyword])
        else:
            icons = search_noun_project(keyword)
            icon_cache[keyword] = icons
            logos.extend(icons)

    logger.debug(f"Found logos: {logos}")

    # Return only the first 3 logos
    return logos[:3]
