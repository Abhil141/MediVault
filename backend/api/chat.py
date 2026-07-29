from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from models.user import User
from models.chat import ChatSession as ChatSessionModel, ChatMessage as ChatMessageModel
from api.auth import get_current_user
from db.database import get_db
from services.rag_service import rag_service

router = APIRouter()

# --- Pydantic Models ---
class ChatMessageBase(BaseModel):
    role: str
    content: str

class ChatMessageResponse(ChatMessageBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

class ChatSessionResponse(BaseModel):
    id: int
    title: str
    created_at: datetime
    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    answer: str

# --- Endpoints ---
@router.post("/sessions", response_model=ChatSessionResponse)
def create_session(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get all user sessions ordered by creation date descending
    sessions = db.query(ChatSessionModel).filter(ChatSessionModel.user_id == current_user.id).order_by(desc(ChatSessionModel.created_at)).all()
    
    # Enforce limit of 5 sessions max. If 5 or more, delete the oldest.
    if len(sessions) >= 5:
        # Delete sessions starting from the 5th to keep only 4 before adding the new one
        for session_to_delete in sessions[4:]:
            db.delete(session_to_delete)
        db.commit()
    
    new_session = ChatSessionModel(user_id=current_user.id)
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session

@router.get("/sessions", response_model=List[ChatSessionResponse])
def get_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sessions = db.query(ChatSessionModel).filter(ChatSessionModel.user_id == current_user.id).order_by(desc(ChatSessionModel.created_at)).all()
    return sessions

@router.delete("/sessions/{session_id}")
def delete_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(ChatSessionModel).filter(ChatSessionModel.id == session_id, ChatSessionModel.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    db.delete(session)
    db.commit()
    return {"message": "Session deleted"}

class RenameRequest(BaseModel):
    title: str

@router.put("/sessions/{session_id}/rename")
def rename_session(
    session_id: int,
    request: RenameRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(ChatSessionModel).filter(ChatSessionModel.id == session_id, ChatSessionModel.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    session.title = request.title
    db.commit()
    return {"message": "Session renamed successfully"}

@router.get("/sessions/{session_id}/messages", response_model=List[ChatMessageResponse])
def get_session_messages(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session = db.query(ChatSessionModel).filter(ChatSessionModel.id == session_id, ChatSessionModel.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    messages = db.query(ChatMessageModel).filter(ChatMessageModel.session_id == session.id).order_by(ChatMessageModel.created_at).all()
    return messages

@router.post("/sessions/{session_id}/ask", response_model=ChatResponse)
def ask_chatbot(
    session_id: int,
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not request.message:
        raise HTTPException(status_code=400, detail="No input provided")
        
    session = db.query(ChatSessionModel).filter(ChatSessionModel.id == session_id, ChatSessionModel.user_id == current_user.id).first()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Update session title if it's new
    if session.title == "New Conversation" or not session.title:
        try:
            prompt = f"Generate a short 3 to 4 word title for a medical chat that starts with this message: '{request.message}'. Return ONLY the title, no quotes, no extra text."
            # Call Gemini directly for a fast title
            title_response = rag_service.llm.invoke(prompt)
            session.title = title_response.content.strip().strip('"').strip("'")
        except Exception:
            # Fallback
            session.title = request.message[:30] + ("..." if len(request.message) > 30 else "")
        db.commit()

    # Save user message
    user_msg = ChatMessageModel(session_id=session.id, role="user", content=request.message)
    db.add(user_msg)
    db.commit()

    # Fetch history for context
    history_records = db.query(ChatMessageModel).filter(ChatMessageModel.session_id == session.id).order_by(ChatMessageModel.created_at).all()

    # Generate AI response (pass models directly to rag_service)
    answer = rag_service.ask(request.message, history_records)
    
    # Save bot message
    bot_msg = ChatMessageModel(session_id=session.id, role="bot", content=answer)
    db.add(bot_msg)
    db.commit()

    return ChatResponse(answer=answer)
