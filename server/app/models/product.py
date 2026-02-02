from typing import Optional
from beanie import Document, Indexed
from datetime import datetime

class Product(Document):
    name: Indexed(str)
    code: Indexed(str) # SKU or Product Code
    description: Optional[str] = None
    price: float = 0.0
    currency: str = "INR"
    category: Optional[str] = None # Software, Service, Hardware, etc.
    status: str = "active" # active, archived
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()

    class Settings:
        name = "products"
