from fastapi import APIRouter, HTTPException
from typing import List
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate, TaskOut

router = APIRouter()

@router.get("/", response_model=List[TaskOut])
async def get_tasks(
    related_to_type: str = None,
    related_to_id: str = None
):
    search_criteria = {}
    if related_to_type:
        search_criteria["related_to_type"] = related_to_type
    if related_to_id:
        search_criteria["related_to_id"] = related_to_id
        
    if search_criteria:
        return await Task.find(search_criteria).sort("-created_at").to_list()
        
    return await Task.find_all().sort("-created_at").to_list()

@router.post("/", response_model=TaskOut)
async def create_task(task_in: TaskCreate):
    task = Task(**task_in.dict())
    await task.insert()
    return task

@router.get("/{id}", response_model=TaskOut)
async def get_task(id: str):
    task = await Task.get(id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task
