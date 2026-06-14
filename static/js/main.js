document.addEventListener('DOMContentLoaded', function () {
  var fileInput = document.querySelector('input[type=file]');
  if (fileInput) {
    fileInput.addEventListener('change', function () {
      var existing = document.querySelector('.file-name');
      if (existing) existing.remove();

      var fileName = fileInput.files && fileInput.files[0] ? fileInput.files[0].name : '';
      if (fileName) {
        var label = document.createElement('div');
        label.className = 'file-name';
        label.textContent = fileName;
        fileInput.parentNode.insertBefore(label, fileInput.nextSibling);
      }
    });
  }

  var form = document.querySelector('form');
  if (form) {
    form.addEventListener('submit', function () {
      var btn = form.querySelector('button[type=submit]');
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Generating...';
      }
    });
  }

  var hamburger = document.querySelector('.hamburger');
  var nav = document.querySelector('.main-nav');
  if (hamburger && nav) {
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
});
