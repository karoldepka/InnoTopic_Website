import json
import os
import logging

from dotenv import load_dotenv
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.vectorstores import Chroma

load_dotenv()


class KeywordsGeneratorService:
    # TODO: check if the data exists ✅
    # TODO: if not create embeddings and push resulting data to chroma db ✅
    # TODO: retrieve the data ✅
    # TODO: validate
    # TODO: optimize

    # INFO: kept langchain related code as comment because we may need it if retrieving directly from store doesn't
    # return optimized output or incorrect

    def run_keyword_generator_chain(self, prompt):
        logger = logging.getLogger(__name__)

        current_dir = os.path.dirname(os.path.abspath(__file__))
        logo_file_path = os.path.join(current_dir, "../../logo-data", "logos.json")
        persistent_directory = os.path.join(current_dir, "../../db", "chroma_db")

        if not os.path.exists(persistent_directory):
            print("Persistent directory does not exist. Initializing vector store...")

            if not os.path.exists(logo_file_path):
                raise FileNotFoundError(
                    f"The file {logo_file_path} does not exist. Please check the path."
                )

            # Load JSON data
            with open(logo_file_path, "r") as f:
                logos_data = json.load(f)

            # Initialize OpenAI embeddings
            embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

            # Prepare data for Chroma
            texts = [f"{logo['name']} {logo['files']}" for logo in logos_data]      # TODO: check why need to pass both
            meta_datas = [{"name": logo["name"], "svg_logo": logo["files"][0]} for logo in logos_data]

            vectorstore = Chroma.from_texts(
                texts=texts,
                metadatas=meta_datas,
                embedding=embeddings,
                persist_directory=persistent_directory
            )
            vectorstore.persist()

        # model = ChatOpenAI(model="gpt-4o")
        #
        # prompt_template = ChatPromptTemplate.from_messages(
        #     [
        #         ("system",
        #          "You are a keyword extractor who extract keywords related to any topic user provide." +
        #          "You respond only in json string array."),
        #         ("human", "Tell me {keyword_count} {topic} keywords."),
        #     ]
        # )
        #
        # logger.info(f"Prompt template {prompt_template}")
        #
        # # Create the combined chain using LangChain Expression Language (LCEL)
        # chain = prompt_template | model | StrOutputParser()
        #
        # # Run the chain
        # result = chain.invoke({"topic": prompt, "keyword_count": 5})
        #
        # logger.info(f"Chain Output: {result}")

        # Define the embedding model
        embeddings = OpenAIEmbeddings(model="text-embedding-3-small")

        # Load the existing vector store with the embedding function
        db = Chroma(persist_directory=persistent_directory, embedding_function=embeddings)

        result = db.similarity_search_with_score(prompt, k=5)

        logger.info(f"response from vector store")
        return result
