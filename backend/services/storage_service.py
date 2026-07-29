import cloudinary
import cloudinary.uploader
from core.config import settings
import os
import shutil
import boto3

class StorageService:
    def __init__(self):
        self.use_cloudinary = bool(settings.CLOUDINARY_URL)
        
        self.aws_access_key = os.getenv("AWS_ACCESS_KEY_ID")
        self.aws_secret_key = os.getenv("AWS_SECRET_ACCESS_KEY")
        self.aws_bucket = os.getenv("AWS_BUCKET_NAME")
        self.aws_region = os.getenv("AWS_REGION", "us-east-1")
        self.aws_endpoint = os.getenv("AWS_ENDPOINT_URL")
        
        self.use_s3 = bool(self.aws_access_key and self.aws_secret_key and self.aws_bucket)
        
        if self.use_cloudinary:
            cloudinary.config(cloudinary_url=settings.CLOUDINARY_URL)
            
        if self.use_s3:
            self.s3_client = boto3.client(
                "s3",
                aws_access_key_id=self.aws_access_key,
                aws_secret_access_key=self.aws_secret_key,
                region_name=self.aws_region,
                endpoint_url=self.aws_endpoint
            )
            
        if not self.use_cloudinary and not self.use_s3:
            # Fallback to local storage
            os.makedirs("uploads", exist_ok=True)

    def upload_file(self, file_path: str, filename: str) -> str:
        if self.use_s3:
            try:
                self.s3_client.upload_file(file_path, self.aws_bucket, filename)
                if self.aws_endpoint:
                    return f"{self.aws_endpoint}/{self.aws_bucket}/{filename}"
                return f"https://{self.aws_bucket}.s3.{self.aws_region}.amazonaws.com/{filename}"
            except Exception as e:
                print(f"S3 upload failed: {e}")
                return ""
                
        if self.use_cloudinary:
            try:
                result = cloudinary.uploader.upload(file_path)
                return result.get("secure_url")
            except Exception as e:
                print(f"Cloudinary upload failed: {e}")
                return ""
                
        # Local fallback
        dest_path = f"uploads/{filename}"
        shutil.copy(file_path, dest_path)
        return f"/uploads/{filename}"

storage_service = StorageService()
