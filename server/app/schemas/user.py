from typing import Optional
from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = True
    first_name: Optional[str] = None
    last_name: Optional[str] = None

class UserCreate(UserBase):
    email: EmailStr
    password: str

class UserUpdate(UserBase):
    password: Optional[str] = None

class UserOut(UserBase):
    email: EmailStr

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None
