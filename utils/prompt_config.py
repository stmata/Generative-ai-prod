def get_chat_prompt(tone, style, text_size):
    text_size_description = {
        "Short": "A brief response (1-5 sentences).",
        "Medium": "A balanced response (6-10 sentences).",
        "Long": "A detailed response (10+ sentences)."
    }

    text_size_info = text_size_description.get(text_size, "A balanced response (6-10 sentences).")

    system_prompt = f"""
    You are an advanced AI assistant specializing in delivering detailed, precise, and fact-based responses as well as innovative and practical project ideas.
    Your objective is to provide a comprehensive, thoroughly verified answer to the user's query by cross-referencing multiple reliable sources before finalizing your response.

    **Tone:** {tone}
    **Style:** {style}
    **Text Size Preference:** {text_size} - {text_size_info}

    **Formatting instructions:**
    - Format your final answer strictly as a JSON object:
    {{
        "answer": "Your detailed answer with each sentence separated by a newline (\\n).",
        "sources": "List of sources, each on a new line. If no valid sources are found, leave this field empty."
    }}
    - Ensure that each sentence in the answer is separated by a newline (\\n) to improve readability.
    - Separate each source with a newline (\\n).

    **Instructions:**
    -Always take into account the entire chat history to generate relevant responses.
    - Provide all essential details directly related to the query with maximum accuracy.
    - Cross-check and validate your answer using multiple authoritative and credible sources (academic papers, government websites, established news agencies, official documentation, etc.).
    - Do not include sources that are broken, unavailable, or lead to a "404 Not Found" page.
    - If a referenced source requires a login or is not publicly accessible, exclude it.
    - Ensure that the answer remains factually sound even if no sources can be included.
    - Respond in the same language as the request.
    """

    return system_prompt.strip()

def get_keyword_extraction_prompt(texts):
    """
    Génère le prompt pour extraire les thèmes principaux et leur fréquence.
    """
    return f"""
    Analyze the following texts and extract the **most frequent themes or concepts**.
    - Group similar words (e.g., "AI" and "Artificial Intelligence" should be combined).
    - Compute the relative frequency of each theme.
    - Return ONLY a **Python dictionary** in the following format:

    Expected response (example):
    {{'science fiction': 0.25, 'adventure': 0.2, 'technology': 0.15, 'space': 0.1, 'AI': 0.3}}

    Texts:
    \"\"\"{" ".join(texts)}\"\"\"
    """

def get_analysis_prompt(conversation_history, final_idea):
    """
    Génère le prompt pour analyser l'originalité, l'influence de l'assistant et le matching de l'idée finale avec la conversation.
    """

    user_messages = "\n".join(
        [f"User: {msg['content']}" for msg in conversation_history if msg["role"] == "user"]
    )
    assistant_messages = "\n".join(
        [f"Assistant: {msg['content']}" for msg in conversation_history if msg["role"] == "assistant"]
    )

    return f"""
    The following is a conversation between the user and the AI assistant.

    **User messages:**
    {user_messages}

    **Assistant messages:**
    {assistant_messages}

    **Final idea proposed by the user:**
    {final_idea}

    **Analysis requested (Must be in English):**
    1. **Determine the role of the user vs. the assistant**:
        - Did the user mainly propose ideas while the assistant only refined them?
        - Did the assistant generate most of the ideas, with the user just approving or making small edits?
        - Did the final idea emerge naturally from the conversation, or does it seem completely independent?

    2. **Evaluate originality and influence**:
        - Which parts of the final idea are completely **original** (created by the user, not suggested by the assistant)?
        - Which aspects of the final idea were **heavily influenced by the assistant**?
        - Does the final idea follow the themes discussed, or does it introduce something new?

    3. **Assess overall matching with the conversation**:
        - Does the final idea strongly match the themes discussed in the conversation?
        - Or does it introduce completely new elements that were never mentioned before?

    4. **Assign three scores (from 0.00 to 100.00)**:
        - **originality_score**: Measures how much of the final idea was originally created by the user.
            - 0.00 = The user contributed almost nothing.
            - 100.00 = The idea is fully created by the user.
        - **matching_score**: Measures how well the final idea aligns with the previous conversation.
            - 0.00 = The idea has no connection to the conversation.
            - 100.00 = The idea is a direct continuation of the discussion.
        - **assistant_influence_score**: Measures how much of the final idea was shaped by the assistant.
            - 0.00 = The assistant had no influence.
            - 100.00 = The assistant fully created the idea, and the user only approved.

    **IMPORTANT:**
    - Return ONLY a valid **Python dictionary** (NOT JSON).
    - Do NOT include explanations or extra text before/after.
    - The structure MUST be:
        {{
            'originality_score': <float between 0.00 and 100.00>,
            'matching_score': <float between 0.00 and 100.00>,
            'assistant_influence_score': <float between 0.00 and 100.00>,
            'analysis_details': {{
                'role_analysis': <Explanation of how much the user or assistant contributed>,
                'influence': <How much the final idea was shaped by the assistant>,
                'original_elements': <Which aspects are original and not AI-generated>,
                'overall_assessment': <Final judgment on originality, influence, and alignment with the conversation>
            }}
        }}
    """
