from fastapi import APIRouter, HTTPException
from typing import List
from app.models.deal import Deal
from app.schemas.deal import DealCreate, DealUpdate, DealOut

router = APIRouter()

@router.get("/", response_model=List[DealOut])
async def get_deals():
    return await Deal.find_all().to_list()

@router.post("/", response_model=DealOut)
async def create_deal(deal_in: DealCreate):
    deal = Deal(**deal_in.dict())
    await deal.insert()
    return deal

@router.get("/{id}", response_model=DealOut)
async def get_deal(id: str):
    deal = await Deal.get(id)
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    return deal
