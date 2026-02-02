from typing import Optional, List
from beanie import Document, Indexed
from datetime import datetime

class Company(Document):
    name: Indexed(str)
    domain: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None # enum: 1-10 | 11-50 | 51-200 | 201-500 | 500+
    address_street: Optional[str] = None
    address_city: Optional[str] = None
    address_state: Optional[str] = None
    address_country: Optional[str] = None
    address_postal_code: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    linkedin: Optional[str] = None
    description: Optional[str] = None
    logo_url: Optional[str] = None
    created_by: Optional[str] = None # User UUID
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    class Settings:
        name = "companies"
