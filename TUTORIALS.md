# Tutorials

This document covers practical strategies for using DocuQuiz effectively across different study scenarios.

---

## 1. Generating your first quiz

The simplest workflow — suitable for quickly testing the tool or doing a rapid review of a single document.

1. Open the **Upload PDF** page.
2. Select a PDF file from your device. A text-based PDF (not a scan) works best.
3. Leave the question count at the default of 5 and difficulty at Medium.
4. Click **Generate MCQs**.
5. Once the quiz loads, click each answer option to check correctness. The correct answer will highlight green; an incorrect selection will highlight red and reveal the correct answer.
6. If the quiz meets your expectations, it is automatically saved to the **History** page. If not, adjust the difficulty or question count and regenerate.

**Best for:** First-time users testing the tool, or quick reviews of short documents (a few pages).

---

## 2. Targeted revision with difficulty levels

Different difficulty levels are suited to different stages of learning.

- **Easy** — Use this when you are encountering the material for the first time. Easy questions test direct recall: definitions, dates, named concepts, and explicitly stated facts. This helps you verify that you have absorbed the basic content.
- **Medium** — Use this after you have a foundational understanding. Medium questions require comprehension: explaining why something happens, identifying relationships between concepts, or interpreting data presented in the text.
- **Hard** — Use this for final review before an exam. Hard questions test analysis and application: evaluating competing explanations, applying a concept to a new scenario, or synthesizing ideas from different sections of the text.

**Strategy:** Generate three separate quizzes from the same PDF — one at each difficulty level — and work through them in order (Easy → Medium → Hard). This creates a natural progression from basic recall to higher-order thinking.

**Best for:** Exam preparation, textbook chapters, and dense technical papers.

---

## 3. Managing question count per PDF

The number of questions you generate should depend on the length and density of your source document.

| Document length | Recommended question count | Notes |
|----------------|---------------------------|-------|
| 1–5 pages | 5–10 | Sufficient to cover the main points without repetition. |
| 5–20 pages | 10–20 | Distributes questions across sections for broader coverage. |
| 20+ pages | 20–30 | Higher counts work well when the PDF covers multiple distinct topics. |

If the generated questions feel repetitive or clustered around a single topic, reduce the question count and try again. The model tends to focus on the most prominent concepts in the text; shorter question lists capture the highest-priority content.

**Best for:** Textbooks, lecture notes, and multi-chapter documents.

---

## 4. Using History for cumulative review

The History feature lets you accumulate quizzes over time and revisit them without regenerating.

**Workflow for semester-long use:**

1. After each lecture or study session, upload the relevant PDF and generate a quiz.
2. The quiz is automatically saved to the History page with a timestamp.
3. Before an exam, open the History page and review all saved quizzes in sequence.
4. Delete quizzes for topics you have fully mastered to keep the list focused on areas that need attention.

Since history is stored in your browser's localStorage, it persists across tabs and browser sessions on the same device. Clearing your browser data will erase it.

**Best for:** Long-term courses, cumulative exams, and spaced revision.

---

## 5. Identifying weak areas

The click-to-reveal feedback mechanism gives you immediate insight into which questions you answered correctly and which you got wrong.

**Technique:**
- After completing a quiz, note which questions you answered incorrectly.
- Check whether those questions share a common topic or section of the source PDF.
- Regenerate a quiz with a higher question count focused on that area (or upload a more specific PDF on that subtopic).

**Best for:** Diagnostic self-assessment before exams.

---

## 6. Collaborative study

DocuQuiz does not have built-in sharing, but you can still use it in a group setting.

**Options:**

- **Screen-share** — Generate a quiz on your device and share your screen during a study group session. Work through the questions together and discuss each answer.
- **Side-by-side comparison** — Two students can upload the same PDF independently and compare the generated questions. The model may produce different questions each time, giving each person a slightly different set to discuss.
- **Quiz-and-swap** — Generate a quiz, screenshot the questions (without answers), and send them to a study partner. They can answer and then check against your saved quiz in History.

**Best for:** Study groups, tutoring sessions, and peer learning.

---

## 7. Privacy-conscious use

If you are working with sensitive or confidential documents, observe the following:

- The uploaded PDF is deleted from the server immediately after the quiz is generated. It is not stored, logged, or backed up.
- The extracted text is sent to the Groq API for inference. Review Groq's privacy policy to understand how they handle inference data.
- Generated quiz data is stored in your browser's localStorage. No quiz data is transmitted to any server (the History page works entirely client-side).
- To clear all stored data, use the delete button next to individual entries in History, or clear your browser's site data.

**Best for:** Confidential research papers, proprietary documents, or any material you do not want stored on external servers.
