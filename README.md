# DocuQuiz

DocuQuiz is a web-based application that converts PDF documents into multiple-choice questions (MCQs) using a generative pretrained transformer. It is designed for students, educators, and self-learners who wish to transform static study material into an interactive quiz format for systematic revision and self-assessment.

The application is live at **[https://docu-quiz.onrender.com/](https://docu-quiz.onrender.com/)**.

## Architecture

The application follows a client-server architecture:

- **Backend** — A Flask web server that handles file upload, text extraction, and orchestration of the generative model.
- **Frontend** — Server-rendered HTML templates styled with CSS, augmented with client-side JavaScript for interactive quiz behavior and local storage persistence.
- **Generation layer** — The Groq API is used to interface with a large language model (Llama 3.3 70B) that performs the actual question generation. Queries are distributed across multiple API keys using a thread pool for parallel processing.

## Pipeline

The system operates as a sequential pipeline with the following stages:

### 1. File ingestion
A user submits a PDF file through the upload interface. The file is validated for acceptable format (`.pdf`) and size (maximum 16 MB) before being written to a temporary directory on the server.

### 2. Text extraction
The uploaded PDF is parsed using `pypdf` (PdfReader). Text content is extracted from each page and concatenated into a single corpus separated by newline delimiters. If the extracted string is empty or consists solely of whitespace, the request is rejected on the grounds that the PDF likely contains only rasterized content without an embedded text layer.

### 3. Corpus segmentation
The extracted text is partitioned into four contiguous segments of approximately equal length. This segmentation enables parallelized inference across multiple API endpoints, reducing total generation latency.

### 4. Prompt construction
For each segment, a structured prompt is constructed containing:
- The target question count for that segment (derived from the user-specified total, distributed as evenly as possible across the four segments).
- A hardness instruction that modulates the cognitive level of generated questions. Three levels are supported:
  - **Easy** — Recall-oriented questions with answers explicitly stated in the text.
  - **Medium** — Comprehension-oriented questions requiring connection of ideas within the text.
  - **Hard** — Analysis and evaluation-oriented questions requiring inference and critical thinking.
- The text segment itself.

The prompt instructs the model to return a valid JSON array with no markdown formatting.

### 5. Parallel inference
Four concurrent threads are dispatched via `ThreadPoolExecutor`, each invoking the Groq API with a different API key and text segment. Each thread requests a model completion from `llama-3.3-70b-versatile` with a temperature of 0.7.

### 6. Response parsing and validation
Each model response is stripped of markdown code fences (if present) and parsed with `json.loads`. Every item in the resulting array is validated against a schema requiring a `question` string, an `options` dictionary mapping letters A–D to option text, and a `correct_answer` key. Malformed items are discarded.

### 7. Rendering
The aggregated list of validated questions is passed to the Jinja2 template engine, which renders the quiz as a series of interactive cards. Each card displays the question stem, four clickable answer options, and a hidden answer panel. Client-side JavaScript handles click-to-reveal feedback: correct selections are highlighted in green, incorrect selections in red, and the correct answer is exposed automatically.

### 8. Client-side persistence
After rendering, the quiz data (questions, options, answers, question count, and difficulty level) is serialized to the browser's localStorage under the key `docuquiz_history`. A maximum of 20 entries is retained; older entries are evicted from the front of the queue. This history can be browsed, viewed in full, or deleted from the History page without any server interaction.

## Tech stack

| Component | Technology |
|-----------|-----------|
| Web framework | Flask (Python) |
| PDF parsing | pypdf (PdfReader) |
| Generative model | Llama 3.3 70B (via Groq API) |
| Concurrency | `concurrent.futures.ThreadPoolExecutor` |
| Frontend | Jinja2 templates + vanilla JavaScript |
| Styling | Custom CSS (dark theme) |
| Persistence (server) | Flask sessions (signed cookies) |
| Persistence (client) | Web Storage API (localStorage) |
| WSGI server | Gunicorn (production) |

## Setup

### Prerequisites
- Python 3.10 or later
- A Groq API key (set as environment variable `GROQ_API_KEY`; additional keys `GROQ_API_KEY_1` through `GROQ_API_KEY_4` may be configured for parallel inference)

### Installation

```bash
git clone <repository-url>
cd pdf-question-generator
pip install -r requirements.txt
```

### Configuration

Set the required environment variable:

```bash
export GROQ_API_KEY="your-groq-api-key"
```

Optionally set additional keys for parallel processing:

```bash
export GROQ_API_KEY_1="..."
export GROQ_API_KEY_2="..."
export GROQ_API_KEY_3="..."
export GROQ_API_KEY_4="..."
```

### Running

**Development:**

```bash
python3 app.py
```

The server starts on `http://127.0.0.1:5000` with debug mode enabled.

**Production:**

```bash
gunicorn app:app
```

## Usage

1. Navigate to the **Upload PDF** page.
2. Select a PDF file from your local filesystem.
3. Specify the number of questions to generate (1–30).
4. Choose a difficulty level (Easy, Medium, or Hard).
5. Click **Generate MCQs**.
6. Review the quiz interactively — click any answer to check correctness.
7. Past quizzes are accessible from the **History** tab.

## Privacy

Uploaded PDFs are processed entirely in server memory and deleted from the filesystem before the HTTP response is returned. No document content, extracted text, or generated quiz data is retained, logged, or transmitted to any third party beyond the Groq API inference call. Quiz history is stored exclusively in the browser's localStorage API and remains under the user's control.
