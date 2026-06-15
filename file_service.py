import os

from werkzeug.utils import secure_filename

ALLOWED_EXTENSIONS: set[str] = {".pdf"}


def ensure_upload_folder(upload_folder: str) -> None:
    os.makedirs(upload_folder, exist_ok=True)


def is_allowed_file(filename: str) -> bool:
    _, ext = os.path.splitext(filename.lower())
    return ext in ALLOWED_EXTENSIONS


def save_uploaded_pdf(uploaded_file, upload_folder: str) -> str:
    filename = secure_filename(uploaded_file.filename)
    file_path = os.path.join(upload_folder, filename)
    uploaded_file.save(file_path)
    return file_path


def cleanup_file(file_path: str) -> None:
    try:
        os.remove(file_path)
    except FileNotFoundError:
        pass
