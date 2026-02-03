from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.models.note import Note
from app.schemas.note import NoteCreate, NoteUpdate, NoteOut

router = APIRouter()

@router.get("/", response_model=List[NoteOut])
async def get_notes(
    related_to_type: Optional[str] = Query(None, description="Filter by entity type (company, deal, etc.)"),
    related_to_id: Optional[str] = Query(None, description="Filter by generic entity ID")
):
    search_criteria = {}
    if related_to_type:
        search_criteria["related_to_type"] = related_to_type
    if related_to_id:
        search_criteria["related_to_id"] = related_to_id
        
    if search_criteria:
        return await Note.find(search_criteria).sort("-created_at").to_list()
    
    return await Note.find_all().sort("-created_at").to_list()

@router.post("/", response_model=NoteOut)
async def create_note(note_in: NoteCreate):
    note = Note(**note_in.dict())
    await note.insert()
    return note

@router.get("/{id}", response_model=NoteOut)
async def get_note(id: str):
    note = await Note.get(id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    return note

@router.put("/{id}", response_model=NoteOut)
async def update_note(id: str, note_in: NoteUpdate):
    note = await Note.get(id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    
    update_data = note_in.dict(exclude_unset=True)
    await note.update({"$set": update_data})
    
    return note

@router.delete("/{id}")
async def delete_note(id: str):
    note = await Note.get(id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    await note.delete()
    return {"message": "Note deleted successfully"}
