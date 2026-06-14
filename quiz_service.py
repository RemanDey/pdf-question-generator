import json
import os
import re
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY","gugug"))


def build_mcq_prompt(text: str, question_count: int = 5, max_context_chars: int = 4000) -> str:
    context = text[:max_context_chars]
    return f"""
Based on the following text, generate {question_count} Multiple Choice Questions (MCQs).

Return ONLY a valid JSON array (no markdown, no code fences). Each object must follow this exact structure:
{{
    "question": "The question text",
    "options": {{
        "A": "Option A text",
        "B": "Option B text",
        "C": "Option C text",
        "D": "Option D text"
    }},
    "correct_answer": "A"
}}

Text:
{context}
"""


def generate_mcqs(text: str) -> list:
    prompt = build_mcq_prompt(text)
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are a helpful assistant that generates educational quizzes. Always respond with valid JSON only."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.7,
    )

    content = response.choices[0].message.content.strip()

    content = re.sub(r'^```(?:json)?\s*', '', content)
    content = re.sub(r'\s*```$', '', content)

    try:
        data = json.loads(content)
    except json.JSONDecodeError:
        return []

    if not isinstance(data, list):
        return []

    validated = []
    for item in data:
        if isinstance(item, dict) and 'question' in item and 'options' in item and 'correct_answer' in item:
            if isinstance(item['options'], dict) and len(item['options']) > 0:
                validated.append(item)
    return validated
