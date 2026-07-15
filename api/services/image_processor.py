import os
import uuid
from PIL import Image
from io import BytesIO
from fastapi import UploadFile
from api.core.config import settings

def process_and_save_image(file: UploadFile, prefix: str = "img") -> str:
    """Reads an uploaded image, compresses it, saves it to uploads, and returns the URL."""
    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    # Generate unique filename
    filename = f"{prefix}_{uuid.uuid4().hex}.webp"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    
    # Open image using Pillow
    try:
        image = Image.open(file.file)
        
        # Convert to RGB if necessary (e.g. RGBA -> RGB for WEBP/JPEG)
        if image.mode in ("RGBA", "P"):
            image = image.convert("RGB")
        
        # Resize if too large (max 1920x1080)
        image.thumbnail((1920, 1080), Image.Resampling.LANCZOS)
        
        # Save as WEBP with compression
        image.save(filepath, "WEBP", quality=80)
        
    except Exception as e:
        print(f"Error processing image: {e}")
        # Fallback to just saving the raw file if pillow fails
        file.file.seek(0)
        with open(filepath, "wb") as f:
            f.write(file.file.read())
            
    return f"/static/uploads/{filename}"
