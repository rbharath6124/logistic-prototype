from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from api.api import auth, shipments, events, stats
from api.core.config import settings
from api.database import engine, Base, SessionLocal
from api.models import Shipment, AdminUser
from api.core.security import get_password_hash
import os

app = FastAPI(title=settings.PROJECT_NAME)

# --- Database Initialization (runs on module load for Vercel) ---
try:
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    existing_admin = db.query(AdminUser).filter_by(username="admin").first()
    if not existing_admin:
        admin = AdminUser(
            username="admin",
            password_hash=get_password_hash("admin123")
        )
        db.add(admin)
        db.commit()
    db.close()
except Exception as e:
    print(f"DB init error: {e}")

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

# Mount uploads for serving static files
try:
    app.mount("/static/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")
except Exception:
    pass

templates = Jinja2Templates(directory=os.path.join(os.path.dirname(__file__), "templates"))

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(shipments.router, prefix=f"{settings.API_V1_STR}/shipments", tags=["shipments"])
app.include_router(events.router, prefix=f"{settings.API_V1_STR}/events", tags=["events"])
app.include_router(stats.router, prefix=f"{settings.API_V1_STR}/stats", tags=["stats"])

@app.get("/api/health")
async def health_check():
    """Debug endpoint to verify the API is working."""
    try:
        db = SessionLocal()
        admin_count = db.query(AdminUser).count()
        db.close()
        return {"status": "ok", "admin_users": admin_count, "db_url": settings.DATABASE_URL}
    except Exception as e:
        return {"status": "error", "detail": str(e)}

@app.get("/scan/{tracking_id}")
async def scan_page(request: Request, tracking_id: str):
    from api.database import SessionLocal
    db = SessionLocal()
    shipment = db.query(Shipment).filter(Shipment.tracking_id == tracking_id).first()
    db.close()
    
    if not shipment:
        return templates.TemplateResponse(request, "error.html", {"message": "Invalid Tracking ID"})
        
    return templates.TemplateResponse(request, "scan.html", {
        "tracking_id": tracking_id,
        "shipment": shipment
    })

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api.index:app", host="0.0.0.0", port=8000, reload=True)
