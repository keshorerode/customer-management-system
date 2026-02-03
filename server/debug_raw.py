"""
Debug script for raw MongoDB queries.
This script directly queries the MongoDB collection to inspect document structure.
"""
import asyncio
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from bson import ObjectId


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
        
        print("=== Raw MongoDB Query ===\n")
        
        # Query people collection directly
        people_coll = db["people"]
        async for doc in people_coll.find().limit(10):
            first_name = doc.get('first_name', 'Unknown')
            last_name = doc.get('last_name', 'Unknown')
            print(f"Person: {first_name} {last_name}")
            print(f"  _id: {doc.get('_id')}")
            print(f"  'company' field exists: {'company' in doc}")
            if 'company' in doc:
                company_val = doc.get('company')
                print(f"  company value: {company_val}")
                print(f"  company type: {type(company_val).__name__}")
            else:
                print("  NO 'company' field in document")
            print()
            
    except Exception as e:
        print(f"ERROR: {e}")
    finally:
        if client:
            client.close()
            print("\nMongoDB connection closed")


if __name__ == "__main__":
    asyncio.run(test())
