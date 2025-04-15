import asyncio
from services.mongodb_connection import MongoDBManager

mongo_manager = MongoDBManager()
collection = mongo_manager.get_collection('chats')

async def save_conversation(session_id: str, new_messages: list):
    """
    Ajoute les nouveaux messages à l'historique de conversation pour une session donnée.
    Si le document n'existe pas, il est créé avec les messages fournis.
    """

    def sync_update():
        existing_doc = collection.find_one({"session_id": session_id})
        
        if existing_doc:
            return collection.update_one(
                {"session_id": session_id},
                {"$push": {"conversation_history": {"$each": new_messages}}}
            )
        else:
            return collection.insert_one({
                "session_id": session_id,
                "conversation_history": new_messages
            })

    result = await asyncio.to_thread(sync_update)
    return result

async def load_conversation(session_id: str) -> list:
    """
    Charge l'historique de conversation pour une session donnée.
    Renvoie une liste de messages (chaque message étant un dict avec 'role' et 'content').
    """
    def sync_find():
        doc = collection.find_one({"session_id": session_id})
        if doc and "conversation_history" in doc:
            return doc["conversation_history"]
        return []
    conversation = await asyncio.to_thread(sync_find)
    return conversation

async def update_final_idea(session_id: str, idea: str):
    """
    Met à jour ou crée un document pour la session donnée en y ajoutant l'idée finale.
    """
    def sync_update():
        return collection.update_one(
            {"session_id": session_id},
            {"$set": {"final_idea": idea}},
            upsert=True
        )
    result = await asyncio.to_thread(sync_update)
    return result
