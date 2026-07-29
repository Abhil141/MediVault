from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class HealthDataCreate(BaseModel):
    heartRate: Optional[int] = None
    heartRateDate: Optional[str] = None
    heartRateDay: Optional[str] = None
    spO2: Optional[int] = None
    spO2Date: Optional[str] = None
    spO2Day: Optional[str] = None
    steps: Optional[int] = None
    stepsDate: Optional[str] = None
    stepsDay: Optional[str] = None
    sleepDuration: Optional[float] = None
    sleepDate: Optional[str] = None
    sleepDay: Optional[str] = None
    calories: Optional[int] = None
    caloriesDate: Optional[str] = None
    caloriesDay: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    bmi: Optional[float] = None

class HealthDataResponse(HealthDataCreate):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
