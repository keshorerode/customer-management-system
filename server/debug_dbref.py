"""
Debug script to check DBRef attribute access methods.
This script helps diagnose how Beanie stores and accesses MongoDB Link references.
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv


async def test():
    load_dotenv()
    
    # Validate required environment variables
    mongodb_url = os.getenv("MONGODB_URL")
    database_name = os.getenv("DATABASE_NAME")
    
    if not mongodb_url:
        print("ERROR: MONGODB_URL environment variable is not set")
        return
    
    if not database_name:
        print("ERROR: DATABASE_NAME environment variable is not set")
        return
    
    client = None
    try:
        client = AsyncIOMotorClient(mongodb_url)
        db = client[database_name]
        
        # Perform a lightweight connectivity check
        await client.admin.command('ping')
        print("Successfully connected to MongoDB\n")
        
        print("=== DBRef attribute check ===\n")
        
        people_coll = db["people"]
        async for doc in people_coll.find().limit(5):
            first_name = doc.get('first_name', 'Unknown')
            last_name = doc.get('last_name', 'Unknown')
            print(f"Person: {first_name} {last_name}")
            
            if 'company' in doc and doc['company'] is not None:
                company_ref = doc['company']
                ref_type = type(company_ref).__name__
                print(f"  company_ref type: {ref_type}")
                print(f"  company_ref: {company_ref}")
                print(f"  hasattr .id: {hasattr(company_ref, 'id')}")
                
                # Check if it's a DBRef with .id attribute
                if hasattr(company_ref, 'id'):
                    print(f"  company_ref.id: {company_ref.id}")
                
                # Check if it's a dict-like object
                if isinstance(company_ref, dict):
                    print(f"  company_ref['$id']: {company_ref.get('$id', 'N/A')}")
                    print(f"  company_ref['$ref']: {company_ref.get('$ref', 'N/A')}")
                    
                # List available attributes
                attrs = [a for a in dir(company_ref) if not a.startswith('_')]
                print(f"  dir: {attrs}")
            else:
                print("  NO company field")
            print()
            
    except Exception as e:
        print(f"ERROR: {e}")
    finally:
        if client:
            client.close()
            print("\nMongoDB connection closed")


if __name__ == "__main__":
    asyncio.run(test())
