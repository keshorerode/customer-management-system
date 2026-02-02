from typing import Optional
from beanie import Document, Indexed
from datetime import datetime

class Lead(Document):
    first_name: Indexed(str)
    last_name: Indexed(str)
    email: Indexed(str)
    phone: Optional[str] = None
    company: Optional[str] = None
    source: Optional[str] = "Website" # Website, Referral, Cold Call, LinkedIn
    status: str = "New" # New, Contacted, Qualified, Lost
    notes: Optional[str] = None
    owner_id: Optional[str] = None
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    class Settings:
        name = "leads"
