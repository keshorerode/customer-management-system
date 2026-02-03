from fastapi import APIRouter, HTTPException
from typing import List, Optional, Dict
from app.models.person import Person
from app.models.company import Company
from app.schemas.person import PersonCreate, PersonUpdate, PersonOut
from beanie import PydanticObjectId
from datetime import datetime
from bson.errors import InvalidId

router = APIRouter()


def validate_object_id(id_str: str, field_name: str = "id") -> PydanticObjectId:
    """Validate and convert string to PydanticObjectId, raising HTTPException on failure."""
    try:
        return PydanticObjectId(id_str)
    except (InvalidId, ValueError, TypeError) as e:
        raise HTTPException(status_code=400, detail=f"Invalid {field_name}: {id_str}")


def build_person_response(person: Person, company_id: Optional[str]) -> dict:
    """Build a consistent response dict for a Person."""
    return {
        "id": str(person.id),
        "first_name": (person.first_name or "").strip(),  # Trim whitespace
        "last_name": (person.last_name or "").strip(),  # Trim whitespace
        "email": person.email,
        "phone": person.phone,
        "mobile": person.mobile,
        "job_title": (person.job_title or "").strip() if person.job_title else None,
        "department": person.department,
        "company_id": company_id,
        "linkedin": person.linkedin,
        "avatar_url": person.avatar_url,
        "is_primary_contact": person.is_primary_contact,
        "notes": person.notes,
        "created_at": person.created_at,
        "updated_at": person.updated_at
    }


def extract_company_id_from_dbref(raw_doc: dict) -> Optional[str]:
    """Extract company_id from a raw MongoDB document's DBRef."""
    if raw_doc and 'company' in raw_doc and raw_doc['company'] is not None:
        company_ref = raw_doc['company']
        if hasattr(company_ref, 'id'):
            return str(company_ref.id)
    return None


@router.post("/", response_model=PersonOut)
async def create_person(person_in: PersonCreate):
    person_data = person_in.dict()
    company_id = person_data.pop("company_id", None)
    
    # Trim whitespace from name fields
    if person_data.get("first_name"):
        person_data["first_name"] = person_data["first_name"].strip()
    if person_data.get("last_name"):
        person_data["last_name"] = person_data["last_name"].strip()
    
    person = Person(**person_data)
    
    if company_id:
        validated_company_id = validate_object_id(company_id, "company_id")
        company = await Company.get(validated_company_id)
        if not company:
            raise HTTPException(status_code=404, detail=f"Company not found: {company_id}")
        person.company = company
            
    await person.insert()
    
    return build_person_response(person, company_id)


@router.get("/", response_model=List[PersonOut])
async def list_people(skip: int = 0, limit: int = 100):
    # Get raw documents from MongoDB to access company DBRef directly
    motor_coll = Person.get_pymongo_collection()
    cursor = motor_coll.find().skip(skip).limit(limit)
    
    # Collect all raw documents and their IDs first (avoiding N+1)
    raw_docs: List[dict] = []
    person_ids: List[PydanticObjectId] = []
    
    async for raw_doc in cursor:
        raw_docs.append(raw_doc)
        person_ids.append(raw_doc["_id"])
    
    if not person_ids:
        return []
    
    # Batch fetch all Person documents in one query
    persons = await Person.find({"_id": {"$in": person_ids}}).to_list()
    person_map: Dict[PydanticObjectId, Person] = {p.id: p for p in persons}
    
    # Build responses using the pre-fetched data
    results = []
    for raw_doc in raw_docs:
        person_id = raw_doc["_id"]
        person = person_map.get(person_id)
        if person:
            company_id = extract_company_id_from_dbref(raw_doc)
            results.append(build_person_response(person, company_id))
    
    return results


@router.get("/{id}", response_model=PersonOut)
async def get_person(id: str):
    # Validate ID format first
    validated_id = validate_object_id(id, "person id")
    
    motor_coll = Person.get_pymongo_collection()
    raw_doc = await motor_coll.find_one({"_id": validated_id})
    
    person = await Person.get(validated_id)
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    
    company_id = extract_company_id_from_dbref(raw_doc)
    return build_person_response(person, company_id)


@router.put("/{id}", response_model=PersonOut)
async def update_person(id: str, person_in: PersonUpdate):
    validated_id = validate_object_id(id, "person id")
    
    person = await Person.get(validated_id)
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    
    update_data = person_in.dict(exclude_unset=True)
    company_id_input = update_data.pop("company_id", None)
    
    # Trim whitespace from name fields if present
    if "first_name" in update_data and update_data["first_name"]:
        update_data["first_name"] = update_data["first_name"].strip()
    if "last_name" in update_data and update_data["last_name"]:
        update_data["last_name"] = update_data["last_name"].strip()
    
    # Update basic fields
    for key, value in update_data.items():
        setattr(person, key, value)
    
    # Handle company link with proper validation
    if company_id_input is not None:
        if company_id_input:  # Non-empty string means set a company
            validated_company_id = validate_object_id(company_id_input, "company_id")
            company = await Company.get(validated_company_id)
            if not company:
                raise HTTPException(status_code=404, detail=f"Company not found: {company_id_input}")
            person.company = company
        else:  # Empty string means clear the company
            person.company = None
    
    # Update the timestamp
    person.updated_at = datetime.utcnow()
    
    await person.save()
    
    # Get the new company_id for response from raw doc
    motor_coll = Person.get_pymongo_collection()
    raw_doc = await motor_coll.find_one({"_id": person.id})
    
    final_company_id = extract_company_id_from_dbref(raw_doc)
    return build_person_response(person, final_company_id)


@router.delete("/{id}")
async def delete_person(id: str):
    validated_id = validate_object_id(id, "person id")
    
    person = await Person.get(validated_id)
    if not person:
        raise HTTPException(status_code=404, detail="Person not found")
    await person.delete()
    return {"message": "Person deleted successfully"}
