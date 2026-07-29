from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import datetime
from db.database import Base
import secrets

class ShareLink(Base):
    __tablename__ = "share_links"

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True, default=lambda: secrets.token_urlsafe(16))
    document_id = Column(Integer, ForeignKey("documents.id"))
    expires_at = Column(DateTime)
    
    document = relationship("Document")
