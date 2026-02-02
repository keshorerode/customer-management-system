from fastapi import APIRouter, HTTPException
from typing import List
from app.models.task import Task
from app.schemas.task import TaskCreate, TaskUpdate, TaskOut

router = APIRouter()

@router.get("/", response_model=List[TaskOut])
async def get_tasks():
    return await Task.find_all().to_list()

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
