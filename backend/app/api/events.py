from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy.orm import Session
from datetime import datetime
from app.database import get_db
from app.models import Shipment, HandlingEvent
from app.schemas import HandlingEventResponse
from app.services.image_processor import process_and_save_image
import json

router = APIRouter()

@router.post("/{tracking_id}", response_model=HandlingEventResponse)
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
    shipment = db.query(Shipment).filter(Shipment.tracking_id == tracking_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
        
    # Process images
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
    shipment.latest_scan_location = json.dumps({"lat": latitude, "lng": longitude, "accuracy": accuracy})
    shipment.latest_scan_time = event_timestamp
    
    db.commit()
    db.refresh(event)
    
    return event
