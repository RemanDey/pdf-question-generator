/* ------------------------------------------------------------------ */
/*  Shared utilities for quiz rendering and interaction               */
/* ------------------------------------------------------------------ */

var QuizUtils = (function () {
  "use strict";

  // -- Helpers -------------------------------------------------------

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // -- Quiz card markup ----------------------------------------------

  function renderQuizCard(questionData, index) {
    var letters = Object.keys(questionData.options);
    var optionsHtml = "";
    for (var j = 0; j < letters.length; j++) {
      var letter = letters[j];
      optionsHtml +=
        '<div class="quiz-option" data-letter="' +
        letter +
        '" data-correct="' +
        questionData.correct_answer +
        '">' +
        '<span class="option-letter">' +
        letter +
        "</span>" +
        '<span class="option-text">' +
        escapeHtml(questionData.options[letter]) +
        "</span>" +
        "</div>";
    }

    return (
      '<div class="quiz-card">' +
      '<div class="quiz-question">' +
      '<span class="q-number">' +
      (index + 1) +
      ".</span> " +
      escapeHtml(questionData.question) +
      "</div>" +
      '<div class="quiz-options">' +
      optionsHtml +
      "</div>" +
      '<div class="quiz-answer">Answer: <span class="answer-value">' +
      questionData.correct_answer +
      ". " +
      escapeHtml(questionData.options[questionData.correct_answer]) +
      "</span></div>" +
      "</div>"
    );
  }

  function renderQuizContent(quizData) {
    var html = '<div class="quiz-content">';
    for (var i = 0; i < quizData.length; i++) {
      html += renderQuizCard(quizData[i], i);
    }
    html += "</div>";
    return html;
  }

  // -- Click handler setup -------------------------------------------

  function setupQuizClickHandlers(container) {
    if (!container) container = document;
    var options = container.querySelectorAll(".quiz-option");
    options.forEach(function (opt) {
      opt.addEventListener("click", function () {
        var card = opt.closest(".quiz-card");
        if (card.classList.contains("has-answered")) return;

        var letter = opt.dataset.letter;
        var correct = opt.dataset.correct;

        card.querySelectorAll(".quiz-option").forEach(function (o) {
          o.classList.remove("correct", "wrong");
        });

        if (letter === correct) {
          opt.classList.add("correct");
        } else {
          opt.classList.add("wrong");
          var correctEl = card.querySelector(
            '.quiz-option[data-letter="' + correct + '"]'
          );
          if (correctEl) correctEl.classList.add("correct");
        }

        card.classList.add("has-answered");
      });
    });
  }

  // -- Public API ----------------------------------------------------

  return {
    escapeHtml: escapeHtml,
    capitalize: capitalize,
    renderQuizCard: renderQuizCard,
    renderQuizContent: renderQuizContent,
    setupQuizClickHandlers: setupQuizClickHandlers,
  };
})();
