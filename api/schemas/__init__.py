from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class ShipmentCreate(BaseModel):
    from_location: str
    to_location: str
    description: str
    reference_number: Optional[str] = None
    notes: Optional[str] = None

class ShipmentResponse(BaseModel):
    id: str
    tracking_id: str
    from_location: str
    to_location: str
    description: str
    reference_number: Optional[str] = None
    notes: Optional[str] = None
    qr_code_url: Optional[str] = None
    status: str
    latest_executive: Optional[str] = None
    latest_scan_location: Optional[str] = None
    latest_scan_time: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True

class HandlingEventResponse(BaseModel):
    id: str
    shipment_id: str
    executive_name: str
    package_photo_url: str
    selfie_photo_url: str
    latitude: float
    longitude: float
    accuracy: float
    timestamp: datetime
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class UserLogin(BaseModel):
    username: str
    password: str

class DashboardStats(BaseModel):
    packages_created_today: int
    packages_scanned_today: int
    package_movements_today: int
    active_packages: int
    never_scanned_packages: int
    unique_executives_today: int
    unique_locations_today: int
    
class ChartData(BaseModel):
    labels: List[str]
    datasets: List[dict]
