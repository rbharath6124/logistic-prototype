from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from datetime import datetime
from api.database import get_db
from api.models import Shipment, HandlingEvent
from api.schemas import HandlingEventResponse
from api.services.image_processor import process_and_save_image
import traceback

router = APIRouter()

@router.post("/{tracking_id}")
def submit_handling_event(
    tracking_id: str,
    executive_name: str = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    accuracy: float = Form(...),
    package_photo: UploadFile = File(...),
    selfie_photo: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        shipment = db.query(Shipment).filter(Shipment.tracking_id == tracking_id).first()
        if not shipment:
            raise HTTPException(status_code=404, detail="Shipment not found")
            
        # Process images to base64
        package_photo_url = process_and_save_image(package_photo, prefix="pkg")
        selfie_photo_url = process_and_save_image(selfie_photo, prefix="selfie")
        
        event_timestamp = datetime.utcnow()
        
        # Create Event
        event = HandlingEvent(
            shipment_id=shipment.id,
            executive_name=executive_name,
            package_photo_url=package_photo_url,
            selfie_photo_url=selfie_photo_url,
            latitude=latitude,
            longitude=longitude,
            accuracy=accuracy,
            timestamp=event_timestamp
        )
        db.add(event)
        
        # Update Shipment
        shipment.status = "Package Scanned"
        shipment.latest_executive = executive_name
        shipment.latest_scan_location = f'{{"lat": {latitude}, "lng": {longitude}, "accuracy": {accuracy}}}'
        shipment.latest_scan_time = event_timestamp
        
        db.commit()
        db.refresh(event)
        
        return {
            "id": event.id,
            "shipment_id": event.shipment_id,
            "executive_name": event.executive_name,
            "package_photo_url": "saved",
            "selfie_photo_url": "saved",
            "latitude": event.latitude,
            "longitude": event.longitude,
            "accuracy": event.accuracy,
            "timestamp": str(event.timestamp),
            "created_at": str(event.created_at)
        }
    except HTTPException:
        raise
    except Exception as e:
        tb = traceback.format_exc()
        print(f"Event submission error: {tb}")
        return JSONResponse(status_code=500, content={"detail": str(e), "traceback": tb})
