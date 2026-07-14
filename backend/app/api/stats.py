from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from app.database import get_db
from app.models import Shipment, HandlingEvent
from app.schemas import DashboardStats
from app.core.security import get_current_user

router = APIRouter()

@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard_stats(db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    today = datetime.utcnow().date()
    start_of_today = datetime(today.year, today.month, today.day)
    
    packages_created_today = db.query(Shipment).filter(Shipment.created_at >= start_of_today).count()
    
    packages_scanned_today = db.query(Shipment).filter(Shipment.latest_scan_time >= start_of_today).count()
    
    package_movements_today = db.query(HandlingEvent).filter(HandlingEvent.timestamp >= start_of_today).count()
    
    active_packages = db.query(Shipment).filter(Shipment.status != "Created").count()
    
    never_scanned_packages = db.query(Shipment).filter(Shipment.status == "Created").count()
    
    unique_executives_today = db.query(HandlingEvent.executive_name).filter(HandlingEvent.timestamp >= start_of_today).distinct().count()
    
    unique_locations_today = db.query(HandlingEvent.latitude, HandlingEvent.longitude).filter(HandlingEvent.timestamp >= start_of_today).distinct().count()
    
    return DashboardStats(
        packages_created_today=packages_created_today,
        packages_scanned_today=packages_scanned_today,
        package_movements_today=package_movements_today,
        active_packages=active_packages,
        never_scanned_packages=never_scanned_packages,
        unique_executives_today=unique_executives_today,
        unique_locations_today=unique_locations_today
    )
