from pydantic import BaseModel
from datetime import datetime

class ShareCreate(BaseModel):
    document_id: int
    expires_in_days: int = 7

class ShareResponse(BaseModel):
    token: str
    expires_at: datetime

    class Config:
        from_attributes = True
