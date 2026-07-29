from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any, List

from db.database import get_db
from models.user import User
from models.reminder import Reminder
from schemas.reminder import ReminderCreate, ReminderResponse
from api.deps import get_current_user

router = APIRouter()

@router.post("/", response_model=ReminderResponse)
def create_reminder(
    reminder_in: ReminderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    # Check for existing duplicate reminder
    existing_reminder = db.query(Reminder).filter(
        Reminder.owner_id == current_user.id,
        Reminder.medicine_name == reminder_in.medicine_name,
        Reminder.document_id == reminder_in.document_id
    ).first()
    
    if existing_reminder:
        # If it exists, make sure it's active and return it
        existing_reminder.active = True
        db.commit()
        db.refresh(existing_reminder)
        return existing_reminder
        
    reminder = Reminder(
        **reminder_in.model_dump(),
        owner_id=current_user.id
    )
    db.add(reminder)
    db.commit()
    db.refresh(reminder)
    return reminder

@router.get("/", response_model=List[ReminderResponse])
def read_reminders(
    skip: int = 0, limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    reminders = db.query(Reminder).filter(Reminder.owner_id == current_user.id).offset(skip).limit(limit).all()
    return reminders

@router.put("/{reminder_id}/toggle", response_model=ReminderResponse)
def toggle_reminder(
    reminder_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    reminder = db.query(Reminder).filter(Reminder.id == reminder_id, Reminder.owner_id == current_user.id).first()
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    
    reminder.active = not reminder.active
    db.commit()
    db.refresh(reminder)
    return reminder

@router.delete("/{reminder_id}")
def delete_reminder(
    reminder_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    reminder = db.query(Reminder).filter(Reminder.id == reminder_id, Reminder.owner_id == current_user.id).first()
    if not reminder:
        raise HTTPException(status_code=404, detail="Reminder not found")
    
    db.delete(reminder)
    db.commit()
    return {"message": "Reminder deleted successfully"}
