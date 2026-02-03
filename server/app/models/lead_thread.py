from typing import Optional
from beanie import Document, Indexed, Link
from datetime import datetime
from .lead import Lead

class LeadThread(Document):
    lead: Link[Lead]
    subject: str
    last_message: str
    status: str = "Unread" # Unread, Replied, Closed
    last_message_at: datetime = datetime.utcnow()
    snippet: Optional[str] = None
    
    class Settings:
        name = "lead_threads"
