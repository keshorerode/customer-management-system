from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from app.models.user import User
from app.schemas.user import UserCreate, UserOut, Token
from app.schemas.auth import UserFirebaseSync
from app.core.security import verify_password, get_password_hash, create_access_token

router = APIRouter()

@router.post("/signup", response_model=UserOut)
async def signup(user_in: UserCreate):
    user = await User.find_one(User.email == user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="User with this email already exists in the system.",
        )
    
    new_user = User(
        email=user_in.email,
        password_hash=get_password_hash(user_in.password),
        first_name=user_in.first_name,
        last_name=user_in.last_name
    )
    await new_user.insert()
    return new_user

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await User.find_one(User.email == form_data.username)
    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(subject=user.email)
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/signup/firebase", response_model=UserOut)
async def signup_firebase(sync_data: UserFirebaseSync):
    user = await User.find_one(User.email == sync_data.email)
    if not user:
        new_user = User(
            email=sync_data.email,
            password_hash="firebase_managed", # Password is managed by Firebase
            first_name=sync_data.first_name,
            last_name=sync_data.last_name
        )
        await new_user.insert()
        return new_user
    
    return user
