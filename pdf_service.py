import logging

from pypdf import PdfReader, errors

logger = logging.getLogger(__name__)


def extract_text_from_pdf(pdf_path: str) -> str:
    try:
        reader = PdfReader(pdf_path)
    except errors.PdfReadError as exc:
        logger.warning("Failed to read PDF %s: %s", pdf_path, exc)
        return ""

    text_parts: list[str] = []
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text_parts.append(page_text)

    return "\n".join(text_parts)
