from typing import Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

class CompanyBase(BaseModel):
    name: str
    domain: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    address_street: Optional[str] = None
    address_city: Optional[str] = None
    address_state: Optional[str] = None
    address_country: Optional[str] = None
    address_postal_code: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[str] = None
    linkedin: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(CompanyBase):
    name: Optional[str] = None

class CompanyOut(CompanyBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
