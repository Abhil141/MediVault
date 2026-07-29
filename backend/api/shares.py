from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse, RedirectResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Any

from db.database import get_db
from models.user import User
from models.share import ShareLink
from models.document import Document
from schemas.share import ShareCreate, ShareResponse
from schemas.document import DocumentResponse
from api.deps import get_current_user

router = APIRouter()

@router.post("/create", response_model=ShareResponse)
def create_share_link(
    share_in: ShareCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    # Verify document belongs to user
    document = db.query(Document).filter(Document.id == share_in.document_id, Document.owner_id == current_user.id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
        
    expires_at = datetime.utcnow() + timedelta(days=share_in.expires_in_days)
    share = ShareLink(document_id=document.id, expires_at=expires_at)
    db.add(share)
    db.commit()
    db.refresh(share)
    
    return ShareResponse(
        token=share.token,
        expires_at=share.expires_at
    )

@router.get("/{token}", response_model=DocumentResponse)
def get_shared_document(
    token: str,
    db: Session = Depends(get_db)
) -> Any:
    share = db.query(ShareLink).filter(ShareLink.token == token).first()
    if not share:
        raise HTTPException(status_code=404, detail="Invalid share link")
        
    if share.expires_at < datetime.utcnow():
        raise HTTPException(status_code=410, detail="Share link has expired")
        
    return share.document

@router.get("/{token}/download")
def download_shared_document(
    token: str,
    db: Session = Depends(get_db)
) -> Any:
    share = db.query(ShareLink).filter(ShareLink.token == token).first()
    if not share or share.expires_at < datetime.utcnow():
        raise HTTPException(status_code=404, detail="Invalid or expired link")
        
    file_url = share.document.file_url
    if file_url.startswith("/uploads"):
        # Remove leading slash for local relative path
        file_path = file_url.lstrip("/") 
        import os
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="File not found on server")
        # FileResponse securely forces the browser to download it with the exact title as filename
        return FileResponse(
            path=file_path, 
            filename=f"{share.document.title}.pdf", 
            content_disposition_type="attachment"
        )
    
    # If it's an external cloud URL (S3/Cloudinary), redirecting will open/download it natively
    return RedirectResponse(url=file_url)
