import json
import pickle
import re
import shutil
import os
import time
import csv
from typing import List
from collections import defaultdict
import faiss
import pdfplumber
from fastapi import APIRouter, UploadFile, HTTPException, File, Depends
from langchain_community.embeddings import HuggingFaceBgeEmbeddings
from langchain_community.vectorstores import FAISS
from longtrainer.trainer import LongTrainer
from sentence_transformers import SentenceTransformer
from langchain_ollama import ChatOllama

from models.hscode import *
from core.config import settings
from core.database import bots_collection
from core.dependencies import get_current_user
from .search import hs_search_service

router = APIRouter()

# Global variables for data and models
headings_dict = {}
csv_dict = {}
index = None
id_to_info = None
trainer = None
bot_id = None
new_vector_store = None
ensemble_retriever = None
chat_history = []
hierarchy = {}
all_codes = {}

# Initialize models
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

llm = ChatOllama(
    model=settings.OLLAMA_CHAT_MODEL,
    temperature=0.5,
    max_tokens=1024,
    model_kwargs={
        "top_p": 0.5,
        "stream": False
    }
)

json_llm = ChatOllama(
    model=settings.OLLAMA_CHAT_MODEL,
    temperature=0,
    max_tokens=2048,
)

embeddings = HuggingFaceBgeEmbeddings(
    model_name="BAAI/bge-m3",
    model_kwargs={"device": "cuda:0"},
    encode_kwargs={"normalize_embeddings": True}
)

# Utility functions
def list_files_with_extensions(root_folder, extensions):
    all_paths = []
    for dirpath, _, filenames in os.walk(root_folder):
        for filename in filenames:
            if filename.startswith('~$'):
                continue
            if filename.lower().endswith(tuple(extensions)):
                all_paths.append(os.path.join(dirpath, filename))
    return all_paths

def extract_text_from_pdfs(paths):
    """Extract text from all PDFs in the specified folder."""
    data = []
    for filename in paths:
        if filename.endswith('.pdf'):
            with pdfplumber.open(filename) as pdf:
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        data.append(text)
    return data

def preprocess_data_with_headings(raw_data):
    """Preprocess the raw data and create a dictionary of headings and related H.S. codes."""
    headings_dict = {}
    for entry in raw_data:
        lines = entry.split('\n')
        current_heading = ""
        for line in lines:
            if any(line.startswith(f"{code}.") for code in range(1, 100)):
                current_heading = line.strip()
                headings_dict[current_heading] = []
            elif current_heading:
                headings_dict[current_heading].append(line.strip())
    return headings_dict

def load_csv_data(csv_paths):
    """Load the CSV data into a dictionary for fast lookups."""
    csv_dict = {}
    for csv_path in csv_paths:
        with open(csv_path, mode='r') as file:
            reader = csv.reader(file)
            next(reader)
            for row in reader:
                hs_code = row[0].strip()
                product_name = row[1].strip()
                csv_dict[hs_code] = product_name
    return csv_dict

def query_data(headings_dict, csv_dict, query):
    result = {}
    for heading, codes in headings_dict.items():
        if heading.startswith(query):
            result = {
                "heading": heading,
                "related_hs_codes": codes
            }
            return json.dumps(result, indent=4)

    for heading, codes in headings_dict.items():
        for code in codes:
            if code.startswith(query):
                description = code.split(' - ', 1)[-1]
                result = {
                    "hs_code": query,
                    "description": description.strip()
                }
                return json.dumps(result, indent=4)

    if query in csv_dict:
        result = {
            "hs_code": query,
            "description": csv_dict[query]
        }
        return json.dumps(result, indent=4)

    result = {"error": "No matching heading or H.S. code found."}
    return json.dumps(result, indent=4)

def insert_periods(query):
    results = []
    for i in range(len(query)):
        modified_string = query[:i + 1] + '.' + query[i + 1:]
        results.append(modified_string)
    return results

