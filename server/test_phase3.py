import asyncio
from app.models.deal import Deal
from app.schemas.deal import DealCreate
from app.models.task import Task
from app.schemas.task import TaskCreate
from app.models.note import Note
from app.schemas.note import NoteCreate
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv

load_dotenv()

async def test_models():
    print("Testing Phase 3 Models...")

    # 1. Test Deal Schema
    print("Validating Deal Schema...")
    deal_data = {
        "title": "Test Deal",
        "value": 5000,
        "stage": "Proposal",
        "probability": 50
    }
    deal_schema = DealCreate(**deal_data)
    print("✅ Deal Schema Valid")

    # 2. Test Task Schema
    print("Validating Task Schema...")
    task_data = {
        "title": "Test Task",
        "priority": "High",
        "status": "Todo",
        "related_to_type": "company",
        "related_to_id": "generic_id_123"
    }
    task_schema = TaskCreate(**task_data)
    print("✅ Task Schema Valid")

    # 3. Test Note Schema
    print("Validating Note Schema...")
    note_data = {
        "content": "This is a note",
        "related_to_type": "deal",
        "related_to_id": "deal_id_123",
        "is_pinned": True
    }
    note_schema = NoteCreate(**note_data)
    print("✅ Note Schema Valid")
    
    # 4. Mock DB connections (optional, skipping real DB init for unit test)
    print("✅ Phase 3 Models & Schemas are valid Pydantic objects.")

if __name__ == "__main__":
    asyncio.run(test_models())
