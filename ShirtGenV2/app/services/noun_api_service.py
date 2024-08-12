# Potential optimizations and enhancements for noun_api_service.py
import json
import logging
import os

logger = logging.getLogger(__name__)

def search_noun_project(query: str) -> list:
    """
    Searches the local logo database for matching logos based on the input query.
    """
    logger.debug(f"Searching local logo database for: {query}")
    try:
        current_dir = os.path.dirname(os.path.abspath(__file__))
        logo_file_path = os.path.join(current_dir, "../../logo-data", "logos.json")

        with open(logo_file_path, "r") as f:
            logos_data = json.load(f)
        
        # Optimize search logic for larger datasets (consider using a set if logos_data grows)
        results = [
            logo['files'][0] for logo in logos_data 
            if query.lower() in logo['name'].lower()
        ]
        
        logger.debug(f"Found logos: {results}")
        return results

    except FileNotFoundError:
        logger.error("logo.json file not found")
        return []
    except json.JSONDecodeError:
        logger.error("Error decoding logo.json")
        return []
    except Exception as e:
        logger.error(f"An unexpected error occurred: {e}", exc_info=True)
        return []
