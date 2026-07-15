from sqlalchemy import Column, String, Float, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship
import uuid
import datetime
from api.database import Base

def generate_uuid():
    return str(uuid.uuid4())

class AdminUser(Base):
    __tablename__ = "admin_users"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    username = Column(String, unique=True, index=True)
    password_hash = Column(String)
    # Fields to support Google OAuth later
    google_id = Column(String, unique=True, index=True, nullable=True)
    email = Column(String, unique=True, index=True, nullable=True)

class Shipment(Base):
    __tablename__ = "shipments"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    tracking_id = Column(String, unique=True, index=True, nullable=False)
    from_location = Column(String, nullable=False)
    to_location = Column(String, nullable=False)
    description = Column(String, nullable=False)
    reference_number = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    qr_code_url = Column(String, nullable=True)
    
    status = Column(String, default="Created")
    latest_executive = Column(String, nullable=True)
    latest_scan_location = Column(String, nullable=True)
    latest_scan_time = Column(DateTime, nullable=True)
    
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    events = relationship("HandlingEvent", back_populates="shipment", cascade="all, delete-orphan")

class HandlingEvent(Base):
    __tablename__ = "handling_events"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    shipment_id = Column(String, ForeignKey("shipments.id"), nullable=False)
    
    executive_name = Column(String, nullable=False)
    package_photo_url = Column(String, nullable=False)
    selfie_photo_url = Column(String, nullable=False)
    
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    accuracy = Column(Float, nullable=False)
    
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    shipment = relationship("Shipment", back_populates="events")
