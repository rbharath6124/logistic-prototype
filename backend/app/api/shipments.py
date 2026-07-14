from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database import get_db
from app.models import Shipment, HandlingEvent
from app.schemas import ShipmentCreate, ShipmentResponse, HandlingEventResponse
from app.core.security import get_current_user
from app.services.qr_generator import generate_qr_code

router = APIRouter()

def generate_tracking_id(db: Session):
    count = db.query(Shipment).count()
    return f"SHP-{datetime.now().year}-{count + 1:06d}"

@router.post("/", response_model=ShipmentResponse)
def create_shipment(shipment: ShipmentCreate, request: Request, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    tracking_id = generate_tracking_id(db)
    
    # Assuming the app is deployed, we get the base URL from the request
    base_url = str(request.base_url).rstrip("/")
    scan_url = f"{base_url}/scan/{tracking_id}"
    
    qr_code_url = generate_qr_code(tracking_id, scan_url)
    
    db_shipment = Shipment(
        tracking_id=tracking_id,
        from_location=shipment.from_location,
        to_location=shipment.to_location,
        description=shipment.description,
        reference_number=shipment.reference_number,
        notes=shipment.notes,
        qr_code_url=qr_code_url
    )
    db.add(db_shipment)
    db.commit()
    db.refresh(db_shipment)
    return db_shipment

@router.get("/", response_model=List[ShipmentResponse])
def list_shipments(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    return db.query(Shipment).order_by(Shipment.created_at.desc()).all()

@router.get("/{tracking_id}", response_model=ShipmentResponse)
def get_shipment(tracking_id: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    shipment = db.query(Shipment).filter(Shipment.tracking_id == tracking_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    return shipment

@router.get("/{tracking_id}/timeline", response_model=List[HandlingEventResponse])
def get_shipment_timeline(tracking_id: str, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    shipment = db.query(Shipment).filter(Shipment.tracking_id == tracking_id).first()
    if not shipment:
        raise HTTPException(status_code=404, detail="Shipment not found")
    
    events = db.query(HandlingEvent).filter(HandlingEvent.shipment_id == shipment.id).order_by(HandlingEvent.timestamp.desc()).all()
    return events
