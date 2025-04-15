import asyncio
from datetime import datetime
from zoneinfo import ZoneInfo
from fastapi import HTTPException
from fastapi.responses import StreamingResponse
from llama_index.core.base.llms.types import ChatMessage, MessageRole
from services.chat_service import get_buffer_for_session, wrapped_client
from services.saveConversation_service import save_conversation  
from utils.prompt_config import get_chat_prompt
from services.mongodb_connection import MongoDBManager
from utils.cache_config import config_cache

CANADA_TZ = ZoneInfo("America/Toronto")
db_manager = MongoDBManager()

if config_cache is None:  
    config_collection = db_manager.get_collection("config")
    config_cache = config_collection.find_one({})

tone = config_cache.get("tone", "Neutral")
style = config_cache.get("style", "Balanced")
text_size = config_cache.get("textSize", "Medium")


SYSTEM_INSTRUCTIONS = get_chat_prompt(tone, style, text_size)

# SYSTEM_INSTRUCTIONS = """
# You are an advanced AI assistant specialized in delivering detailed, precise, and fact-based responses. Your objective is to provide a comprehensive, thoroughly verified answer to the user's query by cross-referencing multiple reliable sources before finalizing your response. 

# **Formatting instructions:**
# - Format your final answer strictly as a JSON object:
# {
#     "answer": "Your detailed answer with each sentence separated by a newline (\\n).",
#     "sources": "List of sources, each on a new line. If there are no sources or it is your own data used, leave this field empty."
# }
# - Ensure that each sentence in the answer is separated by a newline (\\n) to improve readability.
# - Separate each source with a newline (\\n).

# **Instructions:**
# - Provide all essential details directly related to the query with maximum detail.
# - Cross-check and validate your answer using multiple well-established and authoritative sources.
# - Include every source you referenced in your research in your final answer.
# """


async def process_chat_stream(message: str, session_id: str, conversation_history: list) -> StreamingResponse:
    memory_buffer = get_buffer_for_session(session_id)
    user_timestamp = datetime.now(CANADA_TZ).isoformat()
    user_message_metadata = {
        "role": "user",
        "content": message,
        "timestamp": user_timestamp,
        "size": len(message)
    }
    conversation_history.append(user_message_metadata)
    new_message = ChatMessage(
        role=MessageRole.USER,
        content=message
    )
    memory_buffer.put(new_message)
    chat_history = memory_buffer.get()
    messages_to_send = [{"role": "system", "content": SYSTEM_INSTRUCTIONS}]
    messages_to_send += [{"role": msg.role.value.lower(), "content": msg.content} for msg in chat_history[-10:]]
    # for msg in chat_history:
    #     messages_to_send.append({
    #         "role": msg.role.value.lower(),
    #         "content": msg.content
    #     })

    try:
        response = wrapped_client._client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages_to_send,
            temperature=0.3,
            stream=True
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Erreur OpenAI: {str(e)}")
    async def generate():
        full_response = ""
        async for chunk in _iterate_response(response):
            full_response += chunk
            yield chunk
        assistant_timestamp = datetime.now(CANADA_TZ).isoformat()
        assistant_message_metadata = {
            "role": "assistant",
            "content": full_response,
            "timestamp": assistant_timestamp,
            "size": len(full_response)
        }
        conversation_history.append(assistant_message_metadata)
        assistant_message = ChatMessage(role=MessageRole.ASSISTANT, content=full_response)
        memory_buffer.put(assistant_message)
        await save_conversation(session_id, conversation_history)
    
    return StreamingResponse(generate(), media_type="text/plain")

async def _iterate_response(response) -> asyncio.StreamReader:
    """
    Itère sur les chunks de la réponse de manière asynchrone.
    """
    for chunk in response:
        try:
            choices = chunk.choices
            if choices and len(choices) > 0:
                delta = choices[0].delta
                token = getattr(delta, "content", "")
                if token:
                    await asyncio.sleep(0.05)
                    yield token
        except Exception as e:
            continue
