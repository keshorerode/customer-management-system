from fastapi import APIRouter, HTTPException
from typing import List, Optional
from app.models.person import Person
from app.models.company import Company
from app.schemas.person import PersonCreate, PersonUpdate, PersonOut
from beanie import Link

router = APIRouter()

@router.post("/", response_model=PersonOut)
async def create_person(person_in: PersonCreate):
    person_data = person_in.dict()
    company_id = person_data.pop("company_id", None)
    
    person = Person(**person_data)
    
    if company_id:
        company = await Company.get(company_id)
        if company:
            person.company = company
            
    await person.insert()
    return person

@router.get("/", response_model=List[PersonOut])
async def list_people(skip: int = 0, limit: int = 100):
    people = await Person.find_all().skip(skip).limit(limit).to_list()
    return people

@router.get("/{id}", response_model=PersonOut)
async def get_person(id: str):
    person = await Person.get(id, fetch_links=True)
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    return person

@router.put("/{id}", response_model=PersonOut)
async def update_person(id: str, person_in: PersonUpdate):
    person = await Person.get(id)
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    
    update_data = person_in.dict(exclude_unset=True)
    company_id = update_data.pop("company_id", None)
    
    if company_id:
        company = await Company.get(company_id)
        if company:
            person.company = company
            
    await person.update({"$set": update_data})
    return person

@router.delete("/{id}")
async def delete_person(id: str):
    person = await Person.get(id)
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    await person.delete()
    return {"message": "Person deleted successfully"}
