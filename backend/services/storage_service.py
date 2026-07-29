import cloudinary
import cloudinary.uploader
from core.config import settings
import os
import shutil

class StorageService:
    def __init__(self):
        self.use_local = not bool(settings.CLOUDINARY_URL)
        if not self.use_local:
            cloudinary.config(
                cloudinary_url=settings.CLOUDINARY_URL
            )
        else:
            # Fallback to local storage for testing if no cloudinary configured
            os.makedirs("uploads", exist_ok=True)

    def upload_file(self, file_path: str, filename: str) -> str:
        if self.use_local:
            dest_path = f"uploads/{filename}"
            shutil.copy(file_path, dest_path)
            return f"/uploads/{filename}" # local path mapping
            
        try:
            result = cloudinary.uploader.upload(file_path)
            return result.get("secure_url")
        except Exception as e:
            print(f"Cloudinary upload failed: {e}")
            return ""

storage_service = StorageService()
