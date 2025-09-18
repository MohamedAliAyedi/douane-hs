from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from models.auth import UserCreate, UserLogin, Token, User
from core.security import verify_password, get_password_hash, create_access_token
from core.database import users_collection
from core.config import settings
from core.dependencies import get_current_user

router = APIRouter()

@router.post("/register", response_model=User)
async def register(user: UserCreate):
    # Check if user already exists
    if users_collection.find_one({"username": user.username}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password and create user
    hashed_password = get_password_hash(user.password)
    user_doc = {
        "username": user.username,
        "email": user.email,
        "full_name": user.full_name,
        "hashed_password": hashed_password,
        "is_active": True
    }
    
    users_collection.insert_one(user_doc)
    
    return User(
        username=user.username,
        email=user.email,
        full_name=user.full_name,
        is_active=True
    )

@router.post("/login", response_model=Token)
async def login(user_credentials: UserLogin):
    user = users_collection.find_one({"username": user_credentials.username})
    
    if not user or not verify_password(user_credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user["username"]}, expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=User)
async def read_users_me(current_user: dict = Depends(get_current_user)):
    return User(
        username=current_user["username"],
        email=current_user["email"],
        full_name=current_user.get("full_name"),
        is_active=current_user.get("is_active", True)
    )