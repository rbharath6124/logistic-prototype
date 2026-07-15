from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from fastapi.templating import Jinja2Templates
from api.api import auth, shipments, events, stats
from api.core.config import settings
from api.database import engine, Base
from api.models import Shipment
import os

app = FastAPI(title=settings.PROJECT_NAME)

@app.on_event("startup")
def on_startup():
    from api.database import engine, Base, SessionLocal
    from api.models import AdminUser
    from api.core.security import get_password_hash
    
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    # Create admin
    db = SessionLocal()
    if not db.query(AdminUser).filter_by(username="admin").first():
        admin = AdminUser(
            username="admin",
            hashed_password=get_password_hash("admin123")
        )
        db.add(admin)
        db.commit()
    db.close()

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For dev only, specify React URL in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Ensure uploads directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/static/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")
# app.mount("/static", StaticFiles(directory="app/static"), name="static")

templates = Jinja2Templates(directory=os.path.join(os.path.dirname(__file__), "templates"))

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(shipments.router, prefix=f"{settings.API_V1_STR}/shipments", tags=["shipments"])
app.include_router(events.router, prefix=f"{settings.API_V1_STR}/events", tags=["events"])
app.include_router(stats.router, prefix=f"{settings.API_V1_STR}/stats", tags=["stats"])

@app.get("/scan/{tracking_id}")
async def scan_page(request: Request, tracking_id: str):
    # Pass tracking_id to lightweight HTML template
    # Even if shipment isn't checked here, it will be checked on submission.
    # To improve UX, we can check if it exists:
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
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
