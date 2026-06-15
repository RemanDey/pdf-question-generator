import logging
import os
from dataclasses import dataclass, field

from flask import Flask, abort, render_template, request, session

import file_service
import pdf_service
import quiz_service


logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@dataclass
class AppConfig:
    secret_key: bytes = field(default_factory=lambda: os.urandom(24))
    upload_folder: str = "uploads"
    max_content_length: int = 16 * 1024 * 1024
    debug: bool = True


def create_app(config: AppConfig | None = None) -> Flask:
    if config is None:
        config = AppConfig()

    app = Flask(__name__)
    app.secret_key = config.secret_key
    app.config["UPLOAD_FOLDER"] = config.upload_folder
    app.config["MAX_CONTENT_LENGTH"] = config.max_content_length

    file_service.ensure_upload_folder(config.upload_folder)

    _register_routes(app)
    return app


def _register_routes(app: Flask) -> None:
    @app.route("/", methods=["GET"])
    def upload():
        return render_template("upload.html", active_page="upload")

    @app.route("/generate", methods=["POST"])
    def generate():
        if "pdf_file" not in request.files:
            abort(400, "No file part in the request.")

        uploaded_file = request.files["pdf_file"]
        if uploaded_file.filename == "":
            abort(400, "No file selected.")

        if not file_service.is_allowed_file(uploaded_file.filename):
            abort(400, "Invalid file type. Only PDF files are accepted.")

        file_path = file_service.save_uploaded_pdf(
            uploaded_file, app.config["UPLOAD_FOLDER"]
        )

        extracted_text = pdf_service.extract_text_from_pdf(file_path)

        if not extracted_text.strip():
            file_service.cleanup_file(file_path)
            abort(
                400,
                "Could not extract text from this PDF. "
                "It might be a scanned document or image-based PDF.",
            )

        question_count = request.form.get("question_count", 5, type=int)
        hardness = request.form.get("hardness", "medium")

        quiz_data = quiz_service.generate_mcqs(
            extracted_text, question_count=question_count, hardness=hardness
        )

        file_service.cleanup_file(file_path)

        session["quiz_data"] = quiz_data

        return render_template(
            "generated.html",
            quiz_data=quiz_data,
            active_page="generated",
            question_count=question_count,
            hardness=hardness,
        )

    @app.route("/generated", methods=["GET"])
    def generated():
        quiz_data = session.get("quiz_data")
        return render_template(
            "generated.html",
            quiz_data=quiz_data,
            active_page="generated",
            question_count=None,
            hardness=None,
        )

    @app.route("/history", methods=["GET"])
    def history():
        return render_template("history.html", active_page="history")

    @app.route("/about", methods=["GET"])
    def about():
        return render_template("about.html", active_page="about")


app = create_app()

if __name__ == "__main__":
    app.run(debug=AppConfig.debug)
