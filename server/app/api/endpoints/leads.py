from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.models.lead import Lead
from app.schemas.lead import LeadCreate, LeadUpdate, LeadOut
from beanie import PydanticObjectId

router = APIRouter()

@router.post("/", response_model=LeadOut)
async def create_lead(lead_in: LeadCreate):
    lead = Lead(**lead_in.dict())
    await lead.insert()
    return lead

@router.get("/", response_model=List[LeadOut])
async def list_leads(
    skip: int = 0, 
    limit: int = 100,
    status: Optional[str] = None
):
    query = {}
    if status:
        query["status"] = status
    
    leads = await Lead.find(query).skip(skip).limit(limit).to_list()
    return leads

@router.get("/{id}", response_model=LeadOut)
async def get_lead(id: str):
    lead = await Lead.get(id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return lead

@router.put("/{id}", response_model=LeadOut)
async def update_lead(id: str, lead_in: LeadUpdate):
    lead = await Lead.get(id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    update_data = lead_in.dict(exclude_unset=True)
    await lead.update({"$set": update_data})
    return lead

@router.delete("/{id}")
async def delete_lead(id: str):
    lead = await Lead.get(id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    await lead.delete()
    return {"message": "Lead deleted successfully"}
