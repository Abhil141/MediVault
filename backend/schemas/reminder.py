from pydantic import BaseModel
from typing import Optional

class ReminderBase(BaseModel):
    medicine_name: str
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    duration: Optional[str] = None
    active: bool = True
    document_id: Optional[int] = None

class ReminderCreate(ReminderBase):
    pass

class ReminderResponse(ReminderBase):
    id: int
    owner_id: int

    class Config:
        from_attributes = True
