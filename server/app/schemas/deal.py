from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DealBase(BaseModel):
    title: str
    value: float = 0.0
    currency: str = "INR"
    stage: str = "Qualification"
    probability: int = 20
    expected_close_date: Optional[datetime] = None
    company_id: Optional[str] = None
    contact_id: Optional[str] = None
    description: Optional[str] = None

class DealCreate(DealBase):
    pass

class DealUpdate(BaseModel):
    title: Optional[str] = None
    value: Optional[float] = None
    stage: Optional[str] = None
    probability: Optional[int] = None
    expected_close_date: Optional[datetime] = None

class DealOut(DealBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
