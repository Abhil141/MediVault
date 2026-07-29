from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from db.database import Base

class HealthData(Base):
    __tablename__ = "healthdata"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    # Heart Rate
    heartRate = Column(Integer, nullable=True)
    heartRateDate = Column(String, nullable=True)
    heartRateDay = Column(String, nullable=True)
    
    # SpO2
    spO2 = Column(Integer, nullable=True)
    spO2Date = Column(String, nullable=True)
    spO2Day = Column(String, nullable=True)
    
    # Steps
    steps = Column(Integer, nullable=True)
    stepsDate = Column(String, nullable=True)
    stepsDay = Column(String, nullable=True)
    
    # Sleep
    sleepDuration = Column(Float, nullable=True)
    sleepDate = Column(String, nullable=True)
    sleepDay = Column(String, nullable=True)
    
    # Calories
    calories = Column(Integer, nullable=True)
    caloriesDate = Column(String, nullable=True)
    caloriesDay = Column(String, nullable=True)
    
    # Body Vitals
    height = Column(Float, nullable=True)
    weight = Column(Float, nullable=True)
    bmi = Column(Float, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    owner = relationship("User", back_populates="health_data")
