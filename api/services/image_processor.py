import base64
import io
import uuid
from PIL import Image
from fastapi import UploadFile

def process_and_save_image(file: UploadFile, prefix: str = "img") -> str:
    """Reads an uploaded image, compresses it, and returns a base64 data URL."""
    try:
        image = Image.open(file.file)
        
        # Convert to RGB if necessary
        if image.mode in ("RGBA", "P"):
            image = image.convert("RGB")
        
        # Resize if too large (max 800x600 for demo to keep DB manageable)
        image.thumbnail((800, 600), Image.Resampling.LANCZOS)
        
        # Save to in-memory buffer as WEBP
        buffer = io.BytesIO()
        image.save(buffer, "WEBP", quality=60)
        buffer.seek(0)
        base64_str = base64.b64encode(buffer.getvalue()).decode("utf-8")
        
        return f"data:image/webp;base64,{base64_str}"
        
    except Exception as e:
        print(f"Error processing image: {e}")
        # Fallback: read raw bytes and encode
        file.file.seek(0)
        raw_bytes = file.file.read()
        base64_str = base64.b64encode(raw_bytes).decode("utf-8")
        content_type = file.content_type or "image/jpeg"
        return f"data:{content_type};base64,{base64_str}"
