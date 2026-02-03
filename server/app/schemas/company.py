from typing import Optional, Annotated
from pydantic import BaseModel, EmailStr, Field, BeforeValidator, field_validator, ConfigDict
from datetime import datetime

class CompanyBase(BaseModel):
    name: str
    domain: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    address_street: Optional[str] = None
    address_city: Optional[str] = None
    address_state: Optional[str] = None
    address_country: Optional[str] = None
    address_postal_code: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[str] = None
    linkedin: Optional[str] = None
    description: Optional[str] = None

    @field_validator("email", "website", "domain", "linkedin", mode="before")
    @classmethod
    def empty_string_to_none(cls, v):
        if v == "":
            return None
        return v

class CompanyCreate(CompanyBase):
    pass

class CompanyUpdate(CompanyBase):
    name: Optional[str] = None

class CompanyOut(CompanyBase):
    id: Annotated[str, BeforeValidator(str)] = Field(alias="_id")
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
    )
