from app.services.langchain_service import process_text

def test_process_text():
    result = process_text("Hello, LangChain!")
    assert result == "processed text"
    