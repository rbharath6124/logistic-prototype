import os
import sys

# Ensure backend root is in sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database import SessionLocal
from app.models import AdminUser
from app.core.security import get_password_hash

def create_admin():
    db = SessionLocal()
    
    # Check if admin already exists
    existing = db.query(AdminUser).filter(AdminUser.username == "admin").first()
    if existing:
        print("Admin user already exists.")
        return
        
    admin = AdminUser(
        username="admin",
        password_hash=get_password_hash("admin123")
    )
    db.add(admin)
    db.commit()
    print("Admin user created successfully. Username: admin, Password: admin123")

if __name__ == "__main__":
    create_admin()