def is_valid_response(response):
    try:
        response_json = json.loads(response)
        if isinstance(response_json, dict) and "error" in response_json:
            return response_json["error"] != "No matching heading or H.S. code found."
        return True
    except json.JSONDecodeError:
        return True

# FAISS functions
def is_valid_hs_code(text):
    """Check if the text matches an HS code pattern."""
    return bool(re.match(r"^\d+(\.\d+)?(-\d+)?$", text.strip()))

def create_faiss_index(headings_dict, csv_dict):
    """Create a Faiss index and mapping dictionary."""
    data = []
    id_to_info = {}

    for heading, codes in headings_dict.items():
        data.append(heading)
        id_to_info[len(data) - 1] = {"heading": heading, "hs_code": None, "description": ""}

        for code in codes:
            data.append(code)
            parts = code.split(" - ", 1)
            hs_code = parts[0].strip()
            description = parts[1].strip() if len(parts) > 1 else ""
            if not is_valid_hs_code(hs_code):
                description = f"{hs_code} {description}".strip()
                hs_code = None

            id_to_info[len(data) - 1] = {
                "heading": heading,
                "hs_code": hs_code,
                "description": description,
            }

    for hs_code, product_name in csv_dict.items():
        entry = f"{hs_code} - {product_name}"
        data.append(entry)
        id_to_info[len(data) - 1] = {
            "heading": None,
            "hs_code": hs_code,
            "description": product_name,
        }

    embeddings_data = embedding_model.encode(data, convert_to_numpy=True)
    index = faiss.IndexFlatL2(embeddings_data.shape[1])
    index.add(embeddings_data)

    return index, id_to_info

def search_with_faiss(index, id_to_info, query, top_k):
    """Search the Faiss index and return top-k results."""
    query_embedding = embedding_model.encode([query], convert_to_numpy=True)
    distances, indices = index.search(query_embedding, top_k)

    results = []
    for i in range(len(indices[0])):
        result_id = indices[0][i]
        result_info = id_to_info.get(result_id, {"heading": None, "hs_code": None, "description": ""})
        result_info["distance"] = float(distances[0][i])
        result_info = {k: v for k, v in result_info.items() if v is not None}
        results.append(result_info)

    return results

def save_faiss_index_and_info(index, id_to_info, index_file='faiss_index.bin', info_file='id_to_info.pkl'):
    """Save the Faiss index and metadata to disk."""
    faiss.write_index(index, index_file)
    with open(info_file, 'wb') as f:
        pickle.dump(id_to_info, f)

def load_faiss_index_and_info(index_file='faiss_index.bin', info_file='id_to_info.pkl'):
    """Load the Faiss index and metadata from disk."""
    if not os.path.exists(index_file) or not os.path.exists(info_file):
        raise FileNotFoundError("Index or metadata file not found.")

    index = faiss.read_index(index_file)
    with open(info_file, 'rb') as f:
        id_to_info = pickle.load(f)

    return index, id_to_info

