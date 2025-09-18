from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class QueryRequest(BaseModel):
    query: str

class QueryRequestWithK(BaseModel):
    query: str
    top_k: int = 5

class QueryData(BaseModel):
    query: str
    chat_id: str

class DescriptionData(BaseModel):
    query: str

class NewQueryRequest(BaseModel):
    query: str

class VectorQueryRequest(BaseModel):
    query: str
    top_k: int

# New models for HS Code search functionality
class SearchRequest(BaseModel):
    query: str
    top_k: Optional[int] = 5

class SearchResult(BaseModel):
    HS_Code: str
    Product_Name: str
    File_Name: str
    rubrique: str
    score: float
    contenu: str
    sous_codes: List[Dict[str, Any]]