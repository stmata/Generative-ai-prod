from pydantic import BaseModel
from typing import List, Optional

class ConfigModel(BaseModel):
    tone: str
    style: str
    textSize: str

class DownloadRequest(BaseModel):
    ids: List[str]  
    format: Optional[str] = None

class AnalyzePayload(BaseModel):
    session_id: str

class ChatRequest(BaseModel):
    message: str

class FinalIdeaRequest(BaseModel):
    idea: str

