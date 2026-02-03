import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from dotenv import load_dotenv

async def test():
    load_dotenv()
    
    # Import models AFTER load_dotenv
    from app.models.user import User
    from app.models.company import Company
    from app.models.person import Person
    from app.models.product import Product
    from app.models.deal import Deal
    from app.models.task import Task
    from app.models.lead import Lead
    from app.models.lead_thread import LeadThread
    from app.models.note import Note
    
    client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
    db = client[os.getenv("DATABASE_NAME")]
    
    await init_beanie(
        database=db,
        document_models=[
            User, Company, Person, Product, Deal, Task, Lead, LeadThread, Note
        ]
    )
    
    print("=== Beanie Query with fetch_links=True ===\n")
    
    people = await Person.find_all(fetch_links=True).to_list()
    
    for p in people:
        print(f"Person: {p.first_name} {p.last_name}")
        print(f"  p.company: {p.company}")
        print(f"  type(p.company): {type(p.company)}")
        
        if p.company is not None:
            # Check if it's a Company document
            if isinstance(p.company, Company):
                print(f"  It's a Company document!")
                print(f"  p.company.id: {p.company.id}")
                print(f"  p.company.name: {p.company.name}")
            else:
                print(f"  It's NOT a Company document")
                # Check all attributes
                print(f"  dir(p.company): {[x for x in dir(p.company) if not x.startswith('_')]}")
        print()

if __name__ == "__main__":
    asyncio.run(test())
