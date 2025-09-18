from flask import Flask, request, jsonify
from flask_cors import CORS
import easyocr
from PIL import Image
import base64
from io import BytesIO
import json
import openai

app = Flask(__name__)

# Enable CORS for all domains
CORS(app)

# Set up OpenAI API key
openai.api_key = "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"  # Replace with your OpenAI API key

# Initialize EasyOCR reader
reader = easyocr.Reader(['en', 'fr'])  # You can add more languages if needed

# Endpoint for OCR processing
@app.route('/api/check', methods=['POST'])
def check():
    try:
        # Get the image data from the request
        data = request.get_json()
        image_data = data['image']
        
        # Strip the Base64 prefix if it exists
        if image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]

        # Decode base64 to image
        img_bytes = base64.b64decode(image_data)
        img = Image.open(BytesIO(img_bytes))

        # Perform OCR using EasyOCR
        result = reader.readtext(img, detail=0)  # detail=0 gives only the text (no positions)

        # Concatenate all the text into a single string
        full_text = " ".join(result)  # Join the list of extracted texts into a single string

        print(full_text)  # Log the full extracted text

        # Send the extracted text to OpenAI for processing with detailed instructions
        prompt = f"""
        You are an AI model trained to extract key details from an invoice. 
        Here is the invoice text:

        "{full_text}"

        Please extract the following data and return it in JSON format:

        1. invoiceHeader:
            - companyName
            - invoiceNumber
            - date
            - vatNumber

        2. senderAddress:
            - street
            - businessPark
            - location
            - postCode

        3. recipientAddress:
            - company
            - location
            - zone
            - postCode

        4. recipientContact:
            - type

        5. itemizedList: List of items, where each item has:
            - code
            - description
            - quantity
            - unitPrice
            - totalPrice

        6. financialInfo:
            - paymentTerms
            - bankDetails (bank, sortCode, accountNumber, swiftCode)
            - billingInfo

        7. totals:
            - subtotal
            - vatAmount
            - grandTotal

        8. additionalNotes:
            - termsAndConditions
        """

        # Call OpenAI's Chat API to process the invoice text and return structured JSON
        response = openai.ChatCompletion.create(
            model="gpt-4",  # Use the correct model, like GPT-4
            messages=[
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,  # Lower temperature for more structured and predictable results
            max_tokens=1000  # Adjust max_tokens as needed
        )

        # Get the response from OpenAI (the JSON should be in the response's "choices" field)
        response_text = response['choices'][0]['message']['content'].strip()

        # Try to parse the response into JSON format
        try:
            parsed_json = json.loads(response_text)
            return jsonify(parsed_json)  # Return the parsed JSON from OpenAI
        except json.JSONDecodeError:
            return jsonify({'error': 'Failed to parse OpenAI response', 'details': response_text}), 400

    except Exception as e:
        # Return error if any issue occurs during OCR or OpenAI processing
        return jsonify({'error': str(e)}), 400


if __name__ == '__main__':
    app.run(debug=True)
