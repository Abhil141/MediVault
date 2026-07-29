from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from db.database import engine, Base
from api import auth, documents, reminders, shares, health, chat, profile

# Create tables (for local dev without Alembic for now to be fast)
Base.metadata.create_all(bind=engine)

os.makedirs("uploads", exist_ok=True)

app = FastAPI(title="MediVault API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(documents.router, prefix="/api/documents", tags=["documents"])
app.include_router(reminders.router, prefix="/api/reminders", tags=["reminders"])
app.include_router(shares.router, prefix="/api/shares", tags=["shares"])
app.include_router(health.router, prefix="/api/health-data", tags=["health"])
app.include_router(chat.router, prefix="/api/chat", tags=["chat"])
app.include_router(profile.router, prefix="/api/profile", tags=["profile"])

@app.get("/api/health")
def health_check():
    return {"status": "ok"}
