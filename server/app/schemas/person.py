from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

class PersonBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    mobile: Optional[str] = None
    job_title: Optional[str] = None
    department: Optional[str] = None
    company_id: Optional[str] = None
    linkedin: Optional[str] = None
    avatar_url: Optional[str] = None
    is_primary_contact: bool = False
    notes: Optional[str] = None

class PersonCreate(PersonBase):
    pass

class PersonUpdate(PersonBase):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None

class PersonOut(PersonBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
