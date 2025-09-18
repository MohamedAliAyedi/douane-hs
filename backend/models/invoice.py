from pydantic import BaseModel
from typing import Optional, List

class InvoiceItem(BaseModel):
    code: Optional[str] = None
    description: Optional[str] = None
    quantity: Optional[float] = None
    unit_price: Optional[float] = None
    total_price: Optional[float] = None

class ShippingInfo(BaseModel):
    shipping_date: Optional[str] = None
    shipping_method: Optional[str] = None
    reference_numbers: Optional[str] = None

class BillingInfo(BaseModel):
    payment_terms: Optional[str] = None
    bank_details: Optional[str] = None
    other_billing_info: Optional[str] = None

class Totals(BaseModel):
    subtotal: Optional[float] = None
    vat_amount: Optional[float] = None
    grand_total: Optional[float] = None

class Invoice(BaseModel):
    company_name: Optional[str] = None
    invoice_number: Optional[str] = None
    date: Optional[str] = None
    vat_number: Optional[str] = None
    page_details: Optional[str] = None
    sender_address: Optional[str] = None
    recipient_address: Optional[str] = None
    items: List[InvoiceItem] = []
    shipping_info: Optional[ShippingInfo] = None
    billing_info: Optional[BillingInfo] = None
    totals: Optional[Totals] = None
    notes: Optional[str] = None