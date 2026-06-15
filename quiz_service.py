import json
import os
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Any

from groq import Groq

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

NUM_WORKERS = 4
MODEL_NAME = "llama-3.3-70b-versatile"
TEMPERATURE = 0.7

# Supported hardness levels mapped to prompt instructions.
_HARDNESS_INSTRUCTIONS: dict[str, str] = {
    "easy": (
        "Generate basic recall-level questions that test direct understanding "
        "of the text. Questions should be straightforward with answers "
        "explicitly stated in the text."
    ),
    "medium": (
        "Generate comprehension-level questions that test understanding of "
        "concepts, relationships, and implications. Questions may require "
        "connecting ideas within the text."
    ),
    "hard": (
        "Generate advanced questions that test analysis, evaluation, and "
        "synthesis. Questions should require critical thinking, inference, "
        "and applying concepts from the text."
    ),
}

_PROMPT_TEMPLATE = """\
Based on the following text, generate {count} Multiple Choice Questions (MCQs).

Difficulty: {hardness_upper}
{hardness_instruction}

Return ONLY a valid JSON array (no markdown, no code fences). \
Each object must follow this exact structure:
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

# ---------------------------------------------------------------------------
# API key management
# ---------------------------------------------------------------------------

_API_KEYS: list[str | None] = [
    os.getenv("GROQ_API_KEY_1"),
    os.getenv("GROQ_API_KEY_2"),
    os.getenv("GROQ_API_KEY_3"),
    os.getenv("GROQ_API_KEY_4"),
]
_FALLBACK_KEY: str | None = os.getenv("GROQ_API_KEY")


def _get_api_key(index: int) -> str | None:
    key = _API_KEYS[index]
    return key if key else _FALLBACK_KEY


# ---------------------------------------------------------------------------
# Text splitting
# ---------------------------------------------------------------------------


def _split_text(text: str, num_chunks: int = NUM_WORKERS) -> list[str]:
    if not text:
        return [""] * num_chunks

    chunk_size = max(1, len(text) // num_chunks)
    chunks: list[str] = []
    for i in range(num_chunks):
        start = i * chunk_size
        if i == num_chunks - 1:
            chunks.append(text[start:])
        else:
            chunks.append(text[start : start + chunk_size])
    return chunks


# ---------------------------------------------------------------------------
# Prompt building
# ---------------------------------------------------------------------------


def _build_prompt(text: str, count: int, hardness: str) -> str:
    instruction = _HARDNESS_INSTRUCTIONS.get(hardness, _HARDNESS_INSTRUCTIONS["medium"])
    return _PROMPT_TEMPLATE.format(
        count=count,
        hardness_upper=hardness.upper(),
        hardness_instruction=instruction,
        text=text,
    )


# ---------------------------------------------------------------------------
# Response parsing and validation
# ---------------------------------------------------------------------------


def _parse_and_validate_response(raw: str) -> list[dict[str, Any]]:
    cleaned = re.sub(r"^```(?:json)?\s*", "", raw.strip())
    cleaned = re.sub(r"\s*```$", "", cleaned)

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError:
        return []

    if not isinstance(data, list):
        return []

    validated: list[dict[str, Any]] = []
    for item in data:
        if (
            isinstance(item, dict)
            and "question" in item
            and "options" in item
            and "correct_answer" in item
            and isinstance(item["options"], dict)
            and len(item["options"]) > 0
        ):
            validated.append(item)
    return validated


# ---------------------------------------------------------------------------
# Groq API call
# ---------------------------------------------------------------------------


def _generate_from_chunk(
    text_chunk: str, count: int, hardness: str, api_key: str | None
) -> list[dict[str, Any]]:
    if not api_key or not text_chunk.strip():
        return []

    client = Groq(api_key=api_key)
    response = client.chat.completions.create(
        model=MODEL_NAME,
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a helpful assistant that generates educational "
                    "quizzes. Always respond with valid JSON only."
                ),
            },
            {
                "role": "user",
                "content": _build_prompt(text_chunk, count, hardness),
            },
        ],
        temperature=TEMPERATURE,
    )

    content = response.choices[0].message.content
    return _parse_and_validate_response(content or "")


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------


def generate_mcqs(
    text: str, question_count: int = 5, hardness: str = "medium"
) -> list[dict[str, Any]]:
    chunks = _split_text(text)

    base_count = question_count // NUM_WORKERS
    remainder = question_count % NUM_WORKERS

    all_questions: list[dict[str, Any]] = []

    with ThreadPoolExecutor(max_workers=NUM_WORKERS) as pool:
        futures = []
        for i in range(NUM_WORKERS):
            count = base_count + (1 if i < remainder else 0)
            futures.append(
                pool.submit(
                    _generate_from_chunk,
                    chunks[i],
                    count,
                    hardness,
                    _get_api_key(i),
                )
            )

        for future in as_completed(futures):
            all_questions.extend(future.result())

    return all_questions
