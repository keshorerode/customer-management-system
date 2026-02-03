from typing import Optional, Annotated
from pydantic import BaseModel, Field, BeforeValidator, ConfigDict
from datetime import datetime

class LeadThreadBase(BaseModel):
    subject: str
    last_message: str
    status: str = "Unread"
    last_message_at: datetime
    snippet: Optional[str] = None

class LeadThreadOut(LeadThreadBase):
    id: Annotated[str, BeforeValidator(str)] = Field(alias="_id")
    lead_id: str

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
    )
class SyncMailResponse(BaseModel):
    threads_synced: int
    message: str
