from services.saveConversation_service import load_conversation

async def get_conversation(session_id: str) -> list:
    """
    Récupère l'historique de conversation pour une session donnée depuis la base de données.
    Retourne une liste de messages, chaque message étant un dictionnaire contenant 'role' et 'content'.
    """
    conversation = await load_conversation(session_id)
    return conversation
