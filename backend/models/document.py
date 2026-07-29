from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func, JSON
from sqlalchemy.orm import relationship
from db.database import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    category = Column(String, index=True)  # Prescription, Blood Test, Radiology, etc.
    file_url = Column(String, nullable=False)
    extracted_text = Column(Text)
    ai_summary = Column(Text)
    medications = Column(JSON, default=list) # List of extracted medications
    important_terms = Column(JSON, default=list) # List of medical terms
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    owner = relationship("User", back_populates="documents")
