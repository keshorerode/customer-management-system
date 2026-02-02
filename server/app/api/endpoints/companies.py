from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.models.company import Company
from app.schemas.company import CompanyCreate, CompanyUpdate, CompanyOut
from beanie import PydanticObjectId

router = APIRouter()

@router.post("/", response_model=CompanyOut)
async def create_company(company_in: CompanyCreate):
    company = Company(**company_in.dict())
    await company.insert()
    return company

@router.get("/", response_model=List[CompanyOut])
async def list_companies(
    skip: int = 0, 
    limit: int = 100,
    industry: Optional[str] = None
):
    query = {}
    if industry:
        query["industry"] = industry
    
    companies = await Company.find(query).skip(skip).limit(limit).to_list()
    return companies

@router.get("/{id}", response_model=CompanyOut)
async def get_company(id: str):
    company = await Company.get(id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return company

@router.put("/{id}", response_model=CompanyOut)
async def update_company(id: str, company_in: CompanyUpdate):
    company = await Company.get(id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    update_data = company_in.dict(exclude_unset=True)
    await company.update({"$set": update_data})
    return company

@router.delete("/{id}")
async def delete_company(id: str):
    company = await Company.get(id)
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    await company.delete()
    return {"message": "Company deleted successfully"}
