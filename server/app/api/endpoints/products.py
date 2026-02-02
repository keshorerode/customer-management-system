from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate, ProductOut
from datetime import datetime
from beanie import PydanticObjectId

router = APIRouter()

@router.get("/", response_model=List[ProductOut])
async def get_products(
    skip: int = 0, 
    limit: int = 100,
    category: Optional[str] = None,
    status: Optional[str] = "active"
):
    query = {}
    if category:
        query["category"] = category
    if status:
        query["status"] = status
        
    products = await Product.find(query).skip(skip).limit(limit).to_list()
    return products

@router.post("/", response_model=ProductOut)
async def create_product(product_in: ProductCreate):
    product = Product(**product_in.dict())
    await product.insert()
    return product

@router.get("/{product_id}", response_model=ProductOut)
async def get_product(product_id: str):
    product = await Product.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@router.put("/{product_id}", response_model=ProductOut)
async def update_product(product_id: str, product_in: ProductUpdate):
    product = await Product.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product_in.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    await product.set(update_data)
    return product

@router.delete("/{product_id}")
async def delete_product(product_id: str):
    product = await Product.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    await product.delete()
    return {"message": "Product deleted successfully"}
