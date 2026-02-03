from typing import Optional, Annotated
from pydantic import BaseModel, EmailStr, Field, BeforeValidator, field_validator
from datetime import datetime

class LeadBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    source: Optional[str] = "Website"
    status: str = "New"
    notes: Optional[str] = None

    @field_validator("email", "phone", "company", "notes", mode="before")
    @classmethod
    def empty_string_to_none(cls, v):
        if v == "":
            return None
        return v

class LeadCreate(LeadBase):
    pass

class LeadUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    company: Optional[str] = None
    source: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None

class LeadOut(LeadBase):
    id: Annotated[str, BeforeValidator(str)] = Field(alias="_id")
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True
