from pydantic import BaseModel, EmailStr
from typing import Optional

class UserFirebaseSync(BaseModel):
    email: EmailStr
    first_name: str
    last_name: str
    firebase_id_token: str
