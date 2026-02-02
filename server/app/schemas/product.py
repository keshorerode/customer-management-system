from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProductBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    price: float = 0.0
    currency: str = "INR"
    category: Optional[str] = None
    status: str = "active"

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    currency: Optional[str] = None
    category: Optional[str] = None
    status: Optional[str] = None

class ProductOut(ProductBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
