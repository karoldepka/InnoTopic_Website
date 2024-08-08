import logging

logger = logging.getLogger(__name__)


def generate_svgs_from_prompt(prompt: str) -> [str]:
    logger.info(f"Received prompt: {prompt}")
    return ["Hi there", "How Are you!"]
