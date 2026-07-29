from sqlalchemy import Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship
from db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    first_name = Column(String)
    last_name = Column(String)
    phone = Column(String)
    dob = Column(String)
    gender = Column(String)
    address = Column(String)
    bio = Column(String)
    profile_picture = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    documents = relationship("Document", back_populates="owner")
    reminders = relationship("Reminder", back_populates="owner")
    health_data = relationship("HealthData", back_populates="owner")
    chat_sessions = relationship("ChatSession", back_populates="owner")
