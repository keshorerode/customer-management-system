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
    
    # Set company_id for the response model
    if company_id:
        person.company_id = str(company_id)
        
    return person

@router.get("/", response_model=List[PersonOut])
async def list_people(skip: int = 0, limit: int = 100):
    people = await Person.find_all(fetch_links=True).skip(skip).limit(limit).to_list()
    # Populate company_id for the output schema
    for p in people:
        if p.company:
            p.company_id = str(p.company.pk)
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
    
    for key, value in update_data.items():
        setattr(person, key, value)
    
    if company_id:
        company = await Company.get(company_id)
        if company:
            person.company = company
            
    await person.save()
    
    # Set company_id for the response model
    if person.company:
        person.company_id = str(person.company.pk)
    elif company_id is None and "company_id" in person_in.dict(exclude_unset=True):
        # Explicitly cleared company
        person.company = None
        person.company_id = None
        
    return person

@router.delete("/{id}")
async def delete_person(id: str):
    person = await Person.get(id)
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    await person.delete()
    return {"message": "Person deleted successfully"}
