from typing import Optional
from beanie import Document, Indexed
from datetime import datetime

class Note(Document):
    title: Optional[str] = None
    content: str
    is_pinned: bool = False
    related_to_type: str # company, deal, lead, person, task, product
    related_to_id: str # The ID of the related entity as string
    created_by: Optional[str] = None # User UUID
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    class Settings:
        name = "notes"
