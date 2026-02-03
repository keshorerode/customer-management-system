from typing import Optional, Annotated
from pydantic import BaseModel, Field, BeforeValidator, field_validator
from datetime import datetime

class ProductBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    price: float = 0.0
    currency: str = "INR"
    category: Optional[str] = None
    status: str = "active"

    @field_validator("description", "category", mode="before")
    @classmethod
    def empty_string_to_none(cls, v):
        if v == "":
            return None
        return v

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
    id: Annotated[str, BeforeValidator(str)] = Field(alias="_id")
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True
