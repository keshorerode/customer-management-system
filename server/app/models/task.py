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
    related_company: Optional[Link[Company]] = None
    related_person: Optional[Link[Person]] = None
    owner_id: Optional[str] = None # User UUID
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    class Settings:
        name = "tasks"
