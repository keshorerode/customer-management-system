from fastapi import APIRouter, HTTPException, Query
from datetime import datetime
from typing import List, Optional
from app.models.lead import Lead
from app.schemas.lead import LeadCreate, LeadUpdate, LeadOut
from app.models.lead_thread import LeadThread
from app.schemas.lead_thread import LeadThreadOut, SyncMailResponse
from beanie import PydanticObjectId

router = APIRouter()

@router.post("/", response_model=LeadOut)
async def create_lead(lead_in: LeadCreate):
    lead = Lead(**lead_in.dict())
    await lead.insert()
    return lead

@router.get("/", response_model=List[LeadOut], response_model_by_alias=False)
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
    for key, value in update_data.items():
        setattr(lead, key, value)
    await lead.save()
    return lead

@router.delete("/{id}")
async def delete_lead(id: str):
    lead = await Lead.get(id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    await lead.delete()
    return {"message": "Lead deleted successfully"}

@router.post("/{id}/sync-mail", response_model=SyncMailResponse)
async def sync_mail(id: str):
    lead = await Lead.get(id)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    # Mock syncing - creating few virtual threads
    dummy_threads = [
        {"subject": "Requirement Discussion", "last_message": "Can we meet tomorrow?", "snippet": "Hey, I wanted to discuss the requirements for our project..."},
        {"subject": "Pricing Inquiry", "last_message": "Please send the brochure", "snippet": "Hi, we are interested in your services and would like to know..."},
    ]
    
    count = 0
    for dt in dummy_threads:
        exists = await LeadThread.find_one(LeadThread.lead.id == id, LeadThread.subject == dt["subject"])
        if not exists:
            thread = LeadThread(
                lead=lead,
                subject=dt["subject"],
                last_message=dt["last_message"],
                snippet=dt["snippet"],
                status="Unread",
                last_message_at=datetime.utcnow()
            )
            await thread.insert()
            count += 1
            
    return {"threads_synced": count, "message": f"Successfully synced {count} new threads."}

@router.get("/{id}/mail-threads", response_model=List[LeadThreadOut])
async def list_mail_threads(id: str):
    threads = await LeadThread.find(LeadThread.lead.id == id).to_list()
    # Populate the lead_id for the schema
    for t in threads:
        t.lead_id = id
    return threads
