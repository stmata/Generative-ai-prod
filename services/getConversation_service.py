from services.saveConversation_service import load_conversation
from utils.cache_config import config_cache
from services.mongodb_connection import MongoDBManager

db_manager = MongoDBManager()

config_collection = db_manager.get_collection("config")

async def get_conversation(session_id: str) -> list:
    config_doc = config_collection.find_one()
    
    nbreMessage = 15  # default
    if config_doc and "messageValue" in config_doc:
        nbreMessage = config_doc["messageValue"]
    print(nbreMessage)
    conversation = await load_conversation(session_id)
    return conversation, nbreMessage