# Initialize data on startup
@router.on_event("startup")
def load_data():
    """Load data on startup."""
    global headings_dict, csv_dict, index, id_to_info, trainer, bot_id, new_vector_store, ensemble_retriever, hierarchy, all_codes

    root_folder = settings.AI_CLASSIFICATION_PATH
    pdf_folder_path = list_files_with_extensions(root_folder, ["pdf"])
    csv_file_path = list_files_with_extensions(root_folder, ["csv"])

    headings_file_path = 'headings_dict.json'
    csv_data_file_path = 'csv_dict.json'

    # Load or create headings and CSV data
    if os.path.exists(headings_file_path) and os.path.exists(csv_data_file_path):
        with open(headings_file_path, 'r') as f:
            headings_dict = json.load(f)
        with open(csv_data_file_path, 'r') as f:
            csv_dict = json.load(f)
    else:
        raw_data = extract_text_from_pdfs(pdf_folder_path)
        headings_dict = preprocess_data_with_headings(raw_data)
        csv_dict = load_csv_data(csv_file_path)

        with open(headings_file_path, 'w') as f:
            json.dump(headings_dict, f)
        with open(csv_data_file_path, 'w') as f:
            json.dump(csv_dict, f)

    # Load or create FAISS index
    index_file = 'faiss_index.bin'
    info_file = 'id_to_info.pkl'

    if os.path.exists(index_file) and os.path.exists(info_file):
        index, id_to_info = load_faiss_index_and_info(index_file, info_file)
    else:
        index, id_to_info = create_faiss_index(headings_dict, csv_dict)
        save_faiss_index_and_info(index, id_to_info, index_file, info_file)

    # Configure trainer
    trainer, bot_id = configure_trainer()
    
    # Load vector store
    try:
        new_vector_store = FAISS.load_local(
            f"faiss_index_{bot_id}", embeddings, allow_dangerous_deserialization=True
        )
        ensemble_retriever = new_vector_store.as_retriever(search_kwargs={"k": 5})
    except Exception as e:
        print(f"Error loading vector store: {e}")

    # Load HS hierarchy data
    file_path = f"{settings.AI_CLASSIFICATION_PATH}/hs_code.csv"
    if os.path.exists(file_path):
        hierarchy, all_codes = load_hs_data(file_path)

    # Initialize HS Code search service
    hs_search_service.load_data_and_models()

def configure_trainer():
    global embeddings, llm
    bot_name = "server_v2"

    prompt = """
    You are an intelligent assistant specializing in answering questions about Harmonized System (HS) codes, products, and classifications. Your role is to assist the user by providing clear and concise information based on the descriptions extracted from the PDF and CSV files.
    Do not provide any additional  metadata or context in your response. Also Don`t rewrite the question.

    {context}

    When responding to user queries:
    1. Provide relevant descriptions for the HS codes or topics based on the available data.
    2. If a specific HS code is mentioned, include its corresponding description.
    3. If the requested information is unavailable, acknowledge your limitations and avoid making up answers.
    4. Maintain professionalism and keep your responses focused on the user's query.

    Handle queries based on the following categories:
    1. *HS Code Generation*:  
       - Analyze the product description and suggest the most relevant HS code.  
       - If multiple HS codes could apply, list the top suggestions with brief justifications.  
       - If no matching HS code is found, indicate that the product may require further classification. 

    2. *Description Lookup from HS Code*:  
       - Provide a detailed product description or classification for the given HS code.  
       - If the code is invalid or not found, state that clearly and suggest verifying the input.  

    3. *Court Case References*:  
       - Retrieve legal cases or precedents referring to the specified HS code.  
       - Mention the case name, date, and a brief summary of the issue related to the HS code.  
       - If no cases are found, state that no legal references are available for the given code.  

    4. *General Chat*:  
       - Respond helpfully to general inquiries, including greetings or non-specialized questions.  
       - If the query falls outside your specialized areas but is relevant, try to answer it politely.  
       - If it is unrelated or inappropriate, politely inform the user.  

    Respond based on the available information. If the necessary data isn't present in the context, notify the user directly and suggest potential next steps if applicable.

    Chat History: {chat_history}
    Question: {question}
    Answer:
    """

    trainer = LongTrainer(
        mongo_endpoint=settings.MONGODB_URL,
        prompt_template=prompt,
        num_k=10,
        chunk_size=1024,
        llm=llm,
        embedding_model=embeddings,
        chunk_overlap=64,
        ensemble=False,
        max_token_limit=1024
    )

    if os.path.exists(f'{bot_name}-config.json'):
        bot_id = json.load(open(f'{bot_name}-config.json', 'r'))['bot_id']
        trainer.load_bot(bot_id=bot_id)
    else:
        bot_id = trainer.initialize_bot_id()
        bot_document = {'bot_id': bot_id}
        bots_collection.insert_one(bot_document)

        paths = list_files_with_extensions(settings.AI_CLASSIFICATION_PATH, ["csv", "pdf"])
        for path in paths:
            print('Indexing Path: ', path)
            trainer.add_document_from_path(path, bot_id)

        trainer.create_bot(bot_id)
        with open(f'{bot_name}-config.json', 'w') as f:
            json.dump({"bot_id": bot_id}, f)

    trainer.set_custom_prompt_template(bot_id=bot_id, prompt_template=prompt)
    return trainer, bot_id

