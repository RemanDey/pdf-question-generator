# Journey

## Inspiration

The idea for DocuQuiz came from a recurring friction point during exam preparation. I often found myself with dense PDF notes — lecture slides, textbooks, research papers — and wanted a way to test my understanding without manually crafting questions. Manually writing good MCQs is time-consuming and cognitively demanding. I wanted a tool that could ingest a document and produce a reasonable set of questions automatically, so I could focus on answering rather than authoring.

## Phase 1 — The prototype

The first version was a minimal Flask application with a single route: upload a PDF, extract text using `pypdf`, send the text to a Groq-hosted language model, and render the returned JSON as a list of questions. There was no styling, no interactivity, and no error handling. The prompt was a single sentence. It worked about 60% of the time — the model would occasionally return malformed JSON or hallucinate answers not grounded in the text.

## Phase 2 — Structure and reliability

Several issues became apparent:

1. **Fragmented output** — The model would sometimes generate only 2–3 questions instead of the requested count.
2. **Distractor quality** — Some distractors were obviously wrong or comically irrelevant.
3. **JSON instability** — The model occasionally wrapped its output in markdown code fences or added explanatory text outside the JSON array.

I addressed these by:
- Adding a structured prompt with explicit JSON schema instructions.
- Implementing a post-processing step that strips markdown fences and validates every item against a schema.
- Splitting the text into segments and generating questions in parallel, which also made the per-chunk task smaller and more focused.

## Phase 3 — Parallelization

The Groq API has rate limits and a single API key could only handle one request at a time. I configured support for up to four API keys and used `ThreadPoolExecutor` to dispatch one request per key concurrently. The text is divided into four segments, each processed independently. This reduced generation time by roughly 3–4x.

## Phase 4 — The frontend

The initial UI was a bare HTML list. I wanted the quiz to feel interactive, so I added:
- Click-to-reveal answer feedback with color coding (green for correct, red for wrong).
- A dark theme using CSS custom properties.
- A responsive layout with a collapsible hamburger menu for mobile.
- A file name indicator that appears when a PDF is selected.

## Phase 5 — Persistence and navigation

The quiz data lived only in the Flask session, which meant refreshing the page or navigating away lost it. I added:
- Client-side persistence via `localStorage` under the `docuquiz_history` key.
- A History page that reads from localStorage and lets users browse, view, or delete past quizzes.
- Server-side session storage for the most recently generated quiz (used by the Generated Questions tab).

## Phase 6 — The About page

A dedicated About page was added to document how the tool works, how to use it, and privacy considerations. It went through several rewrites — first person, then third person, with varying levels of technical depth. The final version describes the pipeline in scientific terms and replaces generic "AI" phrasing with "generative pretrained transformer" for precision.

## Technical decisions along the way

| Decision | Rationale |
|----------|-----------|
| Flask over a heavier framework | Minimal overhead; the app has two real routes |
| pypdf over PyMuPDF | Lighter dependency; sufficient for text-layer PDFs |
| Groq over OpenAI | Faster inference; Llama 3.3 70B was competitive in quality |
| ThreadPoolExecutor over async | Simpler mental model for four parallel calls |
| localStorage over a database | No user accounts; data belongs on the client |
| Four parallel workers | Matches the number of available API key slots |
| Temperature 0.7 | Balances reproducibility with creative distractor generation |

## What I would do differently

- **OCR support** — Integrating Tesseract or a cloud OCR would make the tool usable with scanned documents, which represent a large fraction of real-world PDFs.
- **Streaming responses** — The model generation can take 10–20 seconds on the slowest key. Streaming the response as tokens arrive would improve perceived performance.
- **Question deduplication** — Parallel generation occasionally produces semantically similar questions. A deduplication pass using embedding similarity would clean up the output.
- **Unit tests** — The quiz_service module in particular would benefit from tests against known text inputs.

## Closing

DocuQuiz started as a quick utility script and gradually evolved into a properly structured web application. Each phase added a layer of robustness, usability, or insight. It is not feature-complete, but it solves the original problem adequately and serves as a foundation for future work.
