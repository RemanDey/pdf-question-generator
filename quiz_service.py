import json
import os
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from groq import Groq

_API_KEYS = [
    os.getenv("GROQ_API_KEY_1"),
    os.getenv("GROQ_API_KEY_2"),
    os.getenv("GROQ_API_KEY_3"),
    os.getenv("GROQ_API_KEY_4"),
]
_FALLBACK = os.getenv("GROQ_API_KEY")


def _get_key(index: int) -> str:
    k = _API_KEYS[index]
    return k if k else _FALLBACK


def _split_text(text: str, n: int = 4) -> list[str]:
    if not text:
        return [""] * n
    size = max(1, len(text) // n)
    chunks = []
    for i in range(n):
        start = i * size
        if i == n - 1:
            chunks.append(text[start:])
        else:
            chunks.append(text[start:start + size])
    return chunks


def _prompt(text: str, count: int) -> str:
    return f"""
Based on the following text, generate {count} Multiple Choice Questions (MCQs).

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
{text}
"""


def _call(text_chunk: str, count: int, api_key: str) -> list:
    if not api_key or not text_chunk.strip():
        return []

    client = Groq(api_key=api_key)
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are a helpful assistant that generates educational quizzes. Always respond with valid JSON only."},
            {"role": "user", "content": _prompt(text_chunk, count)},
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


def generate_mcqs(text: str, question_count: int = 5) -> list:
    chunks = _split_text(text, 4)
    base = question_count // 4
    rem = question_count % 4

    all_questions = []
    with ThreadPoolExecutor(max_workers=4) as pool:
        futures = []
        for i in range(4):
            cnt = base + (1 if i < rem else 0)
            futures.append(pool.submit(_call, chunks[i], cnt, _get_key(i)))

        for f in as_completed(futures):
            all_questions.extend(f.result())

    return all_questions
