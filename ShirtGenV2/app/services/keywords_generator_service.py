import json
import os
import logging
from langchain_openai import OpenAIEmbeddings
# from langchain_chroma import Chroma  # Updated import

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
            data, score = item
            meta_datas.append({"metadata": data.metadata, "similarity": score})
        return meta_datas

    def get_db_stats(self, db):
        """
        Retrieves statistics about the Chroma DB by counting the number of documents.
        """
        try:
            all_documents = db.similarity_search("", k=1000000)  # Large integer k to retrieve all documents
            num_documents = len(all_documents)
            logger.info(f"Number of documents in the Chroma DB: {num_documents}")
            return num_documents
        except Exception as e:
            logger.error(f"Error while retrieving DB stats: {e}", exc_info=True)
            return 0

    def run_keyword_generator_chain(self, prompt: str, num_logos: int):
        """
        Runs the keyword generation process and searches for related logos.
        """
        try:
            logger.info(f"Starting keyword generation for prompt: {prompt} with {num_logos} logos")

            current_dir = os.path.dirname(os.path.abspath(__file__))
            logo_file_path = os.path.join(current_dir, "../../logo-data", "logos.json")
            persistent_directory = os.path.join(current_dir, "../../db", "chroma_db")

            # Initialize the embedding model
            embeddings = OpenAIEmbeddings(model="text-embedding-3-large")

            # Check if the persistent directory already exists
            if os.path.exists(persistent_directory):
                logger.info("Persistent directory exists. Loading the existing vector store...")

                # Load the existing vector store with the embedding function
                db = Chroma(persist_directory=persistent_directory, embedding_function=embeddings)

                # Retrieve and log the stats
                num_documents = self.get_db_stats(db)

                # Only regenerate the database if there are no documents
                if num_documents == 0:
                    logger.info("No documents found in the existing DB. Regenerating the vector store...")
                    self.initialize_vector_store(logo_file_path, embeddings, persistent_directory)
            else:
                logger.info("Persistent directory does not exist. Initializing vector store...")
                self.initialize_vector_store(logo_file_path, embeddings, persistent_directory)

            # Load the vector store again (if it was regenerated)
            db = Chroma(persist_directory=persistent_directory, embedding_function=embeddings)

            # Perform the similarity search
            result = db.similarity_search_with_score(prompt, k=num_logos)

            logger.info(f"Response from vector store: {result}")
            return self.extract_metadata(result)

        except FileNotFoundError as e:
            logger.error(f"File not found: {e}")
            return []
        except Exception as e:
            logger.error(f"Unexpected error occurred: {e}", exc_info=True)
            return []

    def initialize_vector_store(self, logo_file_path, embeddings, persistent_directory):
        """
        Initializes the vector store and persists it.
        """
        if not os.path.exists(logo_file_path):
            raise FileNotFoundError(
                f"The file {logo_file_path} does not exist. Please check the path."
            )

        # Load JSON data
        with open(logo_file_path, "r") as f:
            logos_data = json.load(f)

        # Prepare data for Chroma
        texts = [logo['name'] for logo in logos_data]
        meta_datas = [{"name": logo["name"], "svg_logo": logo["files"][0], "url": logo["url"]} for logo in logos_data]

        # Create the vector store (persistence is now automatic)
        Chroma.from_texts(
            texts=texts,
            metadatas=meta_datas,
            embedding=embeddings,
            persist_directory=persistent_directory
        )

# Example usage
if __name__ == "__main__":
    service = KeywordsGeneratorService()
    service.run_keyword_generator_chain("example prompt", 5)