# Helper functions for HS hierarchy
def load_hs_data(file_path):
    """Load HS Code data from a CSV and build a parent-child hierarchy."""
    hierarchy = defaultdict(lambda: {"name": None, "children": {}})
    all_codes = {}
    pending_8_digit_codes = []

    with open(file_path, mode='r', encoding='utf-8') as file:
        reader = csv.DictReader(file)
        for row in reader:
            hs_code = row['HS Code'].strip().replace(" ", "")
            name = row['Product Name'].strip()

            if len(hs_code) == 1:
                continue

            if len(hs_code) == 2:
                chapter = hs_code
                hierarchy[chapter]["name"] = name

            elif len(hs_code) == 4:
                chapter = hs_code[:2]
                if chapter not in hierarchy:
                    hierarchy[chapter] = {"name": None, "children": {}}
                hierarchy[chapter]["children"][hs_code] = {
                    "name": name,
                    "children": [],
                    "value": hs_code,
                    "keyword": None
                }

            elif len(hs_code) == 6:
                chapter = hs_code[:2]
                heading = hs_code[:4]
                if chapter not in hierarchy:
                    hierarchy[chapter] = {"name": None, "children": {}}
                if heading not in hierarchy[chapter]["children"]:
                    hierarchy[chapter]["children"][heading] = {
                        "name": None,
                        "children": [],
                        "value": heading,
                        "keyword": None
                    }
                hierarchy[chapter]["children"][heading]["children"].append({
                    "id": hs_code,
                    "label": name,
                    "children": [],
                    "keyword": None
                })

            elif len(hs_code) == 8:
                if hs_code.endswith("00"):
                    chapter = hs_code[:2]
                    heading = hs_code[:4]
                    if chapter not in hierarchy:
                        hierarchy[chapter] = {"name": None, "children": {}}
                    if heading not in hierarchy[chapter]["children"]:
                        hierarchy[chapter]["children"][heading] = {
                            "name": None,
                            "children": [],
                            "value": heading,
                            "keyword": None
                        }
                    hierarchy[chapter]["children"][heading]["children"].append({
                        "id": hs_code,
                        "label": name,
                        "keyword": None
                    })
                else:
                    pending_8_digit_codes.append((hs_code, name))

            all_codes[hs_code] = name

    # Link 8-digit codes with their 6-digit parents
    for hs_code, name in pending_8_digit_codes:
        parent_code = hs_code[:6]
        parent_found = False

        for chapter_data in hierarchy.values():
            for heading_data in chapter_data["children"].values():
                for hs in heading_data["children"]:
                    if hs["id"] == parent_code:
                        hs["children"].append({
                            "id": hs_code,
                            "label": name,
                            "keyword": None
                        })
                        parent_found = True
                        break
                if parent_found:
                    break
            if parent_found:
                break

    return hierarchy, all_codes

# API Endpoints
@router.post("/query/")
async def query(query_request: QueryRequest, current_user: dict = Depends(get_current_user)):
    user_query = query_request.query.strip()
    if '.' in user_query:
        response = query_data(headings_dict, csv_dict, user_query)
        if is_valid_response(response):
            return json.loads(response)
        else:
            raise HTTPException(status_code=404, detail="No valid response for the original query.")
    else:
        modified_queries = insert_periods(user_query)
        for modified_query in modified_queries:
            response = query_data(headings_dict, csv_dict, modified_query)
            if is_valid_response(response):
                return json.loads(response)

        original_response = query_data(headings_dict, csv_dict, user_query)
        if is_valid_response(original_response):
            return json.loads(original_response)
        else:
            raise HTTPException(status_code=404, detail="No valid response for the original query.")

