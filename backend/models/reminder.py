from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from db.database import Base

class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True)
    medicine_name = Column(String, index=True)
    dosage = Column(String)
    frequency = Column(String)
    duration = Column(String)
    active = Column(Boolean, default=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    
    owner_id = Column(Integer, ForeignKey("users.id"))

    owner = relationship("User", back_populates="reminders")
