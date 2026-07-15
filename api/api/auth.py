from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from api.database import get_db
from api.models import AdminUser
from api.schemas import Token, UserLogin
from api.core.security import verify_password, create_access_token

router = APIRouter()

@router.post("/login", response_model=Token)
def login_for_access_token(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(AdminUser).filter(AdminUser.username == user_data.username).first()
    if not user or not verify_password(user_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}
