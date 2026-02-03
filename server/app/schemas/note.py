from typing import Optional, Annotated
from pydantic import BaseModel, ConfigDict, Field, BeforeValidator
from datetime import datetime

# Represents a PydanticObjectId as a string in the schema
PyObjectId = Annotated[str, BeforeValidator(str)]

class NoteBase(BaseModel):
    title: Optional[str] = None
    content: str
    is_pinned: bool = False
    related_to_type: str
    related_to_id: str

class NoteCreate(NoteBase):
    pass

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    is_pinned: Optional[bool] = None

class NoteOut(NoteBase):
    id: PyObjectId = Field(alias="_id")
    created_by: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(
        populate_by_name=True,
        json_schema_extra={
            "example": {
                "title": "Meeting Notes",
                "content": "Discussed the new proposal...",
                "is_pinned": False,
                "related_to_type": "company",
                "related_to_id": "507f1f77bcf86cd799439011"
            }
        }
    )
