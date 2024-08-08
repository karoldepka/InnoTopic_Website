import logging
from app.services.keywords_generator_service import KeywordsGeneratorService
from app.services.noun_api_service import search_noun_project

logger = logging.getLogger(__name__)


def generate_svgs_from_prompt(prompt: str) -> [str]:
    logger.info(f"Received prompt: {prompt}")
    # if single keyword, directly return result from NounAPI else generate keywords
    generated_keywords = KeywordsGeneratorService().run_keyword_generator_chain(prompt)
    logger.info(f"Generated keywords: {generated_keywords}")

    # Search Noun Project for each keyword
    logos = []
    for keyword in generated_keywords:
        logos.extend(search_noun_project(keyword))

    logger.debug(f"Found logos: {logos}")

    return ["Hi there", "How Are you!"]
