// Light/dark switch. Without a saved choice the site follows the system
// setting; flipping the switch saves the reader's choice in localStorage.
(function () {
  var root = document.documentElement;
  var btn = document.querySelector('.theme-toggle');
  if (!btn) return;
  var media = window.matchMedia('(prefers-color-scheme: dark)');
  function isDark() {
    var t = root.getAttribute('data-theme');
    return t ? t === 'dark' : media.matches;
  }
  function sync() { btn.setAttribute('aria-checked', isDark() ? 'true' : 'false'); }
  btn.hidden = false;
  sync();
  btn.addEventListener('click', function () {
    var next = isDark() ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) {}
    sync();
    document.dispatchEvent(new CustomEvent('themechange'));
  });
  media.addEventListener('change', function () { sync(); document.dispatchEvent(new CustomEvent('themechange')); });
})();
