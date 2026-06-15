(function () {
  var root = document.getElementById('history-root');
  if (!root) return;

  var history = JSON.parse(localStorage.getItem('docuquiz_history') || '[]');

  function renderList() {
    if (!history.length) {
      root.innerHTML = '<p class="empty-state">No quizzes saved yet. Generate one from the Upload PDF page.</p>';
      return;
    }

    var html = '<div class="history-list">';
    for (var i = 0; i < history.length; i++) {
      var entry = history[i];
      html += '<div class="history-card">';
      html += '<div class="history-meta">';
      html += '<span class="history-date">' + escapeHtml(entry.date) + '</span>';
      html += '<span class="history-info">' + entry.questionCount + ' questions &middot; ' + capitalize(entry.hardness) + '</span>';
      html += '</div>';
      html += '<button class="history-view-btn" data-index="' + i + '">View</button>';
      html += '<button class="history-delete-btn" data-index="' + i + '" title="Delete">&times;</button>';
      html += '</div>';
    }
    html += '</div>';
    root.innerHTML = html;

    root.querySelectorAll('.history-view-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        renderDetail(parseInt(this.dataset.index));
      });
    });

    root.querySelectorAll('.history-delete-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var idx = parseInt(this.dataset.index);
        history.splice(idx, 1);
        localStorage.setItem('docuquiz_history', JSON.stringify(history));
        renderList();
      });
    });
  }

  function renderDetail(index) {
    var entry = history[index];
    if (!entry) return;

    var html = '<button class="button history-back-btn">&larr; Back to History</button>';
    html += '<div class="history-detail-meta">';
    html += '<span>' + escapeHtml(entry.date) + '</span>';
    html += '<span>' + entry.questionCount + ' questions &middot; ' + capitalize(entry.hardness) + '</span>';
    html += '</div>';
    html += '<div class="quiz-content">';

    for (var i = 0; i < entry.quizData.length; i++) {
      var q = entry.quizData[i];
      html += '<div class="quiz-card">';
      html += '<div class="quiz-question"><span class="q-number">' + (i + 1) + '.</span> ' + escapeHtml(q.question) + '</div>';
      html += '<div class="quiz-options">';
      var letters = Object.keys(q.options);
      for (var j = 0; j < letters.length; j++) {
        var letter = letters[j];
        html += '<div class="quiz-option" data-letter="' + letter + '" data-correct="' + q.correct_answer + '">';
        html += '<span class="option-letter">' + letter + '</span>';
        html += '<span class="option-text">' + escapeHtml(q.options[letter]) + '</span>';
        html += '</div>';
      }
      html += '</div>';
      html += '<div class="quiz-answer">Answer: <span class="answer-value">' + q.correct_answer + '. ' + escapeHtml(q.options[q.correct_answer]) + '</span></div>';
      html += '</div>';
    }

    html += '</div>';
    root.innerHTML = html;

    root.querySelector('.history-back-btn').addEventListener('click', renderList);

    root.querySelectorAll('.quiz-option').forEach(function (opt) {
      opt.addEventListener('click', function () {
        var card = opt.closest('.quiz-card');
        if (card.classList.contains('has-answered')) return;

        var letter = opt.dataset.letter;
        var correct = opt.dataset.correct;

        card.querySelectorAll('.quiz-option').forEach(function (o) {
          o.classList.remove('correct', 'wrong');
        });

        if (letter === correct) {
          opt.classList.add('correct');
        } else {
          opt.classList.add('wrong');
          var correctEl = card.querySelector('.quiz-option[data-letter="' + correct + '"]');
          if (correctEl) correctEl.classList.add('correct');
        }

        card.classList.add('has-answered');
      });
    });
  }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  renderList();
})();
