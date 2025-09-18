from pydantic import BaseModel
from typing import Optional, Dict, Any

class ImageProcessRequest(BaseModel):
    task: Optional[str] = '<DETAILED_CAPTION>'
    text_input: Optional[str] = None

class ImageProcessResponse(BaseModel):
    caption: Optional[str] = None
    results: Optional[Dict[str, Any]] = None
    task_used: str
    success: bool = True
    message: Optional[str] = None

class TaskListResponse(BaseModel):
    available_tasks: Dict[str, str]