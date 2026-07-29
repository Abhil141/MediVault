from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Dict, Any

class DocumentBase(BaseModel):
    title: str
    category: str

class DocumentCreate(DocumentBase):
    pass

class DocumentResponse(DocumentBase):
    id: int
    file_url: str
    ai_summary: Optional[str] = None
    medications: List[Dict[str, Any]] = []
    important_terms: List[Dict[str, Any]] = []
    created_at: datetime
    owner_id: int

    class Config:
        from_attributes = True
