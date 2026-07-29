from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Any, List
import tempfile
import os

from db.database import get_db
from models.user import User
from models.document import Document
from schemas.document import DocumentResponse
from api.deps import get_current_user
from services.ai_service import ai_service
from services.storage_service import storage_service
from models.reminder import Reminder
from models.share import ShareLink

router = APIRouter()

@router.post("/", response_model=DocumentResponse)
def upload_document(
    title: str = Form(...),
    category: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    # 1. Save file temporarily
    temp_dir = tempfile.mkdtemp()
    temp_path = os.path.join(temp_dir, file.filename)
    
    with open(temp_path, "wb") as f:
        content = file.file.read()
        f.write(content)
        
    # 2. Upload to Cloudinary (or local)
    file_url = storage_service.upload_file(temp_path, file.filename)
    
    # 3. Extract Text from PDF
    extracted_text = ""
    try:
        if file.filename.endswith(".pdf"):
            from pypdf import PdfReader
            reader = PdfReader(temp_path)
            for page in reader.pages:
                extracted_text += page.extract_text() + "\n"
        else:
            extracted_text = "Unsupported file format for direct text extraction. Assuming image or unreadable."
    except Exception as e:
        print(f"Error extracting text: {e}")
        extracted_text = f"Failed to extract text from document: {str(e)}"
        
    if not extracted_text.strip():
        extracted_text = "No readable text found in document."
    
    # 4. AI Analysis
    analysis = ai_service.analyze_document(extracted_text)
    
    # 5. Save to DB
    doc = Document(
        title=title,
        category=analysis.get("category") or category,
        file_url=file_url,
        extracted_text=extracted_text,
        ai_summary=analysis.get("ai_summary", analysis.get("summary", "")),
        medications=analysis.get("medications", []),
        important_terms=analysis.get("important_terms", []),
        owner_id=current_user.id
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    
    # cleanup temp
    os.remove(temp_path)
    os.rmdir(temp_dir)
    
    return doc

@router.get("/", response_model=List[DocumentResponse])
def read_documents(
    skip: int = 0, limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    docs = db.query(Document).filter(Document.owner_id == current_user.id).offset(skip).limit(limit).all()
    return docs

@router.get("/{document_id}", response_model=DocumentResponse)
def read_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    doc = db.query(Document).filter(Document.id == document_id, Document.owner_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return doc

@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    document = db.query(Document).filter(Document.id == document_id, Document.owner_id == current_user.id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
        
    # Delete dependent records first to avoid foreign key constraints
    db.query(Reminder).filter(Reminder.document_id == document_id).delete()
    db.query(ShareLink).filter(ShareLink.document_id == document_id).delete()
    
    db.delete(document)
    db.commit()
    return {"message": "Document deleted successfully"}

class CompareRequest(BaseModel):
    doc1_id: int
    doc2_id: int

@router.post("/compare")
async def compare_documents(
    request: CompareRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Any:
    doc1 = db.query(Document).filter(Document.id == request.doc1_id, Document.owner_id == current_user.id).first()
    doc2 = db.query(Document).filter(Document.id == request.doc2_id, Document.owner_id == current_user.id).first()
    
    if not doc1 or not doc2:
        raise HTTPException(status_code=404, detail="One or both documents not found")
        
    try:
        comparison_markdown = await ai_service.compare_documents(
            doc1_text=doc1.extracted_text, 
            doc2_text=doc2.extracted_text,
            doc1_title=doc1.title,
            doc2_title=doc2.title
        )
        return {"markdown": comparison_markdown}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
