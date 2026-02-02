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
from app.api.endpoints import auth, companies, people, products, deals, tasks

load_dotenv()

app = FastAPI(title=os.getenv("PROJECT_NAME"))

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(companies.router, prefix="/api/companies", tags=["companies"])
app.include_router(people.router, prefix="/api/people", tags=["people"])
app.include_router(products.router, prefix="/api/products", tags=["products"])
app.include_router(deals.router, prefix="/api/deals", tags=["deals"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, specify the actual origin
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
        ]
    )

@app.get("/")
async def root():
    return {"message": "Welcome to Relationship Pro CRM API"}
