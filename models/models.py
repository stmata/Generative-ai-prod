from pydantic import BaseModel
from typing import List, Optional

class IntervalValue(BaseModel):
    min: int
    max: int | str 

class ConfigModel(BaseModel):
    tone: str
    genderTone: str
    textSize: str
    messageValue: int
    durationValue: str
    intervalValue: IntervalValue

class DownloadRequest(BaseModel):
    ids: List[str]  
    format: Optional[str] = None

class AnalyzePayload(BaseModel):
    session_id: str

class ChatRequest(BaseModel):
    message: str

class FinalIdeaRequest(BaseModel):
    idea: str

