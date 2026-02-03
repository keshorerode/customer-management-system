from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
import os
from dotenv import load_dotenv

from app.models.user import User
from app.models.company import Company
from app.models.person import Person
from app.models.product import Product
from app.models.deal import Deal
from app.models.task import Task
from app.models.lead import Lead
from app.models.lead_thread import LeadThread
from app.api.endpoints import auth, companies, people, products, deals, tasks, leads

load_dotenv()

app = FastAPI(title=os.getenv("PROJECT_NAME"))

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(companies.router, prefix="/api/companies", tags=["companies"])
app.include_router(people.router, prefix="/api/people", tags=["people"])
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(deals.router, prefix="/api/deals", tags=["deals"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(leads.router, prefix="/api/leads", tags=["leads"])

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
    await init_beanie(
        database=client[os.getenv("DATABASE_NAME")],
        document_models=[
            User,
            Company,
            Person,
            Product,
            Deal,
            Task,
            Lead,
            LeadThread,
        ]
    )

@app.get("/")
async def root():
    return {"message": "Welcome to Relationship Pro CRM API"}
