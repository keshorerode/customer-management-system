from typing import Optional
from beanie import Document, Indexed, Link
from pydantic import EmailStr
from datetime import datetime
from .company import Company

class Person(Document):
    first_name: str
    last_name: str
    email: Indexed(EmailStr, unique=True)
    phone: Optional[str] = None
    mobile: Optional[str] = None
    job_title: Optional[str] = None
    department: Optional[str] = None
    company: Optional[Link[Company]] = None
    linkedin: Optional[str] = None
    avatar_url: Optional[str] = None
    is_primary_contact: bool = False
    notes: Optional[str] = None
    created_by: Optional[str] = None # User UUID
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    class Settings:
        name = "people"
