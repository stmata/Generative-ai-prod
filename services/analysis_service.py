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

from datetime import datetime

def compute_time_stats(conversation_history):
    """
    Calcule, à partir d'une liste de messages dotés de 'role' et 'timestamp' ISO 8601 :
      - total_messages                  : nombre total de messages
      - total_duration_minutes         : somme des écarts (en minutes) entre messages < 30 min
      - num_gaps_over_30mins           : nombre de pauses > 30 min
      - user_returned_after_30mins     : True si au moins une pause > 30 min
      - avg_ai_latency_seconds         : latence moyenne IA (sec) user→assistant
    """
    if not conversation_history:
        return {
            "total_messages": 0,
            "total_duration_minutes": 0.0,
            "num_gaps_over_30mins": 0,
            "user_returned_after_30mins": False,
            "avg_ai_latency_seconds": 0.0
        }

    sorted_msgs = sorted(conversation_history, key=lambda m: m["timestamp"])
    times = []
    roles = []
    for msg in sorted_msgs:
        ts = msg["timestamp"]
        if ts.endswith("Z"):
            ts = ts[:-1] + "+00:00"
        times.append(datetime.fromisoformat(ts))
        roles.append(msg["role"])

    total_messages = len(times)
    num_gaps = 0
    total_active = 0.0
    latencies = []

    for prev_idx, curr_idx in zip(range(len(times)-1), range(1, len(times))):
        dt = times[curr_idx] - times[prev_idx]
        diff_min = dt.total_seconds() / 60.0

        if diff_min > 30:
            num_gaps += 1
        else:
            total_active += diff_min

        if roles[prev_idx] == "user" and roles[curr_idx] == "assistant":
            latencies.append(dt.total_seconds())

    avg_latency = round(sum(latencies) / len(latencies), 2) if latencies else 0.0

    return {
        "total_messages": total_messages,
        "total_duration_minutes": round(total_active, 2),
        "num_gaps_over_30mins": num_gaps,
        "user_returned_after_30mins": num_gaps > 0,
        "avg_ai_latency_seconds": avg_latency
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
            model="gpt-4o", 
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
