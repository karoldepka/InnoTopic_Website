from dotenv import load_dotenv
from langchain.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import ChatOpenAI
import logging

load_dotenv()


class KeywordsGeneratorService:

    def run_keyword_generator_chain(self, prompt):
        logger = logging.getLogger(__name__)

        model = ChatOpenAI(model="gpt-4o")

        prompt_template = ChatPromptTemplate.from_messages(
            [
                ("system",
                 "You are a keyword extractor who extract keywords related to any topic user provide." +
                 "You respond only in json string array."),
                ("human", "Tell me {keyword_count} {topic} keywords."),
            ]
        )

        logger.info(f"Prompt template {prompt_template}")

        # Create the combined chain using LangChain Expression Language (LCEL)
        chain = prompt_template | model | StrOutputParser()

        # Run the chain
        result = chain.invoke({"topic": prompt, "keyword_count": 5})

        logger.info(f"Chain Output: {result}")

        return result
