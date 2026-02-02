from typing import Optional
from beanie import Document, Indexed
from pydantic import EmailStr
from datetime import datetime

class User(Document):
    email: Indexed(EmailStr, unique=True)
    password_hash: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    is_active: bool = True
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    class Settings:
        name = "users"
