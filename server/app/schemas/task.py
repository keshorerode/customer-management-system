from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: str = "Medium"
    status: str = "Todo"
    related_company_id: Optional[str] = None
    related_person_id: Optional[str] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = None
    status: Optional[str] = None

class TaskOut(TaskBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
