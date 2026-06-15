import os
from flask import Flask, render_template, request, session


import file_service
import pdf_service
import quiz_service

app = Flask(__name__)
app.secret_key = os.urandom(24)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB upload limit

file_service.ensure_upload_folder(app.config['UPLOAD_FOLDER'])


@app.route('/', methods=['GET'])
def upload():
    return render_template('upload.html', active_page='upload')


@app.route('/generate', methods=['POST'])
def generate():
    if 'pdf_file' not in request.files:
        return "No file part", 400

    file = request.files['pdf_file']
    if file.filename == '':
        return "No selected file", 400

    if file and file_service.is_allowed_file(file.filename):
        file_path = file_service.save_uploaded_pdf(file, app.config['UPLOAD_FOLDER'])

        extracted_text = pdf_service.extract_text_from_pdf(file_path)
        print("Extracted Text:", extracted_text)  # Debugging line
        if not extracted_text.strip():
            file_service.cleanup_file(file_path)
            return "Could not extract text from this PDF. It might be scanned/an image.", 400

        question_count = request.form.get('question_count', 5, type=int)
        hardness = request.form.get('hardness', 'medium')
        quiz_data = quiz_service.generate_mcqs(extracted_text, question_count=question_count, hardness=hardness)
        file_service.cleanup_file(file_path)

        session['quiz_data'] = quiz_data

        return render_template('generated.html', quiz_data=quiz_data, active_page='generated')

    return "Invalid file", 400


@app.route('/about', methods=['GET'])
def about():
    return render_template('about.html', active_page='about')


@app.route('/generated', methods=['GET'])
def generated():
    quiz_data = session.get('quiz_data')
    return render_template('generated.html', quiz_data=quiz_data, active_page='generated')


if __name__ == '__main__':
    app.run(debug=True)
