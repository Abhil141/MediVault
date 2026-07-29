from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from typing import Any
from fastapi.security import OAuth2PasswordRequestForm

from db.database import get_db
from core.security import verify_password, get_password_hash, create_access_token
from core.config import settings
from models.user import User
from schemas.user import UserCreate, UserResponse, Token, ChangePassword, ForgotPasswordRequest, ResetPasswordRequest
from api.deps import get_current_user
import secrets

router = APIRouter()

# In-memory store for demo reset tokens (email -> token)
reset_tokens = {}

@router.post("/register", response_model=UserResponse)
def register(user_in: UserCreate, db: Session = Depends(get_db)) -> Any:
    user = db.query(User).filter(User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this email already exists in the system.",
        )
    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        first_name=user_in.first_name,
        last_name=user_in.last_name,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.post("/login", response_model=Token)
def login(db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()) -> Any:
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)) -> Any:
    return current_user

@router.put("/change-password")
def change_password(
    password_data: ChangePassword,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    if not verify_password(password_data.current_password, current_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    current_user.hashed_password = get_password_hash(password_data.new_password)
    db.commit()
    return {"message": "Password changed successfully"}

@router.post("/forgot-password")
def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
) -> Any:
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        # Prevent email enumeration by returning a success-like message anyway
        return {"message": "If that email is in our system, a reset link has been sent.", "token": None}
    
    # Generate a simple 6-digit mock token
    token = str(secrets.randbelow(900000) + 100000)
    reset_tokens[request.email] = token
    
    # Send the email
    from utils.email import send_reset_email
    send_reset_email(request.email, token)
    
    return {"message": "If that email is in our system, a reset link has been sent."}

@router.post("/reset-password")
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
) -> Any:
    # Find the email for this token
    target_email = None
    for email, stored_token in reset_tokens.items():
        if stored_token == request.token:
            target_email = email
            break
            
    if not target_email:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token")
        
    user = db.query(User).filter(User.email == target_email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    user.hashed_password = get_password_hash(request.new_password)
    db.commit()
    
    # Invalidate token
    del reset_tokens[target_email]
    
    return {"message": "Password has been reset successfully"}
