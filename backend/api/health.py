from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from db.database import get_db
from models.health_data import HealthData
from models.user import User
from schemas.health import HealthDataCreate, HealthDataResponse
from api.auth import get_current_user

router = APIRouter()

@router.post("/", response_model=HealthDataResponse)
def create_health_data(
    data: HealthDataCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    health_entry = HealthData(**data.dict(), user_id=current_user.id)
    db.add(health_entry)
    db.commit()
    db.refresh(health_entry)
    return health_entry

@router.get("/", response_model=List[HealthDataResponse])
def get_health_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return db.query(HealthData).filter(HealthData.user_id == current_user.id).all()

@router.delete("/")
def clear_health_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(HealthData).filter(HealthData.user_id == current_user.id).delete()
    db.commit()
    return {"message": "Health data cleared successfully"}

@router.delete("/by-date")
def delete_health_data_by_date(
    date: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(HealthData).filter(
        HealthData.user_id == current_user.id,
        (HealthData.heartRateDate == date) |
        (HealthData.spO2Date == date) |
        (HealthData.stepsDate == date) |
        (HealthData.sleepDate == date) |
        (HealthData.caloriesDate == date)
    ).delete()
    db.commit()
    return {"message": f"Data for date {date} deleted successfully"}

@router.delete("/{item_id}")
def delete_health_data_by_id(
    item_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    entry = db.query(HealthData).filter(
        HealthData.id == item_id,
        HealthData.user_id == current_user.id
    ).first()
    
    if not entry:
        raise HTTPException(status_code=404, detail="Health data entry not found")
        
    db.delete(entry)
    db.commit()
    return {"message": "Health data entry deleted successfully"}
