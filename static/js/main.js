(function () {
  "use strict";

  function initFileInput() {
    var fileInput = document.querySelector('input[type=file]');
    if (!fileInput) return;

    fileInput.addEventListener('change', function () {
      var existing = document.querySelector('.file-name');
      if (existing) existing.remove();

      var file = fileInput.files && fileInput.files[0];
      if (!file) return;

      var label = document.createElement('div');
      label.className = 'file-name';
      label.textContent = file.name;
      fileInput.parentNode.insertBefore(label, fileInput.nextSibling);
    });
  }

  function initFormSubmit() {
    var form = document.getElementById('upload-form');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      var btn = e.submitter;
      if (!btn) return;
      btn.disabled = true;
      if (btn.id === 'generate-btn') {
        btn.textContent = 'Generating...';
      } else if (btn.id === 'listen-btn') {
        btn.textContent = 'Extracting...';
      }
    });
  }

  function initHamburger() {
    var hamburger = document.querySelector('.hamburger');
    var nav = document.querySelector('.main-nav');
    if (!hamburger || !nav) return;

    hamburger.addEventListener('click', function () {
      hamburger.classList.toggle('open');
      nav.classList.toggle('open');
    });

    nav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        hamburger.classList.remove('open');
        nav.classList.remove('open');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initFileInput();
    initFormSubmit();
    initHamburger();
    QuizUtils.setupQuizClickHandlers();
  });
})();
