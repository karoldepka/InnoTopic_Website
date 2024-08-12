# keywords_generator_service.py

import json
import os
import logging
from langchain_openai import OpenAIEmbeddings  # Updated import
from langchain_community.vectorstores import Chroma

logger = logging.getLogger(__name__)

class KeywordsGeneratorService:
    """
    Service for generating keywords and searching for logos based on user input.
    """

    def extract_metadata(self, response_data):
        """
        Extracts metadata from the response data.
        """
        meta_datas = []
        for item in response_data:
            data = item[0]
            meta_datas.append(data.metadata)
        return meta_datas

    def run_keyword_generator_chain(self, prompt: str):
        """
        Runs the keyword generation process and searches for related logos.
        """
        try:
            logger.info(f"Starting keyword generation for prompt: {prompt}")

            current_dir = os.path.dirname(os.path.abspath(__file__))
            logo_file_path = os.path.join(current_dir, "../../logo-data", "logos.json")
            persistent_directory = os.path.join(current_dir, "../../db", "chroma_db")

            if not os.path.exists(persistent_directory):
                logger.info("Persistent directory does not exist. Initializing vector store...")

                if not os.path.exists(logo_file_path):
                    raise FileNotFoundError(
                        f"The file {logo_file_path} does not exist. Please check the path."
                    )

                # Load JSON data
                with open(logo_file_path, "r") as f:
                    logos_data = json.load(f)

                # Initialize OpenAI embeddings
                embeddings = OpenAIEmbeddings(model="text-embedding-3-small")  # Updated class reference

                # Prepare data for Chroma
                texts = [logo['name'] for logo in logos_data]
                meta_datas = [{"name": logo["name"], "svg_logo": logo["files"][0], "url": logo["url"]} for logo in
                              logos_data]

                vectorstore = Chroma.from_texts(
                    texts=texts,
                    metadatas=meta_datas,
                    embedding=embeddings,
                    persist_directory=persistent_directory
                )
                vectorstore.persist()

            # Load the existing vector store with the embedding function
            embeddings = OpenAIEmbeddings(model="text-embedding-3-small")  # Updated class reference
            db = Chroma(persist_directory=persistent_directory, embedding_function=embeddings)

            result = db.similarity_search_with_score(prompt, k=5)

            logger.info(f"Response from vector store: {result}")
            return self.extract_metadata(result)

        except FileNotFoundError as e:
            logger.error(f"File not found: {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error occurred: {e}", exc_info=True)
            return []
