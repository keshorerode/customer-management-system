from fastapi import APIRouter, HTTPException

from typing import List, Optional
from app.models.deal import Deal
from app.schemas.deal import DealCreate, DealUpdate, DealOut

from app.models.company import Company
from app.models.person import Person
from beanie import PydanticObjectId
from bson.errors import InvalidId

router = APIRouter()


def get_link_id(link_obj) -> Optional[str]:
    """Safely extract ID from a Beanie Link or Document."""
    if link_obj is None:
        return None
    # If it's a Link with ref attribute (unfetched)
    if hasattr(link_obj, 'ref') and link_obj.ref is not None:
        return str(link_obj.ref.id)
    # If it's a fetched document with id
    if hasattr(link_obj, 'id') and link_obj.id is not None:
        return str(link_obj.id)
    return None


def validate_object_id(id_str: str, field_name: str = "id") -> PydanticObjectId:
    """Validate and convert string to PydanticObjectId, raising HTTPException on failure."""
    try:
        return PydanticObjectId(id_str)
    except (InvalidId, ValueError, TypeError) as e:
        raise HTTPException(status_code=400, detail=f"Invalid {field_name}: {id_str}")


@router.get("/", response_model=List[DealOut])
async def get_deals(
    company_id: str = None,
    contact_id: str = None
):
    queries = []
    if company_id:
        validated_company_id = validate_object_id(company_id, "company_id")
        queries.append(Deal.company.id == validated_company_id)
    
    if contact_id:
        validated_contact_id = validate_object_id(contact_id, "contact_id")
        queries.append(Deal.contact.id == validated_contact_id)
    
    if queries:
        deals = await Deal.find(*queries).sort("-created_at").to_list()
    else:
        deals = await Deal.find({}).sort("-created_at").to_list()
        
    results = []
    for deal in deals:
        d_dict = deal.dict()
        d_dict["id"] = str(deal.id)
        d_dict["company_id"] = get_link_id(deal.company)
        d_dict["contact_id"] = get_link_id(deal.contact)
        results.append(d_dict)
        
    return results


@router.post("/", response_model=DealOut)
async def create_deal(deal_in: DealCreate):
    deal_data = deal_in.dict()
    company_id = deal_data.pop("company_id", None)
    contact_id = deal_data.pop("contact_id", None)
    
    deal = Deal(**deal_data)
    
    if company_id:
        validated_company_id = validate_object_id(company_id, "company_id")
        company = await Company.get(validated_company_id)
        if not company:
            raise HTTPException(status_code=404, detail=f"Company not found: {company_id}")
        deal.company = company
            
    if contact_id:
        validated_contact_id = validate_object_id(contact_id, "contact_id")
        contact = await Person.get(validated_contact_id)
        if not contact:
            raise HTTPException(status_code=404, detail=f"Contact not found: {contact_id}")
        deal.contact = contact
            
    await deal.insert()
    
    # Prepare response
    d_dict = deal.dict()
    d_dict["id"] = str(deal.id)
    d_dict["company_id"] = get_link_id(deal.company)
    d_dict["contact_id"] = get_link_id(deal.contact)
        
    return d_dict


@router.get("/{id}", response_model=DealOut)
async def get_deal(id: str):
    validated_id = validate_object_id(id, "deal id")
    deal = await Deal.get(validated_id, fetch_links=True)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
        
    # Prepare response
    d_dict = deal.dict()
    d_dict["id"] = str(deal.id)
    d_dict["company_id"] = get_link_id(deal.company)
    d_dict["contact_id"] = get_link_id(deal.contact)
        
    return d_dict


@router.put("/{id}", response_model=DealOut)
async def update_deal(id: str, deal_in: DealUpdate):
    validated_id = validate_object_id(id, "deal id")
    deal = await Deal.get(validated_id, fetch_links=True)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    update_data = deal_in.dict(exclude_unset=True)
    company_id = update_data.pop("company_id", None)
    contact_id = update_data.pop("contact_id", None)
    
    # Update basic fields
    for key, value in update_data.items():
        setattr(deal, key, value)
    
    # Update links with proper validation
    if company_id is not None:
        if company_id:  # Non-empty string means set a company
            validated_company_id = validate_object_id(company_id, "company_id")
            company = await Company.get(validated_company_id)
            if not company:
                raise HTTPException(status_code=404, detail=f"Company not found: {company_id}")
            deal.company = company
        else:  # Empty string means clear the company
            deal.company = None
    
    if contact_id is not None:
        if contact_id:  # Non-empty string means set a contact
            validated_contact_id = validate_object_id(contact_id, "contact_id")
            contact = await Person.get(validated_contact_id)
            if not contact:
                raise HTTPException(status_code=404, detail=f"Contact not found: {contact_id}")
            deal.contact = contact
        else:  # Empty string means clear the contact
            deal.contact = None
            
    await deal.save()
    
    # Prepare response
    d_dict = deal.dict()
    d_dict["id"] = str(deal.id)
    d_dict["company_id"] = get_link_id(deal.company)
    d_dict["contact_id"] = get_link_id(deal.contact)
        
    return d_dict


@router.delete("/{id}")
async def delete_deal(id: str):
    validated_id = validate_object_id(id, "deal id")
    deal = await Deal.get(validated_id)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    await deal.delete()
    return {"message": "Deal deleted successfully"}
