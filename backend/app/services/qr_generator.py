import qrcode
import os
from app.core.config import settings

def generate_qr_code(tracking_id: str, scan_url: str) -> str:
    """Generates a QR code and saves it to the static uploads directory, returning the relative URL."""
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(scan_url)
    qr.make(fit=True)
    
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    filename = f"{tracking_id}.png"
    filepath = os.path.join(settings.UPLOAD_DIR, filename)
    img.save(filepath)
    
    return f"/static/uploads/{filename}"
