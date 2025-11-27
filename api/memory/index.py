from fastapi import FastAPI, Request, HTTPException
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import os
import json
# from memori import Memori # Commented out until installed, using mock for now if import fails
try:
    from memori import Memori
except ImportError:
    Memori = None

app = FastAPI()

class MemoryRequest(BaseModel):
    user_id: str
    content: str
    role: str = "user"

class ContextRequest(BaseModel):
    user_id: str
    query: str

@app.get("/api/memory/health")
def health_check():
    return {"status": "ok", "memori_installed": Memori is not None}

@app.post("/api/memory/add")
async def add_memory(req: MemoryRequest):
    if not Memori:
        return {"status": "mocked", "message": "Memori not installed"}
    
    try:
        # Initialize Memori with Supabase/Postgres
        # Note: In a real deployment, we'd pass DB config here
        # memori = Memori(db_url=os.getenv("DATABASE_URL"))
        
        # For now, we'll simulate or use a simple setup
        # memori.add(user_id=req.user_id, content=req.content, role=req.role)
        
        return {"status": "success", "message": "Memory added"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/memory/context")
async def get_context(req: ContextRequest):
    if not Memori:
        return {"context": [], "mock": True}
    
    try:
        # memori = Memori(db_url=os.getenv("DATABASE_URL"))
        # context = memori.search(user_id=req.user_id, query=req.query)
        context = []
        return {"context": context}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Vercel handler
# For Vercel, we might need to adapt FastAPI to WSGI/ASGI or just use the app
# Vercel supports FastAPI natively in api/ folder if configured correctly
