from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional, Any
from app.models.product import Product
from app.models.company import Company
from app.schemas.product import ProductCreate, ProductUpdate, ProductOut
from datetime import datetime
from beanie import PydanticObjectId, Link
from bson.errors import InvalidId

router = APIRouter()

def validate_object_id(id_str: str, name: str = "id") -> PydanticObjectId:
    try:
        return PydanticObjectId(id_str)
    except (InvalidId, ValueError, TypeError):
        raise HTTPException(status_code=400, detail=f"Invalid {name} format")

def get_link_id(link_obj: Any) -> Optional[str]:
    """Safely extract ID from a Link field or fetched Document"""
    if link_obj is None:
        return None
    
    # If it's a Beanie Link object (DBRef wrapper)
    if hasattr(link_obj, 'ref') and hasattr(link_obj.ref, 'id'):
        return str(link_obj.ref.id)
    
    # If it's a fetched Document object or PydanticObjectId
    if hasattr(link_obj, 'id'):
        return str(link_obj.id)
        
    # If it's already an ID (string or ObjectId)
    return str(link_obj)




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
    
    # Manual response building to include company_id
    results = []
    for product in products:
        p_dict = product.dict()
        p_dict["id"] = str(product.id)
        p_dict["company_id"] = get_link_id(product.company)
        results.append(p_dict)
        
    return results

@router.post("/", response_model=ProductOut)
async def create_product(product_in: ProductCreate):
    product_data = product_in.dict()
    company_id = product_data.pop("company_id", None)
    
    product = Product(**product_data)
    
    if company_id:
        validated_company_id = validate_object_id(company_id, "company_id")
        company = await Company.get(validated_company_id)
        if not company:
            raise HTTPException(status_code=404, detail=f"Company not found: {company_id}")
        product.company = company
        
    await product.insert()
    
    # Prepare response
    p_dict = product.dict()
    p_dict["id"] = str(product.id)
    p_dict["company_id"] = company_id
    
    return p_dict

@router.get("/{product_id}", response_model=ProductOut)
async def get_product(product_id: str):
    validated_id = validate_object_id(product_id)
    product = await Product.get(validated_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    p_dict = product.dict()
    p_dict["id"] = str(product.id)
    p_dict["company_id"] = get_link_id(product.company)
    
    return p_dict

@router.put("/{product_id}", response_model=ProductOut)
async def update_product(product_id: str, product_in: ProductUpdate):
    validated_id = validate_object_id(product_id)
    product = await Product.get(validated_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    update_data = product_in.dict(exclude_unset=True)
    update_data["updated_at"] = datetime.utcnow()
    
    # Handle company update logic
    if "company_id" in update_data:
        company_id = update_data.pop("company_id")
        if company_id:
            validated_company_id = validate_object_id(company_id, "company_id")
            company = await Company.get(validated_company_id)
            if not company:
                raise HTTPException(status_code=404, detail=f"Company not found: {company_id}")
            update_data["company"] = company
        else:
            update_data["company"] = None
    
    await product.set(update_data)
    
    p_dict = product.dict()
    p_dict["id"] = str(product.id)
    # Ensure company_id is in response
    if "company" in update_data:
        p_dict["company_id"] = get_link_id(update_data["company"])
    else:
        p_dict["company_id"] = get_link_id(product.company)
        
    return p_dict

@router.delete("/{product_id}")
async def delete_product(product_id: str):
    product = await Product.get(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    await product.delete()
    return {"message": "Product deleted successfully"}
