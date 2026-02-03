import asyncio
import os
import json
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from dotenv import load_dotenv

from app.models.user import User
from app.models.company import Company
from app.models.person import Person
from app.models.product import Product
from app.models.deal import Deal
from app.models.task import Task
from app.models.lead import Lead
from app.models.lead_thread import LeadThread
from app.models.note import Note

async def test():
    load_dotenv()
    client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
    await init_beanie(
        database=client[os.getenv("DATABASE_NAME")],
        document_models=[
            User, Company, Person, Product, Deal, Task, Lead, LeadThread, Note
        ]
    )
    
    print("=== Testing People API logic ===\n")
    
    # Get all people with fetch_links
    people = await Person.find_all(fetch_links=True).to_list()
    
    for p in people:
        print(f"Person: {p.first_name} {p.last_name}")
        print(f"  p.company is None: {p.company is None}")
        print(f"  type(p.company): {type(p.company)}")
        
        if p.company is not None:
            print(f"  hasattr(p.company, 'ref'): {hasattr(p.company, 'ref')}")
            print(f"  hasattr(p.company, 'id'): {hasattr(p.company, 'id')}")
            
            if hasattr(p.company, 'ref') and p.company.ref is not None:
                print(f"  p.company.ref.id: {p.company.ref.id}")
            if hasattr(p.company, 'id') and p.company.id is not None:
                print(f"  p.company.id: {p.company.id}")
            if hasattr(p.company, 'name'):
                print(f"  p.company.name: {p.company.name}")
        print()
    
if __name__ == "__main__":
    asyncio.run(test())
