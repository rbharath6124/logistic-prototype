import base64
from fastapi import UploadFile

def process_and_save_image(file: UploadFile, prefix: str = "img") -> str:
    """Reads an uploaded image and returns a base64 data URL. No Pillow needed."""
    raw_bytes = file.file.read()
    base64_str = base64.b64encode(raw_bytes).decode("utf-8")
    content_type = file.content_type or "image/jpeg"
    return f"data:{content_type};base64,{base64_str}"
