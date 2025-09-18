import os
import shutil
from typing import List
from fastapi import UploadFile

def create_directory(path: str):
    """Create directory if it doesn't exist."""
    os.makedirs(path, exist_ok=True)

def remove_file(file_path: str):
    """Remove file if it exists."""
    if os.path.exists(file_path):
        os.remove(file_path)

def get_file_size(file_path: str) -> int:
    """Get file size in bytes."""
    return os.path.getsize(file_path)

def copy_file(src: str, dst: str):
    """Copy file from source to destination."""
    shutil.copy2(src, dst)

async def save_upload_file(upload_file: UploadFile, destination: str) -> str:
    """Save uploaded file to destination."""
    create_directory(os.path.dirname(destination))
    
    with open(destination, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    
    return destination

def validate_file_extension(filename: str, allowed_extensions: List[str]) -> bool:
    """Validate if file has allowed extension."""
    return any(filename.lower().endswith(ext.lower()) for ext in allowed_extensions)