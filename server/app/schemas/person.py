from typing import Optional, Annotated
from pydantic import BaseModel, EmailStr, Field, BeforeValidator, field_validator
from datetime import datetime

class PersonBase(BaseModel):
    first_name: str
    last_name: str
    email: EmailStr
    phone: Optional[str] = None
    mobile: Optional[str] = None
    job_title: Optional[str] = None
    department: Optional[str] = None
    company_id: Optional[str] = None
    linkedin: Optional[str] = None
    avatar_url: Optional[str] = None
    is_primary_contact: bool = False
    notes: Optional[str] = None

    @field_validator("email", "phone", "mobile", "job_title", "department", "company_id", "linkedin", "avatar_url", mode="before")
    @classmethod
    def empty_string_to_none(cls, v):
        if v == "":
            return None
        return v

class PersonCreate(PersonBase):
    pass

class PersonUpdate(PersonBase):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None

class PersonOut(PersonBase):
    id: Annotated[str, BeforeValidator(str)] = Field(alias="_id")
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        populate_by_name = True
