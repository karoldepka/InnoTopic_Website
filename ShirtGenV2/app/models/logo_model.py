from pydantic import BaseModel


class Logo(BaseModel):
    name: str
    shortname: str
    url: str
    files: list[str]
