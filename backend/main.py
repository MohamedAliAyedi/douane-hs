import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.config import settings
from auth.router import router as auth_router
from invoice.router import router as invoice_router
from hscode.router import router as hscode_router
from florence.router import router as florence_router

# Create FastAPI app
app = FastAPI(
    title="Douane AI Analysis API",
    description="Unified API for invoice analysis and HS code classification with authentication",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(invoice_router, prefix="/invoice", tags=["Invoice Analysis"])
app.include_router(hscode_router, prefix="/hscode", tags=["HS Code Analysis"])
app.include_router(florence_router, prefix="/florence", tags=["Image Processing"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Douane Analysis API", "version": "1.0.0"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)