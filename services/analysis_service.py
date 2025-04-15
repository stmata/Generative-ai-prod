import ast
from openai import AzureOpenAI
import os
from dotenv import load_dotenv
from datetime import datetime
from utils.prompt_config import get_analysis_prompt

load_dotenv()

try:
    client = AzureOpenAI(
    api_key=os.getenv("API_KEY"),
    api_version=os.getenv("OPENAI_API_VERSION"),
    azure_endpoint=os.getenv("API_BASE")
)
except Exception as e:
    raise RuntimeError(f"Erreur lors de l'initialisation du client Azure OpenAI : {e}")

def compute_time_stats(conversation_history):
    """
    Calcule :
      - le nombre total de messages,
      - la durée totale active de la conversation (exclut les longues pauses),
      - le nombre de fois où l'utilisateur est revenu après plus de 30 minutes.
    """
    if not conversation_history:
        return {
            "total_messages": 0,
            "total_duration_minutes": 0,
            "user_returned_after_30mins": False,
            "num_gaps_over_30mins": 0
        }

    conversation_history_sorted = sorted(conversation_history, key=lambda x: x["timestamp"])

    times = [datetime.fromisoformat(msg["timestamp"].replace("Z", "")) for msg in conversation_history_sorted]

    total_messages = len(conversation_history_sorted)
    num_gaps_over_30mins = 0
    total_active_time = 0  

    for i in range(1, len(times)):
        diff = times[i] - times[i - 1]
        diff_minutes = diff.total_seconds() / 60.0

        if diff_minutes > 30:
            num_gaps_over_30mins += 1
        else:
            total_active_time += diff_minutes  

    user_returned_after_30mins = num_gaps_over_30mins > 0 

    return {
        "total_messages": total_messages,
        "total_duration_minutes": round(total_active_time, 2),  
        "user_returned_after_30mins": user_returned_after_30mins,
        "num_gaps_over_30mins": num_gaps_over_30mins
    }

def compute_size_stats(conversation_history):
    """
    Calcule la taille (nombre de caractères) moyenne des messages
    pour l'utilisateur et pour l'assistant.
    """
    user_sizes = []
    assistant_sizes = []

    for msg in conversation_history:
        size = msg.get("size", len(msg["content"]))
        if msg["role"] == "user":
            user_sizes.append(size)
        elif msg["role"] == "assistant":
            assistant_sizes.append(size)

    avg_user_size = sum(user_sizes) / len(user_sizes) if user_sizes else 0
    avg_ai_size = sum(assistant_sizes) / len(assistant_sizes) if assistant_sizes else 0

    return {
        "avg_user_size": avg_user_size,
        "avg_ai_size": avg_ai_size
    }

def analyze_final_idea(conversation_history, final_idea):
    prompt = get_analysis_prompt(conversation_history, final_idea)
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini", 
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Tu es un expert en évaluation d'idées. "
                        "Tu dois renvoyer UNIQUEMENT un dictionnaire Python valide."
                    )
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.0
        )
        raw_response = response.choices[0].message.content
        parsed = ast.literal_eval(raw_response)
        originality_score = parsed.get('originality_score', 0)
        matching_score = parsed.get('matching_score', 0)
        assistant_influence_score = parsed.get('assistant_influence_score', 0)
        analysis_details = parsed.get('analysis_details', {})

    except Exception as e:
        originality_score = 0
        matching_score = 0
        assistant_influence_score = 0
        analysis_details = f"Erreur lors de la récupération du dict Python : {str(e)}"

    return originality_score, matching_score, analysis_details, assistant_influence_score
