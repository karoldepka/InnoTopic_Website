from pydantic import BaseModel

class UserSettingsRequest(BaseModel):
    user_id: str
    settings: dict