@router.post("/query_words/")
async def query_faiss(request: QueryRequestWithK, current_user: dict = Depends(get_current_user)):
    """Query the Faiss index for the top-k results."""
    if index is None or id_to_info is None:
        raise HTTPException(status_code=500, detail="Faiss index not loaded.")

    results = search_with_faiss(index, id_to_info, request.query, request.top_k)
    if not results:
        raise HTTPException(status_code=404, detail="No matching results found.")
    return results

@router.get("/files/info")
async def get_file_info(current_user: dict = Depends(get_current_user)):
    """Returns the total number of PDFs in the folder and rows in the CSV."""
    try:
        root_folder = settings.AI_CLASSIFICATION_PATH
        pdf_folder_path = list_files_with_extensions(root_folder, ["pdf"])
        csv_file_path = list_files_with_extensions(root_folder, ["csv"])
        
        pdf_count = len([f for f in pdf_folder_path if f.endswith('.pdf')])

        row_count = 0
        for item in csv_file_path:
            with open(item, 'r') as f:
                reader = csv.reader(f)
                row_count += sum(1 for row in reader) - 1

        return {
            "pdf_count": pdf_count,
            "csv_row_count": row_count,
            "CSVs": csv_file_path,
            "PDFs": pdf_folder_path
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving file info: {str(e)}")

def new_chat(bot_id):
    chat_id = trainer.new_chat(bot_id)
    bots_collection.update_one({'bot_id': bot_id}, {'$push': {'chat_ids': chat_id}})
    return chat_id

@router.get("/new_chat/")
async def new_chat_user(current_user: dict = Depends(get_current_user)):
    global bot_id, chat_history

    if not bots_collection.find_one({'bot_id': bot_id}):
        raise HTTPException(status_code=404, detail="Bot ID not found")

    try:
        chat_id = new_chat(bot_id)
        chat_history = []
        return {"chat_id": chat_id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

ALLOWED_EXTENSIONS = {".txt", ".pdf", ".md", ".markdown", ".html", ".csv", ".docx", ".jpg", ".jpeg", ".png"}

async def save_uploaded_file(file: UploadFile, bot_id: str) -> str:
    bot_folder = f"./uploads/{bot_id}/files"
    os.makedirs(bot_folder, exist_ok=True)
    file_path = os.path.join(bot_folder, file.filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    file.file.close()
    return file_path

def is_allowed_file(filename):
    return any(filename.endswith(ext) for ext in ALLOWED_EXTENSIONS)

@router.put("/update_chatbot/")
async def update_bot(files: List[UploadFile] = File(None), current_user: dict = Depends(get_current_user)):
    global bot_id

    try:
        paths = [await save_uploaded_file(file, bot_id) for file in files if
                 is_allowed_file(file.filename)] if files else []

        trainer.update_chatbot(paths=paths, links=[], search_query=None, bot_id=bot_id, use_unstructured=False)
        chat_id = new_chat(bot_id)

        return {"status": "Update successful"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/response")
async def get_response(query_data: QueryData, current_user: dict = Depends(get_current_user)):
    global bot_id

    chat_id = query_data.chat_id
    query = query_data.query

    if not bots_collection.find_one({'bot_id': bot_id, 'chat_ids': chat_id}):
        raise HTTPException(status_code=404, detail="Chat ID not found or not associated with the given Bot ID")

    try:
        try:
            additional_context = search_with_faiss(index, id_to_info, query, 3)
        except Exception as e:
            additional_context = ""

        updated_query = f"""
        Additional Context:
        {additional_context}
        
        Query:
        {query}
        """

        response, ref = trainer.get_response(updated_query, bot_id, chat_id)

        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/get_description/")
async def get_response_desc(descriptionData: DescriptionData, current_user: dict = Depends(get_current_user)):
    global bot_id

    query = descriptionData.query

    try:
        context = ensemble_retriever.invoke(query)
        try:
            additional_context = query_data(headings_dict, csv_dict, query)
        except Exception as e:
            additional_context = ""

        prompt_template = f"""
        You are a multilingual assistant specializing in HS code generation or description generation based on HS code. Use the provided context to generate responses in English. Ensure accuracy, relevance, and clarity in your responses.
        Do not provide any additional  metadata or context in your response. Also Don`t rewrite the question.

        Context:
        {context}
        
        ---
        
        Additional Context:
        {additional_context}
        
        
        Handle queries based on the following categories:
        1. HS Code Generation:  
           - Analyze the product description and suggest the most relevant HS code.  
           - If multiple HS codes could apply, list the top suggestions with brief justifications.  
           - If no matching HS code is found, indicate that the product may require further classification. 

        2. Description Lookup from HS Code:  
           - Provide a detailed product description or classification for the given HS code.  
           - If the code is invalid or not found, state that clearly and suggest verifying the input.  


        Structure of Code:
            - All 2 digit codes are chapters, 4 digit code are headings and 6 digit codes are HS codes, 8 digits HS codes are sub child HS codes
            - The 1st + 2nd Index is Chapter, 1st + 2nd +3rd + 4th indices is heading and 7th or 8th decimals are Childs 
            - For example if we have a code 350211 then chapter is 35 , Heading is 3502 and HS codes 3502.11 or 350211  :
            - Some Context Documents have codes In-terms of CN Key:
                    CN_KEY: 10129000080
                    CN_CODE: 0101 29
              We can get the Chapter id as 01, Heading ID as 0101 and HS Code as 010129 

        Respond based on the available information. If the necessary data isn't present in the context, notify the user directly and suggest potential next steps if applicable.


        Question: {query}
        Answer:
        """

        response = llm.invoke(prompt_template).content

        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/get_court_case/")
async def get_response_court(descriptionData: DescriptionData, current_user: dict = Depends(get_current_user)):
    global bot_id

    query = descriptionData.query

    try:
        context = ensemble_retriever.invoke(query)
        try:
            additional_context = query_data(headings_dict, csv_dict, query)
        except Exception as e:
            additional_context = ""

        prompt_template = f"""
        You are a multilingual assistant specializing in HS code legal references, and general inquiries. Use the provided context to generate responses in English. Ensure accuracy, relevance, and clarity in your responses. 
        Do not provide any additional  metadata or context in your response. Also Don`t rewrite the question.

        Context:
        {context}
        
        ---
        
        Additional Context:
        {additional_context}

        You have to Handle all queries related to Court Case/References:  
           - Retrieve legal cases or precedents referring to the specified HS code.  
           - Mention the case name, date, and a brief summary of the issue related to the HS code.  
           - If no cases are found, state that no legal references are available for the given code.  
        
        Structure of Code:
            - All 2 digit codes are chapters, 4 digit code are headings and 6 digit codes are HS codes, 8 digits HS codes are sub child HS codes
            - The 1st + 2nd Index is Chapter, 1st + 2nd +3rd + 4th indices is heading and 7th or 8th decimals are Childs 
            - For example if we have a code 350211 then chapter is 35 , Heading is 3502 and HS codes 3502.11 or 350211 :
            - Some Context Documents have codes In-terms of CN Key:
                    CN_KEY: 10129000080
                    CN_CODE: 0101 29
              We can get the Chapter id as 01, Heading ID as 0101 and HS Code as 010129 


        Respond based on the available information. If the necessary data isn't present in the context, notify the user directly and suggest potential next steps if applicable.

        Question: {query}
        Answer:
        """

        response = llm.invoke(prompt_template).content

        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/get_response/")
async def get_response_new(descriptionData: DescriptionData, current_user: dict = Depends(get_current_user)):
    global bot_id, chat_history

    query = descriptionData.query

    try:
        context = ensemble_retriever.invoke(query)
        try:
            additional_context = query_data(headings_dict, csv_dict, query)
        except Exception as e:
            additional_context = ""

        prompt_template = f"""
   You are an intelligent, multilingual assistant. Use the provided context to generate accurate, relevant, and clear responses based solely on the available information. Do not provide any additional  metadata or context in your response. Also Don`t rewrite the question.

   Context:
   {context}

   ---

   Additional Context:
   {additional_context}

   Categories you specialize in:

   1. *HS Code Generation*:  
      - Analyze the product description and suggest the most relevant HS code(s).
      - Provide brief justifications for multiple potential HS codes.
      - If no matching HS code is found, mention that further classification might be needed.
      

   2. *Description Lookup from HS Code*:  
      - Provide a detailed description for the given HS code.
      - If the code is invalid or not found, inform the user clearly.

   3. *Court Case References*:  
      - Retrieve and summarize legal cases referring to the HS code (include case name, date, and issue).
      - If no legal references are available, notify the user.

    4. *General and Friendly Chat*:  
       - For greetings like 'Hi', 'Hello', or 'Thanks', respond politely and naturally.
       - For queries unrelated to HS codes, respond helpfully or acknowledge them politely.
       - If the query is inappropriate or irrelevant, kindly inform the user.
       
    Structure of Code:
        - All 2 digit codes are chapters, 4 digit code are headings and 6 digit codes are HS codes, 8 digits HS codes are sub child HS codes
        - The 1st + 2nd Index is Chapter, 1st + 2nd +3rd + 4th indices is heading and 7th or 8th decimals are Childs 
        - For example if we have a code 350211 then chapter is 35 , Heading is 3502 and HS codes 3502.11 or 350211  :
        - Some Context Documents have codes In-terms of CN Key:
                CN_KEY: 10129000080
                CN_CODE: 0101 29
          We can get the Chapter id as 01, Heading ID as 0101 and HS Code as 010129 


   Respond with only the answer based on the context provided. If there is insufficient data, notify the user and suggest a potential next step.
    Must Respond in English only.
    
    
   ---

   Chat History: {chat_history[-5:]}

   ---

   Question: {query}
   Answer:
   """

        response = llm.invoke(prompt_template).content

        chat_history.append({
            "question:": query,
            "answer": response
        })

        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def search_hs_code(query, hierarchy):
    """Search for an HS code or heading and return only the first child key without the 'name' field."""
    query = query.strip().replace(" ", "")
    chapter = query[:2]
    heading = query[:4] if len(query) > 2 else None

    if chapter not in hierarchy:
        return {"error": f"Chapter '{chapter}' not found"}

    def add_value_to_children(children, value):
        """Recursively add the 'value' key to each child and its descendants."""
        for child in children:
            child["value"] = value
            if "children" in child:
                add_value_to_children(child["children"], value)

    if heading and heading in hierarchy[chapter]["children"]:
        head_data = hierarchy[chapter]["children"][heading]
        add_value_to_children(head_data["children"], query)
        return head_data["children"]

    return {"error": "No valid heading found"}

def replace_keyword_with_abc(data, query):
    """Recursively replace all 'keyword' fields with 'abc'."""
    for item in data:
        if "keyword" in item:
            item["keyword"] = query

        if "children" in item and isinstance(item["children"], list):
            replace_keyword_with_abc(item["children"], query)

    return data

def main_tree(query):
    global new_vector_store, hierarchy

    faiss_retriever_i = new_vector_store.as_retriever(search_kwargs={"k": 10})
    context = faiss_retriever_i.invoke(query)

    unique_first_two_chars = set()
    for item in context:
        page_content = item.page_content
        for line in page_content.split('\n'):
            if 'CN_CODE:' in line:
                cn_code = line.split(':')[1].strip()
                unique_first_two_chars.add(cn_code[:4])

    unique_first_two_chars_list = list(unique_first_two_chars)

    heading_results = []
    for item in unique_first_two_chars_list:
        result = search_hs_code(item, hierarchy)
        if result != "No valid heading found" and result is not None:
            updated_result = replace_keyword_with_abc(result, query)

            if isinstance(updated_result, list) and updated_result:
                heading_results.append(updated_result[0])
            elif isinstance(updated_result, dict):
                heading_results.append(updated_result)

    filtered_data = [item for item in heading_results if "error" not in item]
    return filtered_data

@router.post("/query_hs_code/")
async def query_hs_code(request: NewQueryRequest, current_user: dict = Depends(get_current_user)):
    """Query the Faiss index for the top-k results."""
    if index is None or id_to_info is None:
        raise HTTPException(status_code=500, detail="Faiss index not loaded.")

    result = main_tree(request.query)

    if not result:
        raise HTTPException(status_code=404, detail="No matching results found.")
    return result

@router.post("/query_llm/")
async def query_llm(request: NewQueryRequest, current_user: dict = Depends(get_current_user)):
    global llm

    try:
        response = llm.invoke(request.query).content
        return {"response": response}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/vector_search/")
async def query_vectorstore(request: VectorQueryRequest, current_user: dict = Depends(get_current_user)):
    global ensemble_retriever

    try:
        context = ensemble_retriever.invoke(request.query)
        results = search_with_faiss(index, id_to_info, request.query, top_k=request.top_k)

        return {"main_index": context, "second_index": results}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dashboard_stats/")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """Returns optimized statistics for dashboard visualization"""
    try:
        root_folder = settings.AI_CLASSIFICATION_PATH
        pdf_folder_path = list_files_with_extensions(root_folder, ["pdf"])
        csv_file_path = list_files_with_extensions(root_folder, ["csv"])
        
        pdf_count = len(pdf_folder_path)
        csv_count = len(csv_file_path)
        total_files = pdf_count + csv_count
        
        def get_folder_size(folder):
            total = 0
            for entry in os.scandir(folder):
                if entry.is_file():
                    total += entry.stat().st_size
                elif entry.is_dir():
                    total += get_folder_size(entry.path)
            return total
            
        total_size_mb = round(get_folder_size(root_folder) / (1024 * 1024), 2)
        
        def get_top_level_stats(path):
            folders = []
            files = []
            with os.scandir(path) as entries:
                for entry in entries:
                    if entry.is_dir():
                        size = get_folder_size(entry.path)
                        folders.append({
                            "name": entry.name,
                            "size_mb": round(size / (1024 * 1024), 2),
                            "item_count": sum(1 for _ in os.scandir(entry.path))
                        })
                    elif entry.is_file():
                        files.append(entry.name)
            return folders, files
        
        top_folders, _ = get_top_level_stats(root_folder)
        
        extensions = {}
        for file in pdf_folder_path + csv_file_path:
            ext = os.path.splitext(file)[1].lower()
            extensions[ext] = extensions.get(ext, 0) + 1
        
        recent_files = []
        all_files = []
        
        for dirpath, _, filenames in os.walk(root_folder):
            for f in filenames:
                fp = os.path.join(dirpath, f)
                all_files.append({
                    "path": fp,
                    "mtime": os.path.getmtime(fp)
                })
        
        recent_files = sorted(all_files, key=lambda x: x["mtime"], reverse=True)[:5]
        recent_files = [{
            "name": os.path.basename(f["path"]),
            "modified": time.ctime(f["mtime"]),
            "size_mb": round(os.path.getsize(f["path"]) / (1024 * 1024), 3)
        } for f in recent_files]
        
        return {
            "summary": {
                "total_files": total_files,
                "pdf_files": pdf_count,
                "csv_files": csv_count,
                "total_size_mb": total_size_mb,
                "top_folder_count": len(top_folders),
                "recent_files_sample": len(recent_files)
            },
            "file_types": {
                "extensions": extensions,
                "pdf_percentage": round((pdf_count / total_files * 100), 1) if total_files > 0 else 0,
                "csv_percentage": round((csv_count / total_files * 100), 1) if total_files > 0 else 0
            },
            "top_folders": sorted(top_folders, key=lambda x: x["size_mb"], reverse=True)[:5],
            "recent_activity": recent_files
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating stats: {str(e)}")

# New HS Code Search endpoint
@router.post("/search", response_model=List[SearchResult])
async def search_hs_codes(request: SearchRequest, current_user: dict = Depends(get_current_user)):
    """Advanced HS Code search with semantic matching"""
    return hs_search_service.search_hs_codes(request)