import os
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    # Authentication
    SECRET_KEY: str = "your-super-secret-key-change-this-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # MongoDB
    MONGODB_URL: str = "mongodb+srv://aidouane0:rwK9iub9aLAIPeV9@llm.bcsdrk7.mongodb.net/?retryWrites=true&w=majority&appName=llm"
    
    # Ollama
    OLLAMA_MODEL: str = "llama3.2-vision"
    OLLAMA_CHAT_MODEL: str = "llama3.1:8b-instruct-fp16"
    
    # Application
    DEBUG: bool = True
    
    # Paths
    AI_CLASSIFICATION_PATH: str = "ai calsssifcation"
    
    class Config:
        env_file = ".env"

settings = Settings()