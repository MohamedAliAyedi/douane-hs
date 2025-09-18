import os
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from starlette.responses import JSONResponse
from ollama import chat
from models.invoice import Invoice
from core.config import settings
from core.dependencies import get_current_user

router = APIRouter()

def parse_invoice_from_image(image_path: str) -> Invoice:
    """
    Uses Ollama's chat() function to analyze the invoice image and return a structured Invoice object.
    """
    response = chat(
        model=settings.OLLAMA_MODEL,
        format=Invoice.model_json_schema(),
        messages=[
            {
                "role": "user",
                "content": (
                    "You are analyzing an invoice. Please fill out the following fields as accurately "
                    "as possible based on the attached image: company_name, invoice_number, date, "
                    "vat_number, page_details, sender_address, recipient_address, items, shipping_info, "
                    "billing_info, totals, and notes."
                ),
                "images": [image_path],
            }
        ],
        options={
            "temperature": 0,
            "num_ctx": 2048,
        },
    )

    try:
        invoice_data = Invoice.model_validate_json(response.message.content)
        return invoice_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse invoice JSON: {str(e)}")

@router.post("/analyze-invoice/")
async def analyze_invoice(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """
    Protected endpoint that:
      1) Saves the uploaded file
      2) Calls 'parse_invoice_from_image' with the local path
      3) Returns the resulting Invoice as JSON
    """
    # Save the file temporarily
    temp_filename = f"temp_{uuid.uuid4()}_{file.filename}"
    with open(temp_filename, "wb") as f:
        f.write(await file.read())
    
    try:
        invoice = parse_invoice_from_image(temp_filename)
        return JSONResponse(invoice.dict())
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_filename):
            os.remove(temp_filename)