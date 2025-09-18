import React, { useEffect, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Delete, DeleteIcon, Trash2Icon } from "lucide-react";

type InvoiceFormProps = {
  initialData: any; // The invoice data to pre-populate the form
};

const InvoiceForm = ({ initialData }: InvoiceFormProps) => {
  const [formData, setFormData] = useState<any>(initialData || {});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData); // Update form data when initialData changes
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const { name, value } = e.target;
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [name]: value,
    };

    setFormData((prevData: any) => ({
      ...prevData,
      items: updatedItems,
    }));
  };

  const handleAddItem = () => {
    const newItem = {
      description: "",
      quantity: "",
      unit_price: "",
      total_price: "",
    };

    setFormData((prevData: any) => ({
      ...prevData,
      items: [...(prevData.items || []), newItem],
    }));
  };

  const handleDeleteItem = (index: number) => {
    const updatedItems = formData.items.filter(
      (_: any, itemIndex: any) => itemIndex !== index
    );

    setFormData((prevData: any) => ({
      ...prevData,
      items: updatedItems,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted with data:", formData);
    // Perform the submission (you could send this data to an API)
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Invoice Header */}
      <div>
        <Label htmlFor="company_name">Company Name</Label>
        <Input
          id="company_name"
          name="company_name"
          value={formData.company_name || ""}
          onChange={(e) =>
            setFormData({ ...formData, company_name: e.target.value })
          }
        />
      </div>

      <div>
        <Label htmlFor="invoice_number">Invoice Number</Label>
        <Input
          id="invoice_number"
          name="invoice_number"
          value={formData.invoice_number || ""}
          onChange={(e) =>
            setFormData({ ...formData, invoice_number: e.target.value })
          }
        />
      </div>

      <div>
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          name="date"
          value={formData.date || ""}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="vat_number">VAT Number</Label>
        <Input
          id="vat_number"
          name="vat_number"
          value={formData.vat_number || ""}
          onChange={(e) =>
            setFormData({ ...formData, vat_number: e.target.value })
          }
        />
      </div>

      <div>
        <Label htmlFor="sender_address">Sender Address</Label>
        <Input
          id="sender_address"
          name="sender_address"
          value={formData.sender_address || ""}
          onChange={(e) =>
            setFormData({ ...formData, sender_address: e.target.value })
          }
        />
      </div>

      <div>
        <Label htmlFor="recipient_address">Recipient Address</Label>
        <Input
          id="recipient_address"
          name="recipient_address"
          value={formData.recipient_address || ""}
          onChange={(e) =>
            setFormData({ ...formData, recipient_address: e.target.value })
          }
        />
      </div>

      {/* Items Table */}
      {formData.items && formData.items.length > 0 && (
        <div className="space-y-4">
          <Label>Items</Label>

          <table className="w-full table-auto border-collapse border border-gray-200">
            <thead>
              <tr>
                <th className="border px-4 py-2">Description</th>
                <th className="border px-4 py-2">Quantity</th>
                <th className="border px-4 py-2">Unit Price</th>
                <th className="border px-4 py-2">Total Price</th>
                <th className="border px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {formData.items.map((item: any, index: number) => (
                <tr key={index}>
                  <td className="border px-4 py-2">
                    <Input
                      name="description"
                      value={item.description || ""}
                      onChange={(e) => handleChange(e, index)}
                    />
                  </td>
                  <td className="border px-4 py-2">
                    <Input
                      name="quantity"
                      type="number"
                      value={item.quantity || ""}
                      onChange={(e) => handleChange(e, index)}
                    />
                  </td>
                  <td className="border px-4 py-2">
                    <Input
                      name="unit_price"
                      type="number"
                      value={item.unit_price || ""}
                      onChange={(e) => handleChange(e, index)}
                    />
                  </td>
                  <td className="border px-4 py-2">
                    <Input
                      name="total_price"
                      type="number"
                      value={item.total_price || ""}
                      onChange={(e) => handleChange(e, index)}
                    />
                  </td>
                  <td className="border px-4 py-2 flex justify-center">
                    <Button
                      type="button"
                      variant="default"
                      className="rounded"
                      onClick={() => handleDeleteItem(index)}
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Button type="button" variant="default" onClick={handleAddItem}>
        Add new
      </Button>

      {/* Billing Info */}
      <div>
        <Label htmlFor="payment_terms">Payment Terms</Label>
        <Input
          id="payment_terms"
          name="payment_terms"
          value={formData.billing_info?.payment_terms || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              billing_info: {
                ...formData.billing_info,
                payment_terms: e.target.value,
              },
            })
          }
        />
      </div>

      <div>
        <Label htmlFor="bank_details">Bank Details</Label>
        <Input
          id="bank_details"
          name="bank_details"
          value={formData.billing_info?.bank_details || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              billing_info: {
                ...formData.billing_info,
                bank_details: e.target.value,
              },
            })
          }
        />
      </div>

      {/* Totals Section */}
      <div>
        <Label htmlFor="subtotal">Subtotal</Label>
        <Input
          id="subtotal"
          name="subtotal"
          type="number"
          value={formData.totals?.subtotal || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              totals: { ...formData.totals, subtotal: e.target.value },
            })
          }
        />
      </div>

      <div>
        <Label htmlFor="grand_total">Grand Total</Label>
        <Input
          id="grand_total"
          name="grand_total"
          type="number"
          value={formData.totals?.grand_total || ""}
          onChange={(e) =>
            setFormData({
              ...formData,
              totals: { ...formData.totals, grand_total: e.target.value },
            })
          }
        />
      </div>

      {/* Submit Button */}
      <div className="mt-4">
        <Button
          type="submit"
          variant="default"
          onClick={() => setSubmitted(true)}
        >
          Submit
        </Button>
      </div>

      {submitted && (
        <div className="mt-4">
          <Label className="text-sm font-medium">Task Result</Label>
          <div className="mt-2 p-4 bg-green-100 rounded">
            <pre className="text-sm text-gray-700">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </form>
  );
};

export default InvoiceForm;
