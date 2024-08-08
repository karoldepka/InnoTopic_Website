import logging
import requests
import os
import time
from dotenv import load_dotenv
from requests_oauthlib import OAuth1
from requests.adapters import HTTPAdapter
from urllib3 import Retry

load_dotenv()

logger = logging.getLogger(__name__)


class NounProjectAPI:
    def __init__(self, api_key, api_secret):
        self.api_key = api_key
        self.api_secret = api_secret
        self.base_url = "https://api.thenounproject.com"

        # Set up OAuth1 authentication
        self.auth = OAuth1(self.api_key, self.api_secret)

        # Set up session with retries
        self.session = requests.Session()
        self.session.mount('https://', HTTPAdapter())

    def search(self, term, limit=5):
        url = f"{self.base_url}/v2/icon"
        params = {
            'query': term,
            'limit': limit
        }
        try:
            response = self.session.get(url, auth=self.auth, params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as http_err:
            logger.error(f"HTTP error occurred: {http_err}", exc_info=True)
            raise
        except requests.exceptions.RequestException as req_err:
            logger.error(f"Request exception occurred: {req_err}", exc_info=True)
            raise
        except Exception as err:
            logger.error(f"Unexpected error occurred: {err}", exc_info=True)
            raise


def search_noun_project(query: str) -> list:
    logger.debug(f"Searching Noun Project for: {query}")
    try:
        api = NounProjectAPI(os.getenv('NOUN_PROJECT_API_KEY'), os.getenv('NOUN_PROJECT_API_SECRET'))
        results = api.search(query, limit=2)
        if results:
            logger.debug(f"Noun Project search results: {results}")
            return [icon['thumbnail_url'] for icon in results.get('icons', [])]
        else:
            logger.info(f"No results found for query: {query}")
            return []  # Return an empty list or a fallback response
    except Exception as e:
        logger.error(f"An error occurred: {e}", exc_info=True)
        return []  # Return an empty list or a fallback response
