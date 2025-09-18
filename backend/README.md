# Invoice & HS Code Analysis API

A unified FastAPI application that merges invoice analysis and HS code classification functionalities with JWT-based authentication.

## Features

### Authentication

- JWT token-based authentication
- User registration and login
- Protected routes with access token validation
- Secure password hashing with bcrypt

### Invoice Analysis

- AI-powered invoice image analysis using Ollama
- Structured data extraction from invoice images
- Support for multiple invoice formats

### HS Code Classification

- Comprehensive HS code lookup and classification
- FAISS-based vector search for similar codes
- AI chatbot for HS code queries
- Court case references for legal precedents
- Tree structure visualization of HS codes
- Advanced semantic search with nested results

## Project Structure

```
├── main.py                 # Main FastAPI application
├── core/                   # Core configuration and dependencies
│   ├── config.py          # Application settings
│   ├── database.py        # MongoDB connection
│   ├── security.py        # JWT and password utilities
│   └── dependencies.py    # Authentication dependencies
├── auth/                   # Authentication module
│   └── router.py          # Auth endpoints
├── invoice/                # Invoice analysis module
│   └── router.py          # Invoice endpoints
├── hscode/                 # HS code classification module
│   ├── router.py          # HS code endpoints
│   └── search.py          # Advanced HS code search service
├── models/                 # Pydantic models
│   ├── auth.py            # Authentication models
│   ├── invoice.py         # Invoice models
│   └── hscode.py          # HS code models
├── utils/                  # Utility functions
│   └── helpers.py         # Helper functions
├── ai calsssifcation/      # HS code data folder (PDFs and CSVs)
├── data/                   # Advanced search data folder
│   ├── df_Extraction_final.csv
│   ├── df1_updated.csv
│   ├── hs_code.csv
│   └── df_full_content.csv
└── faiss_artifacts/        # FAISS search artifacts
    ├── embeddings.npy
    ├── faiss_index.bin
    └── sbert_paraphrase_MiniLM-L6-v2/
```

## Required Folder Structure

You need to create the following folders at the **root level** of your project (same level as `main.py`):

### 1. `ai calsssifcation/` folder

This folder should contain your PDF and CSV files for basic HS code analysis:

```
ai calsssifcation/
├── *.pdf files (HS code documentation)
├── *.csv files (HS code data)
└── hs_code.csv (main HS code reference file)
```

### 2. `data/` folder

This folder should contain the CSV files for advanced HS code search:

```
data/
├── df_Extraction_final.csv
├── df1_updated.csv
├── hs_code.csv
└── df_full_content.csv
```

### 3. `faiss_artifacts/` folder

This folder should contain the pre-built FAISS index and embeddings:

```
faiss_artifacts/
├── embeddings.npy
├── faiss_index.bin
└── sbert_paraphrase_MiniLM-L6-v2/
    └── (sentence transformer model files)
```

**Important**: All three folders (`ai calsssifcation`, `data`, and `faiss_artifacts`) should be placed at the root level of your project, not inside any subdirectories.

## Installation

1. **Quick Start**: See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed setup instructions.

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Set up environment variables in `.env`:

```env
SECRET_KEY=your-super-secret-key-change-this-in-production
MONGODB_URL=your-mongodb-connection-string
OLLAMA_MODEL=llama3.2-vision
OLLAMA_CHAT_MODEL=llama3.1:8b-instruct-fp16
```

4. Create the required folders and add your data files as described above.

5. Set up Ollama and MongoDB as described in the setup guide.

## Usage

### Start the server:

```bash
python main.py
```

**For detailed setup instructions, see [SETUP_GUIDE.md](SETUP_GUIDE.md)**

### Authentication

1. **Register a user:**

```bash
POST /auth/register
{
    "username": "testuser",
    "email": "test@example.com",
    "password": "securepassword",
    "full_name": "Test User"
}
```

2. **Login to get access token:**

```bash
POST /auth/login
{
    "username": "testuser",
    "password": "securepassword"
}
```

3. **Use the token in headers for protected endpoints:**

```bash
Authorization: Bearer <your-access-token>
```

### Invoice Analysis

**Analyze an invoice image:**

```bash
POST /invoice/analyze-invoice/
Content-Type: multipart/form-data
Authorization: Bearer <your-token>

file: <invoice-image-file>
```

### HS Code Classification

**Basic query HS codes:**

```bash
POST /hscode/query/
Authorization: Bearer <your-token>
{
    "query": "84.01"
}
```

**Advanced semantic search:**

```bash
POST /hscode/search
Authorization: Bearer <your-token>
{
    "query": "computer parts",
    "top_k": 5
}
```

**Get HS code description:**

```bash
POST /hscode/get_description/
Authorization: Bearer <your-token>
{
    "query": "computer parts"
}
```

**Search with FAISS:**

```bash
POST /hscode/query_words/
Authorization: Bearer <your-token>
{
    "query": "electronics",
    "top_k": 5
}
```

## API Documentation

Once the server is running, visit:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Security

- All sensitive endpoints require authentication
- Passwords are hashed using bcrypt
- JWT tokens expire after 30 minutes (configurable)
- CORS is enabled for all origins (configure for production)

## Dependencies

- FastAPI: Web framework
- MongoDB: Database for user and bot data
- Ollama: AI model for invoice analysis and chat
- FAISS: Vector search for HS codes
- LangChain: Document processing and embeddings
- JWT: Authentication tokens
- bcrypt: Password hashing
- Pandas: Data processing for advanced search
- SentenceTransformers: Text embeddings

## Notes

- Make sure Ollama is running with the specified models
- Ensure MongoDB is accessible with the provided connection string
- The `ai calsssifcation` folder should contain your PDF and CSV files for basic HS code analysis
- The `data` folder should contain the CSV files for advanced search functionality
- The `faiss_artifacts` folder should contain pre-built FAISS indexes and embeddings
- Update the SECRET_KEY in production
- If the advanced search data files are not available, the basic HS code functionality will still work
