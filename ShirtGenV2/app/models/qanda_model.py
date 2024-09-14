from pydantic import BaseModel


class QAndA(BaseModel):
    question: str
    answer: str
    # files: list[str]
