import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
import os
from dotenv import load_dotenv

from app.models.user import User
from app.models.company import Company
from app.models.person import Person
from app.core.security import get_password_hash

async def seed_data():
    load_dotenv()
    client = AsyncIOMotorClient(os.getenv("MONGODB_URL"))
    await init_beanie(
        database=client[os.getenv("DATABASE_NAME")],
        document_models=[User, Company, Person]
    )

    # 1. Create User
    user = await User.find_one(User.email == "admin@relpro.io")
    if not user:
        user = User(
            email="admin@relpro.io",
            password_hash=get_password_hash("admin123"),
            first_name="Alex",
            last_name="Rivera"
        )
        await user.insert()
        print("User created.")

    # 2. Create Company
    company = await Company.find_one(Company.name == "Acme Corp")
    if not company:
        company = Company(
            name="Acme Corp",
            domain="acme.com",
            industry="Manufacturing",
            company_size="500+",
            address_city="Austin",
            address_country="USA",
            website="https://acme.com"
        )
        await company.insert()
        print("Company created.")

    # 3. Create Person
    person = await Person.find_one(Person.email == "alex@acme.com")
    if not person:
        person = Person(
            first_name="Alex",
            last_name="Rivera",
            email="alex@acme.com",
            job_title="CTO",
            company=company
        )
        await person.insert()
        print("Person created.")

if __name__ == "__main__":
    asyncio.run(seed_data())
