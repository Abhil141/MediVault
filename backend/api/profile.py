from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import os
import uuid

from models.user import User
from api.auth import get_current_user
from db.database import get_db

router = APIRouter()

class ProfileUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    dob: Optional[str] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    bio: Optional[str] = None

class ProfileResponse(BaseModel):
    id: int
    email: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    dob: Optional[str] = None
    gender: Optional[str] = None
    address: Optional[str] = None
    bio: Optional[str] = None
    profile_picture: Optional[str] = None
    
    class Config:
        from_attributes = True

@router.get("/", response_model=ProfileResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.put("/", response_model=ProfileResponse)
def update_profile(
    update_data: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    update_dict = update_data.dict(exclude_unset=True)
    for key, value in update_dict.items():
        setattr(current_user, key, value)
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/avatar", response_model=ProfileResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Ensure uploads directory exists
    os.makedirs("uploads/avatars", exist_ok=True)
    
    # Generate unique filename
    ext = file.filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = os.path.join("uploads/avatars", filename)
    
    # Save file
    with open(filepath, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
        
    # Update user profile
    # Prepend backend URL or keep it relative so frontend can prepend
    current_user.profile_picture = f"/uploads/avatars/{filename}"
    db.commit()
    db.refresh(current_user)
    
    return current_user
