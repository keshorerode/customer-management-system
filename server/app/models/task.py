from typing import Optional
from beanie import Document, Indexed, Link
from datetime import datetime
from .company import Company
from .person import Person

class Task(Document):
    title: Indexed(str)
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: str = "Medium" # Low, Medium, High, Urgent
    status: str = "Todo" # Todo, In Progress, Completed, Archived
    related_to_type: Optional[str] = None # company, deal, lead, person
    related_to_id: Optional[str] = None
    owner_id: Optional[str] = None # User UUID
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    class Settings:
        name = "tasks"
