from typing import Optional, Annotated
from pydantic import BaseModel, Field, BeforeValidator, field_validator, ConfigDict
from datetime import datetime

class DealBase(BaseModel):
    title: str
    value: float
    stage: str = "Discovery" # Discovery, Proposal, Negotiation, Won, Lost
    expected_close_date: Optional[datetime] = None
    probability: int = 20
    company_id: Optional[str] = None
    contact_id: Optional[str] = None
    description: Optional[str] = None

    @field_validator("expected_close_date", "company_id", "contact_id", "description", mode="before")
    @classmethod
    def empty_string_to_none(cls, v):
        if v == "":
            return None
        return v

class DealCreate(DealBase):
    pass

class DealUpdate(BaseModel):
    title: Optional[str] = None
    value: Optional[float] = None
    stage: Optional[str] = None
    expected_close_date: Optional[datetime] = None
    probability: Optional[int] = None
    description: Optional[str] = None

class DealOut(DealBase):
    id: Annotated[str, BeforeValidator(str)] = Field(alias="_id")
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
    )
