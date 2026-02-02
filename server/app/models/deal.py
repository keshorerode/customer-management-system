from typing import Optional
from beanie import Document, Indexed, Link
from datetime import datetime
from .company import Company
from .person import Person

class Deal(Document):
    title: Indexed(str)
    value: float = 0.0
    currency: str = "INR"
    stage: str = "Qualification" # Qualification, Meeting, Proposal, Negotiation, Closed Won, Closed Lost
    probability: int = 20 # percentage
    expected_close_date: Optional[datetime] = None
    company: Optional[Link[Company]] = None
    contact: Optional[Link[Person]] = None
    description: Optional[str] = None
    owner_id: Optional[str] = None # User UUID
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    class Settings:
        name = "deals"
