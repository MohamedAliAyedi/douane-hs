from pymongo import MongoClient
from core.config import settings

# MongoDB client
mongo_client = MongoClient(settings.MONGODB_URL)
db = mongo_client['hs_code_app']

# Collections
users_collection = db['users']
bots_collection = db['bots']