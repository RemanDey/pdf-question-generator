(function () {
  "use strict";

  var STORAGE_KEY = "docuquiz_history";
  var root = document.getElementById("history-root");
  if (!root) return;

  var history = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

  // -- List view -----------------------------------------------------

  function renderList() {
    if (!history.length) {
      root.innerHTML =
        '<p class="empty-state">No quizzes saved yet. Generate one from the Upload PDF page.</p>';
      return;
    }

    var html = '<div class="history-list">';
    for (var i = 0; i < history.length; i++) {
      var entry = history[i];
      html +=
        '<div class="history-card">' +
        '<div class="history-meta">' +
        '<span class="history-date">' +
        QuizUtils.escapeHtml(entry.date) +
        "</span>" +
        '<span class="history-info">' +
        entry.questionCount +
        " questions &middot; " +
        QuizUtils.capitalize(entry.hardness) +
        "</span>" +
        "</div>" +
        '<button class="history-view-btn" data-index="' +
        i +
        '">View</button>' +
        '<button class="history-delete-btn" data-index="' +
        i +
        '" title="Delete">&times;</button>' +
        "</div>";
    }
    html += "</div>";
    root.innerHTML = html;

    root.querySelectorAll(".history-view-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        renderDetail(parseInt(this.dataset.index, 10));
      });
    });

    root.querySelectorAll(".history-delete-btn").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var idx = parseInt(this.dataset.index, 10);
        history.splice(idx, 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
        renderList();
      });
    });
  }

  // -- Detail view ---------------------------------------------------

  function renderDetail(index) {
    var entry = history[index];
    if (!entry) return;

    var html =
      '<button class="button history-back-btn">&larr; Back to History</button>';
    html +=
      '<div class="history-detail-meta">' +
      "<span>" +
      QuizUtils.escapeHtml(entry.date) +
      "</span>" +
      "<span>" +
      entry.questionCount +
      " questions &middot; " +
      QuizUtils.capitalize(entry.hardness) +
      "</span>" +
      "</div>";
    html += QuizUtils.renderQuizContent(entry.quizData);
    root.innerHTML = html;

    root
      .querySelector(".history-back-btn")
      .addEventListener("click", renderList);

    QuizUtils.setupQuizClickHandlers(root);
  }

  // -- Bootstrap -----------------------------------------------------

  renderList();
})();
