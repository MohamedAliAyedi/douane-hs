import io
import torch
import logging
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends, Form
from PIL import Image
from typing import Optional

from models.florence import ImageProcessRequest, ImageProcessResponse, TaskListResponse
from utils.florence import (
    load_florence_model,
    run_florence_inference,
    FLORENCE_DETAILED_CAPTION_TASK
)
from core.dependencies import get_current_user

# Set up logging
logger = logging.getLogger(__name__)

router = APIRouter()

# Global variables for model and processor
FLORENCE_MODEL = None
FLORENCE_PROCESSOR = None
DEVICE = None

@router.on_event("startup")
async def load_florence_models():
    """Load Florence models on startup"""
    global FLORENCE_MODEL, FLORENCE_PROCESSOR, DEVICE
    
    try:
        DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        logger.info(f"Using device: {DEVICE}")
        
        FLORENCE_MODEL, FLORENCE_PROCESSOR = load_florence_model(device=DEVICE)
        logger.info("Florence models loaded successfully")
        
    except Exception as e:
        logger.error(f"Failed to load Florence models: {str(e)}")
        # Don't raise here to allow the app to start even if Florence models fail
        FLORENCE_MODEL = None
        FLORENCE_PROCESSOR = None

@router.post("/process-image", response_model=ImageProcessResponse)
async def process_image(
    file: UploadFile = File(...),
    task: str = Form(default=FLORENCE_DETAILED_CAPTION_TASK),
    text_input: Optional[str] = Form(default=None),
    current_user: dict = Depends(get_current_user)
):
    """
    Process an image using Florence2 model for various vision tasks.
    
    - **file**: Image file to process
    - **task**: Florence2 task to perform (default: detailed caption)
    - **text_input**: Optional text input for certain tasks
    """
    try:
        # Check if models are loaded
        if FLORENCE_MODEL is None or FLORENCE_PROCESSOR is None:
            raise HTTPException(
                status_code=503, 
                detail="Florence models not available. Please check server logs."
            )
        
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(
                status_code=400,
                detail="File must be an image"
            )
        
        # Read and convert image
        contents = await file.read()
        try:
            image = Image.open(io.BytesIO(contents)).convert('RGB')
            logger.info(f"Image loaded successfully: {image.size}")
        except Exception as e:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid image file: {str(e)}"
            )
        
        # Run inference
        try:
            with torch.inference_mode():
                if DEVICE.type == "cuda":
                    with torch.autocast(device_type="cuda", dtype=torch.bfloat16):
                        _, result = run_florence_inference(
                            model=FLORENCE_MODEL,
                            processor=FLORENCE_PROCESSOR,
                            device=DEVICE,
                            image=image,
                            task=task
                        )
                else:
                    _, result = run_florence_inference(
                        model=FLORENCE_MODEL,
                        processor=FLORENCE_PROCESSOR,
                        device=DEVICE,
                        image=image,
                        task=task
                    )
                
                logger.info("Florence inference completed successfully")
                
                # Extract caption or results based on task
                if task in [FLORENCE_DETAILED_CAPTION_TASK, '<CAPTION>', '<MORE_DETAILED_CAPTION>']:
                    caption = result.get(task, "No caption generated")
                    return ImageProcessResponse(
                        caption=caption,
                        results=result,
                        task_used=task,
                        success=True
                    )
                else:
                    return ImageProcessResponse(
                        results=result,
                        task_used=task,
                        success=True
                    )
                
        except Exception as e:
            logger.error(f"Florence inference failed: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Model inference failed: {str(e)}"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error processing image: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@router.get("/model-status")
async def get_model_status(current_user: dict = Depends(get_current_user)):
    """
    Check if Florence models are loaded and ready.
    """
    return {
        "florence_model_loaded": FLORENCE_MODEL is not None,
        "florence_processor_loaded": FLORENCE_PROCESSOR is not None,
        "device": str(DEVICE) if DEVICE else "Not initialized",
        "cuda_available": torch.cuda.is_available(),
        "status": "ready" if (FLORENCE_MODEL and FLORENCE_PROCESSOR) else "not_ready"
    }